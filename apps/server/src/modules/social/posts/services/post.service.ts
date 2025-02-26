import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateScheduledPostDto } from '../dto/create-scheduled-post.dto';
import { BullQueueService } from '@/modules/bull/bull-queue.service';
import { AgentService } from '@/modules/letta/features/agents/services/agent.service';
import { TwitterPostService } from '../../twitter/features/posts/services/post.service';
import { TwitterAuth } from '../../twitter/interfaces/twitter.interface';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly queueService: BullQueueService,
    private readonly lettaAgentService: AgentService,
    private readonly twitterPostService: TwitterPostService
  ) {}

  async getScheduledPosts(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await this.supabase
      .from('social_posts')
      .select('*, social_connections(platform, username)', { count: 'exact' })
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      posts: data,
      total: count,
      page,
      limit
    };
  }

  async schedulePost(createPostDto: CreateScheduledPostDto) {
    try {
      // First generate content using Letta agent
      const content = await this.lettaAgentService.generatePost({
        agentId: createPostDto.agentId,
        format: createPostDto.format,
        scheduledFor: createPostDto.scheduledFor
      });

      // Insert into social_posts table
      const { data: post, error } = await this.supabase
        .from('social_posts')
        .insert({
          content: content,
          scheduled_for: createPostDto.scheduledFor,
          agent_id: createPostDto.agentId,
          social_connection_id: createPostDto.connectionId,
          status: 'scheduled',
          format: createPostDto.format
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule the post in the queue
      await this.queueService.schedulePost('post-publisher', {
        postId: post.id,
        scheduledFor: createPostDto.scheduledFor,
        content: content,
        format: createPostDto.format
      });

      return post;
    } catch (error) {
      this.logger.error('Error scheduling post:', error);
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
      const { data: post, error } = await this.supabase
        .from('social_posts')
        .select(`
          id,
          content,
          connection_id,
          platform,
          social_connections (
            access_token,
            refresh_token,
            platform
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
          expiresAt: 0 // Twitter tokens don't expire
        };

        // Post to Twitter
        const result = await this.twitterPostService.createPost(auth, {
          text: post.content
        });

        // Update post status in database
        await this.supabase
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
      await this.supabase
        .from('social_posts')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', data.postId);

      throw error;
    }
  }
} 