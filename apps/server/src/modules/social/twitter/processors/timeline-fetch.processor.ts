import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TwitterProfileService } from '../features/profile/services/profile.service';
import { SupabaseService } from '../../../../supabase/supabase.service';

@Processor('twitter-timeline')
export class TwitterTimelineFetchProcessor {
  private readonly logger = new Logger(TwitterTimelineFetchProcessor.name);

  constructor(
    private readonly profileService: TwitterProfileService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Process('fetch')
  async handleTimelineFetch(job: Job) {
    try {
      const { userId, agentId, auth } = job.data;

      await this.profileService.fetchAndStoreTimeline(auth, auth.userId, agentId);

      // Update social connection with timeline status
      await this.supabaseService.client
        .from('social_connections')
        .update({ 
          timeline_synced: true,
          timeline_synced_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .eq('platform', 'twitter');

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to fetch timeline:', error);
      throw error;
    }
  }
} 