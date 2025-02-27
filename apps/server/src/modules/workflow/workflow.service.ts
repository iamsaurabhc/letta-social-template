import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { Client } from '@upstash/qstash';
import { addMinutes } from 'date-fns';

@Injectable()
export class WorkflowService {
  private readonly client: Client;
  private readonly logger = new Logger(WorkflowService.name);
  private readonly baseUrl: string;
  private readonly supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      token: this.configService.get('QSTASH_TOKEN')
    });

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
    
    this.baseUrl = this.configService.get('SERVER_URL', 'https://social-auto-agent.vercel.app');
  }

  async schedulePost(data: {
    postId: string;
    scheduledFor: Date;
    content: string;
    format: 'normal' | 'long_form';
  }) {
    try {
      const response = await this.client.publishJSON({
        url: `${this.baseUrl}/api/workflow/posts/publish`,
        body: data,
        retries: 3,
        flowControl: {
          key: `post-${data.postId}`,
          parallelism: 1,
          ratePerSecond: 1
        }
      });

      this.logger.log(`Scheduled post ${data.postId} with message ${response.messageId}`);
      return response.messageId;
    } catch (error) {
      this.logger.error(`Failed to schedule post: ${error.message}`);
      throw error;
    }
  }

  async scheduleContentGeneration(agentId: string, settings: any) {
    try {
      const dates = this.calculateNextExecutions(settings);
      
      const messageIds = await Promise.all(dates.map(async (date) => {
        const response = await this.client.publishJSON({
          url: `${this.baseUrl}/api/workflow/agents/generate-content`,
          body: { agentId, settings, scheduledFor: date },
          retries: 3,
          flowControl: {
            key: `content-gen-${agentId}`,
            parallelism: settings.postsPerPeriod || 5,
            ratePerSecond: 1
          }
        });
        return response.messageId;
      }));

      this.logger.log(`Scheduled content generation for agent ${agentId}`);
      return messageIds[0];
    } catch (error) {
      this.logger.error(`Failed to schedule content generation: ${error.message}`);
      throw error;
    }
  }

  private calculateNextExecutions(settings: any): Date[] {
    const dates: Date[] = [];
    const now = new Date();
    const postsPerPeriod = settings.postsPerPeriod || 5;

    if (settings.frequency === 'custom' && settings.customSchedule) {
      const { days, time } = settings.customSchedule;
      const [hours, minutes] = time.split(':').map(Number);
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      // Only schedule the next occurrence for each selected day
      for (const day of days) {
        const dayIndex = daysOfWeek.indexOf(day);
        let date = new Date(now);
        date.setHours(hours, minutes, 0, 0);
        
        // Find next occurrence of this day
        while (date.getDay() !== dayIndex || date <= now) {
          date = addMinutes(date, 24 * 60); // Add one day
        }
        dates.push(date);
      }
    } else {
      // For daily/weekly, only schedule the next post
      const interval = settings.frequency === 'weekly' ? 7 : 1;
      let nextDate = new Date(now);
      nextDate.setDate(nextDate.getDate() + interval);
      nextDate.setHours(0, 0, 0, 0); // Schedule for midnight
      dates.push(nextDate);
    }

    return dates;
  }

  async initializeSchedules() {
    try {
      // Get all active agents with triggers from database
      const { data: activeAgents, error } = await this.supabaseClient
        .from('social_connections')
        .select(`
          agent_id,
          platform_settings,
          user_agents!inner (
            id
          )
        `)
        .not('platform_settings', 'is', null)
        .eq('platform_settings->newPosts->enabled', true);
  
      if (error) throw error;
  
      // For each active agent, check and schedule if needed
      for (const agent of activeAgents) {
        const settings = agent.platform_settings.newPosts;
        
        // Check if posts are already scheduled
        const { data: scheduledPosts, error: postsError } = await this.supabaseClient
          .from('social_posts')
          .select('id')
          .eq('agent_id', agent.agent_id)
          .eq('status', 'scheduled')
          .gte('scheduled_for', new Date().toISOString());
  
        if (postsError) throw postsError;
  
        // If no scheduled posts exist, initialize scheduling
        if (!scheduledPosts?.length) {
          await this.scheduleContentGeneration(agent.agent_id, settings);
          this.logger.log(`Initialized scheduling for agent ${agent.agent_id}`);
        }
      }
  
      this.logger.log('Successfully initialized all schedules');
    } catch (error) {
      this.logger.error('Failed to initialize schedules:', error);
      throw error;
    }
  }
} 