import { Injectable, Logger } from '@nestjs/common';
import { TwitterApiService } from '../../../services/twitter-api.service';
import { TwitterAuth, TwitterUser, TwitterTimelineTweet } from '../../../interfaces/twitter.interface';
import { SupabaseService } from '@/supabase/supabase.service';

@Injectable()
export class TwitterProfileService {
  private readonly logger = new Logger(TwitterProfileService.name);

  constructor(
    private readonly twitterApiService: TwitterApiService,
    private readonly supabaseService: SupabaseService
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
        'max_results': '100',
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

      const { error } = await this.supabaseService.client
        .from('twitter_timeline_entries')
        .upsert(tweets, { 
          onConflict: 'tweet_id',
          ignoreDuplicates: true 
        });

      if (error) throw error;

      return tweets;
    } catch (error) {
      this.logger.error('Failed to fetch and store timeline:', error);
      throw error;
    }
  }
} 