import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { TwitterApiService } from '../../../services/twitter-api.service';
import { TwitterAuth, TwitterUser, TwitterTimelineTweet } from '../../../interfaces/twitter.interface';
import { SupabaseService } from '@/supabase/supabase.service';
import { AgentService } from '@/modules/letta/features/agents/services/agent.service';
import { BlockService } from '@/modules/letta/features/blocks/services/block.service';

@Injectable()
export class TwitterProfileService {
  private readonly logger = new Logger(TwitterProfileService.name);
  private readonly MAX_POSTS = 20;

  constructor(
    private readonly twitterApiService: TwitterApiService,
    private readonly supabaseService: SupabaseService,
    private readonly blockService: BlockService,
    @Inject(forwardRef(() => AgentService))
    private readonly agentService: AgentService,
  ) {}

  async getMyAccountDetails(auth: TwitterAuth): Promise<TwitterUser> {
    this.logger.log('Fetching account details');
    const response = await this.twitterApiService.makeTwitterRequest<TwitterUser>(
      '/users/me?user.fields=created_at,description,location,profile_image_url,public_metrics,verified',
      { method: 'GET' },
      auth
    );
    return response.data;
  }

  async getUserTimeline(auth: TwitterAuth, userId: string, maxResults: number = 10) {
    this.logger.log(`Fetching timeline for user: ${userId}`);
    return this.twitterApiService.makeTwitterRequest(
      `/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics`,
      { method: 'GET' },
      auth
    );
  }

  async getTweetsFromList(auth: TwitterAuth, listId: string, maxResults: number = 10) {
    this.logger.log(`Fetching tweets from list: ${listId}`);
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,attachments,text,public_metrics',
      expansions: 'author_id,attachments.media_keys',
      'user.fields': 'name,username,profile_image_url',
      'media.fields': 'type,url,preview_image_url'
    });

    return this.twitterApiService.makeTwitterRequest(
      `/lists/${listId}/tweets?${params.toString()}`,
      { method: 'GET' },
      auth
    );
  }

  async fetchAndStoreTimeline(auth: TwitterAuth, userId: string, agentId: string) {
    try {
      const params = new URLSearchParams({
        'max_results': this.MAX_POSTS.toString(),
        'tweet.fields': 'created_at,public_metrics,entities,context_annotations',
        'exclude_replies': 'false',
        'include_rts': 'true'
      });

      const response = await this.twitterApiService
        .makeTwitterRequest<TwitterTimelineTweet[]>(
          `/2/users/${userId}/tweets?${params.toString()}`,
          { method: 'GET' },
          auth
        );

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from Twitter API');
      }

      const tweets = response.data.map(tweet => ({
        user_id: auth.userId,
        agent_id: agentId,
        tweet_id: tweet.id,
        content: tweet.text,
        created_at: new Date(),
        engagement_metrics: tweet.public_metrics,
        metadata: {
          entities: tweet.entities || {},
          context_annotations: tweet.context_annotations || []
        },
        created_at_platform: new Date(tweet.created_at)
      }));

      // Store in Supabase
      const { error } = await this.supabaseService.client
        .from('twitter_timeline_entries')
        .upsert(tweets, { 
          onConflict: 'tweet_id',
          ignoreDuplicates: true 
        });

      if (error) throw error;

      // Prepare context for agent memory
      const tweetContext = tweets.map(tweet => ({
        content: tweet.content,
        engagement: tweet.engagement_metrics,
        created_at: tweet.created_at_platform,
        entities: tweet.metadata.entities,
        context_annotations: tweet.metadata.context_annotations
      }));

      const analysisData = {
        tweets: tweetContext,
        analysis: {
          total_posts: tweetContext.length,
          average_engagement: this.calculateAverageEngagement(tweetContext),
          common_topics: this.extractCommonTopics(tweetContext),
          posting_frequency: this.calculatePostingFrequency(tweetContext)
        }
      };

      // Create a new block with the timeline data
      const block = await this.blockService.createBlock({
        value: JSON.stringify(analysisData),
        label: 'twitter_timeline',
        description: 'Twitter timeline analysis and context',
        metadata: {
          updated_at: new Date().toISOString(),
          tweet_count: tweetContext.length
        }
      });

      // Attach block to agent's core memory
      await this.agentService.updateAgentCoreMemoryBlock(
        agentId,
        'twitter_timeline',
        {
          value: JSON.stringify(analysisData),
          metadata: {
            updated_at: new Date().toISOString(),
            tweet_count: tweetContext.length
          }
        }
      );

      return tweets;
    } catch (error) {
      this.logger.error('Failed to fetch and store timeline:', error);
      throw error;
    }
  }

  private calculateAverageEngagement(tweets: any[]): any {
    const totals = tweets.reduce((acc, tweet) => {
      acc.likes += tweet.engagement.like_count || 0;
      acc.retweets += tweet.engagement.retweet_count || 0;
      acc.replies += tweet.engagement.reply_count || 0;
      return acc;
    }, { likes: 0, retweets: 0, replies: 0 });

    return {
      avg_likes: Math.round(totals.likes / tweets.length),
      avg_retweets: Math.round(totals.retweets / tweets.length),
      avg_replies: Math.round(totals.replies / tweets.length)
    };
  }

  private extractCommonTopics(tweets: any[]): string[] {
    const topics = tweets.flatMap(tweet => 
      tweet.context_annotations?.map(ca => ca.domain?.name) || []
    );
    
    return [...new Set(topics)].slice(0, 5); // Return top 5 unique topics
  }

  private calculatePostingFrequency(tweets: any[]): any {
    if (tweets.length < 2) return { posts_per_day: 0, total_days: 0 };
    
    const dates = tweets.map(t => new Date(t.created_at));
    const totalDays = (dates[0].getTime() - dates[dates.length-1].getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      posts_per_day: Math.round((tweets.length / totalDays) * 100) / 100,
      total_days: Math.round(totalDays)
    };
  }
} 