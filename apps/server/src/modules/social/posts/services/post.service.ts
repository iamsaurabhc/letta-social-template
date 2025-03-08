import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { CreateScheduledPostDto } from '../dto/create-scheduled-post.dto';
import { AgentService } from '../../../letta/features/agents/services/agent.service';
import { TwitterAuth } from '../../twitter/interfaces/twitter.interface';
import { TwitterPostService } from '../../twitter/features/posts/services/post.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(forwardRef(() => AgentService))
    private readonly agentService: AgentService,
    private readonly twitterPostService: TwitterPostService
  ) {}

  async getScheduledPosts(page: number = 1, limit: number = 10, agentId?: string) {
    try {
      const offset = (page - 1) * limit;
      
      const query = this.supabaseService.client
        .from('social_posts')
        .select(`
          *,
          social_connections (
            platform,
            username
          ),
          user_agents (
            name
          )
        `, { count: 'exact' })
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true });

      if (agentId) {
        query.eq('agent_id', agentId);
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        this.logger.error('Error fetching scheduled posts:', error);
        throw error;
      }

      this.logger.debug('Fetched scheduled posts:', { data, count });

      return {
        posts: data || [],
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      this.logger.error('Failed to get scheduled posts:', error);
      throw error;
    }
  }

  async schedulePost(createPostDto: CreateScheduledPostDto) {
    try {
      this.logger.debug('Scheduling post with DTO:', createPostDto);

      // Validate required fields
      if (!createPostDto.agentId || !createPostDto.connectionId) {
        this.logger.error('Missing required fields:', { dto: createPostDto });
        throw new Error('Missing required fields: agentId or connectionId');
      }

      const scheduledForDate = new Date(createPostDto.scheduledFor);

      // Get platform and user_id from connection
      const { data: connection, error: connectionError } = await this.supabaseService.client
        .from('social_connections')
        .select('platform, user_id')
        .eq('id', createPostDto.connectionId)
        .single();

      if (connectionError || !connection) {
        throw new Error('Failed to fetch connection details');
      }

      // Insert into social_posts table with all required fields
      const { data: post, error } = await this.supabaseService.client
        .from('social_posts')
        .insert({
          content: createPostDto.content,
          scheduled_for: createPostDto.scheduledFor,
          agent_id: createPostDto.agentId,
          connection_id: createPostDto.connectionId,
          user_id: connection.user_id,
          platform: connection.platform,
          status: 'scheduled',
          metadata: {
            format: createPostDto.format
          }
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Database insertion error:', { error, dto: createPostDto });
        throw error;
      }

      this.logger.debug('Post scheduled successfully:', { post });
      return post;
    } catch (error) {
      this.logger.error('Error scheduling post:', {
        error: error.message,
        stack: error.stack,
        dto: createPostDto
      });
      throw error;
    }
  }

  async publishPost(data: {
    postId: string;
    content: string;
    format: 'normal' | 'long_form';
  }) {
    try {
      // Get post details from database
      const { data: post, error } = await this.supabaseService.client
        .from('social_posts')
        .select(`
          id,
          content,
          connection_id,
          platform,
          social_connections (
            access_token,
            refresh_token,
            platform,
            user_id
          )
        `)
        .eq('id', data.postId)
        .single();

      if (error || !post) {
        throw new Error(`Post not found: ${error?.message}`);
      }

      // Get auth tokens from the connection
      const connection = post.social_connections[0];
      
      // Handle Twitter posts
      if (connection.platform === 'twitter') {
        const auth: TwitterAuth = {
          accessToken: connection.access_token,
          refreshToken: connection.refresh_token,
          expiresAt: 0, // Twitter tokens don't expire
          userId: post.social_connections[0].user_id
        };

        // Post to Twitter
        const result = await this.twitterPostService.createPost(auth, {
          text: post.content
        });

        // Update post status in database
        await this.supabaseService.client
          .from('social_posts')
          .update({
            status: 'posted',
            platform_post_id: result.data.id,
            posted_at: new Date().toISOString()
          })
          .eq('id', post.id);

        this.logger.log(`Successfully published post ${post.id} to Twitter`);
        return { success: true, platformPostId: result.data.id };
      }

      throw new Error(`Unsupported platform: ${connection.platform}`);
    } catch (error) {
      this.logger.error(`Failed to publish post: ${error.message}`);
      
      // Update post status to failed
      await this.supabaseService.client
        .from('social_posts')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', data.postId);

      throw error;
    }
  }

  async getPastPosts(agentId: string, platform: string, limit: number = 10) {
    try {
      const { data: posts, error } = await this.supabaseService.client
        .from('social_posts')
        .select('*')
        .eq('agent_id', agentId)
        .eq('platform', platform)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return posts;
    } catch (error) {
      this.logger.error('Error fetching past posts:', error);
      throw error;
    }
  }

  async getPostEngagement(postIds: string[]) {
    try {
      const { data: posts, error } = await this.supabaseService.client
        .from('social_posts')
        .select('id, platform_post_id, engagement_metrics, posted_at')
        .in('id', postIds);

      if (error) throw error;

      // Format engagement data
      return posts.map(post => ({
        postId: post.id,
        platformPostId: post.platform_post_id,
        metrics: post.engagement_metrics || {},
        postedAt: post.posted_at
      }));
    } catch (error) {
      this.logger.error('Error fetching post engagement:', error);
      throw error;
    }
  }

  async createScheduledPost(data: {
    agentId: string;
    content: string;
    scheduledFor: Date;
    status: 'scheduled';
  }) {
    try {
      // Get the connection for this agent
      const { data: connection, error: connectionError } = await this.supabaseService.client
        .from('social_connections')
        .select('id, platform, user_id')
        .eq('agent_id', data.agentId)
        .single();

      if (connectionError || !connection) {
        throw new Error('No social connection found for this agent');
      }

      // Insert into social_posts table
      const { data: post, error } = await this.supabaseService.client
        .from('social_posts')
        .insert({
          content: data.content,
          scheduled_for: data.scheduledFor.toISOString(),
          agent_id: data.agentId,
          connection_id: connection.id,
          user_id: connection.user_id,
          platform: connection.platform,
          status: data.status,
          metadata: {
            format: 'normal' // Default format
          }
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Database insertion error:', { error, data });
        throw error;
      }

      this.logger.debug('Post scheduled successfully:', { post });
      return post;
    } catch (error) {
      this.logger.error('Failed to create scheduled post:', error);
      throw error;
    }
  }

  async getActiveAgentsForPosting() {
    try {
      const { data: agents, error } = await this.supabaseService.client
        .from('user_agents')
        .select(`
          *,
          social_connections!inner (
            id,
            platform,
            posting_mode,
            platform_settings
          )
        `)
        .eq('social_connections.posting_mode', 'automatic');

      if (error) throw error;
      return agents || [];
    } catch (error) {
      this.logger.error('Failed to get active agents for posting:', error);
      throw error;
    }
  }

  async publishScheduledPosts(startTime: Date, endTime: Date) {
    try {
      const { data: postsToPublish, error } = await this.supabaseService.client
        .from('social_posts')
        .select(`
          *,
          post_approvals (status),
          social_connections!inner (posting_mode)
        `)
        .eq('status', 'scheduled')
        .gte('scheduled_for', startTime.toISOString())
        .lt('scheduled_for', endTime.toISOString())
        .or(
          `and(post_approvals.status.eq.approved),
           and(social_connections.posting_mode.eq.automatic,post_approvals.status.is.null)`
        );

      if (error) throw error;

      // Process each post
      for (const post of postsToPublish) {
        try {
          await this.twitterPostService.publishPost({
            postId: post.id,
            content: post.content,
            format: post.metadata?.format || 'normal'
          });
        } catch (error) {
          // Update post status to failed
          await this.supabaseService.client
            .from('social_posts')
            .update({
              status: 'failed',
              error_message: error.message
            })
            .eq('id', post.id);
          
          this.logger.error(`Failed to publish post ${post.id}:`, error);
          continue;
        }
      }

      return postsToPublish;
    } catch (error) {
      this.logger.error('Failed to publish scheduled posts:', error);
      throw error;
    }
  }

  async getAgentsWithTwitterConnections() {
    try {
      const { data: agents, error } = await this.supabaseService.client
        .from('social_connections')
        .select(`
          id,
          platform_user_id,
          agent_id,
          user_id,
          auth,
          user_agents!inner (*)
        `)
        .eq('platform', 'twitter')
        .eq('posting_mode', 'automatic');

      if (error) throw error;
      return agents;
    } catch (error) {
      this.logger.error('Failed to get agents with Twitter connections:', error);
      throw error;
    }
  }

  async calculateEngagementMetrics(tweets: any[]) {
    try {
      const metrics = {
        likes: 0,
        retweets: 0,
        replies: 0,
        impressions: 0,
        engagement_rate: 0
      };

      if (!tweets || tweets.length === 0) {
        return metrics;
      }

      // Calculate total metrics
      tweets.forEach(tweet => {
        if (tweet.engagement) {
          metrics.likes += tweet.engagement.like_count || 0;
          metrics.retweets += tweet.engagement.retweet_count || 0;
          metrics.replies += tweet.engagement.reply_count || 0;
          metrics.impressions += tweet.engagement.impression_count || 0;
        }
      });

      // Calculate engagement rate
      const totalEngagements = metrics.likes + metrics.retweets + metrics.replies;
      metrics.engagement_rate = metrics.impressions > 0 
        ? (totalEngagements / metrics.impressions) * 100 
        : 0;

      return metrics;
    } catch (error) {
      this.logger.error('Error calculating engagement metrics:', error);
      throw error;
    }
  }

  async analyzeContentTrends(tweets: any[]) {
    try {
      if (!tweets || tweets.length === 0) {
        return {
          topHashtags: [],
          topMentions: [],
          popularityByHour: {},
          engagementTrends: {
            daily: [],
            weekly: []
          }
        };
      }

      // Extract hashtags and mentions
      const hashtags = new Map();
      const mentions = new Map();
      const hourlyDistribution = new Map();
      const dailyEngagement = new Map();

      tweets.forEach(tweet => {
        // Process hashtags
        tweet.metadata?.entities?.hashtags?.forEach(tag => {
          hashtags.set(tag.tag, (hashtags.get(tag.tag) || 0) + 1);
        });

        // Process mentions
        tweet.metadata?.entities?.mentions?.forEach(mention => {
          mentions.set(mention.username, (mentions.get(mention.username) || 0) + 1);
        });

        // Process posting time distribution
        const tweetDate = new Date(tweet.created_at);
        const hour = tweetDate.getHours();
        hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);

        // Process daily engagement
        const dateKey = tweetDate.toISOString().split('T')[0];
        const engagement = tweet.engagement 
          ? (tweet.engagement.like_count || 0) + 
            (tweet.engagement.retweet_count || 0) + 
            (tweet.engagement.reply_count || 0)
          : 0;
        
        dailyEngagement.set(dateKey, (dailyEngagement.get(dateKey) || 0) + engagement);
      });

      // Sort and format results
      const topHashtags = Array.from(hashtags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      const topMentions = Array.from(mentions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([username, count]) => ({ username, count }));

      const popularityByHour = Object.fromEntries(
        Array.from(hourlyDistribution.entries()).sort((a, b) => a[0] - b[0])
      );

      const engagementTrends = {
        daily: Array.from(dailyEngagement.entries())
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .slice(0, 7)
          .map(([date, count]) => ({ date, count })),
        weekly: this.calculateWeeklyTrends(dailyEngagement)
      };

      return {
        topHashtags,
        topMentions,
        popularityByHour,
        engagementTrends
      };
    } catch (error) {
      this.logger.error('Error analyzing content trends:', error);
      throw error;
    }
  }

  private calculateWeeklyTrends(dailyEngagement: Map<string, number>) {
    const weeklyData = new Map();
    
    Array.from(dailyEngagement.entries()).forEach(([dateStr, count]) => {
      const date = new Date(dateStr);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + count);
    });

    return Array.from(weeklyData.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 4)
      .map(([week, count]) => ({ week, count }));
  }
} 