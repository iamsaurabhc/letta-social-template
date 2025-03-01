import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { SupabaseService } from '../../../../supabase/supabase.service';
import { CreateScheduledPostDto } from '../dto/create-scheduled-post.dto';
import { BullQueueService } from '../../../bull/bull-queue.service';
import { AgentService } from '../../../letta/features/agents/services/agent.service';
import { TwitterAuth } from '../../twitter/interfaces/twitter.interface';
import { TwitterPostService } from '../../twitter/features/posts/services/post.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly queueService: BullQueueService,
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

      this.logger.debug('Post inserted successfully:', { post });

      // Schedule the post in the queue
      await this.queueService.schedulePost('post-publisher', {
        postId: post.id,
        scheduledFor: scheduledForDate,
        content: createPostDto.content,
        format: createPostDto.format
      });

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

      // Schedule the post in the queue
      await this.queueService.schedulePost('post-publisher', {
        postId: post.id,
        scheduledFor: data.scheduledFor,
        content: data.content,
        format: 'normal'
      });

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
} 