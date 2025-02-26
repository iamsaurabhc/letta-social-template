import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@upstash/workflow';
import { addMinutes } from 'date-fns';

@Injectable()
export class WorkflowService {
  private readonly client: Client;
  private readonly logger = new Logger(WorkflowService.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      token: this.configService.get('QSTASH_TOKEN')
    });
    
    this.baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001/api'
      : this.configService.get('NEXT_PUBLIC_API_URL', '/api');
  }

  async schedulePost(data: {
    postId: string;
    scheduledFor: Date;
    content: string;
    format: 'normal' | 'long_form';
  }) {
    try {
      const { workflowRunId } = await this.client.trigger({
        url: `${this.baseUrl}/posts/publish`,
        body: data,
        workflowRunId: `post-${data.postId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        flowControl: {
          key: `post-${data.postId}`,
          parallelism: 1 // Ensure only one instance runs at a time
        }
      });

      this.logger.log(`Scheduled post ${data.postId} with workflow ${workflowRunId}`);
      return workflowRunId;
    } catch (error) {
      this.logger.error(`Failed to schedule post: ${error.message}`);
      throw error;
    }
  }

  async scheduleContentGeneration(agentId: string, settings: any) {
    try {
      const dates = this.calculateNextExecutions(settings);
      
      const workflows = await Promise.all(dates.map(async (date) => {
        const { workflowRunId } = await this.client.trigger({
          url: `${this.baseUrl}/agents/generate-content`,
          body: { agentId, settings, scheduledFor: date },
          workflowRunId: `content-gen-${agentId}-${date.getTime()}`,
          headers: {
            'Content-Type': 'application/json'
          },
          flowControl: {
            key: `content-gen-${agentId}`,
            parallelism: settings.postsPerPeriod || 5,
            ratePerSecond: 0.1 // Limit to one post every 10 seconds
          }
        });
        return workflowRunId;
      }));

      this.logger.log(`Scheduled content generation for agent ${agentId}`);
      return workflows[0];
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
      // Reference existing calculateScheduleDates logic
      const { days, time } = settings.customSchedule;
      // Implementation similar to date-helpers.ts
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const [hours, minutes] = time.split(':').map(Number);

      for (const day of days) {
        const dayIndex = daysOfWeek.indexOf(day);
        let date = new Date(now);
        date.setHours(hours, minutes, 0, 0);
        
        while (date.getDay() !== dayIndex) {
          date = addMinutes(date, 24 * 60); // Add one day
        }
        dates.push(date);
      }
    } else {
      // Daily or weekly scheduling
      const interval = settings.frequency === 'weekly' ? 7 : 1;
      for (let i = 0; i < postsPerPeriod; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + (i * interval));
        dates.push(date);
      }
    }

    return dates;
  }
} 