import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class BullQueueService {
  private readonly logger = new Logger(BullQueueService.name);

  constructor(
    @InjectQueue('content-generation') private contentGenerationQueue: Queue,
    @InjectQueue('engagement-monitoring') private engagementMonitoringQueue: Queue,
  ) {}

  async scheduleCustom(queueName: string, data: any, schedule: { days: string[], time: string, postsPerPeriod?: number }) {
    const queue = this.getQueue(queueName);
    const [hours, minutes] = schedule.time.split(':');
    
    // Create cron pattern for specific days and time
    const cronDays = schedule.days.map(day => day.substring(0, 3)).join(',');
    const cronPattern = `${minutes} ${hours} * * ${cronDays}`;
    
    // Add postsPerPeriod to the data
    const jobData = {
      ...data,
      postsPerPeriod: schedule.postsPerPeriod || 5
    };
    
    await queue.add(jobData, {
      repeat: {
        cron: cronPattern
      }
    });
  }

  async scheduleRecurring(queueName: string, data: any, frequency: string, postsPerPeriod: number = 5) {
    const queue = this.getQueue(queueName);
    let repeat: any = {};

    switch (frequency) {
      case 'hourly':
        repeat = { cron: '0 * * * *' };
        break;
      case 'daily':
        repeat = { cron: '0 9 * * *' }; // 9 AM every day
        break;
      case 'weekly':
        repeat = { cron: '0 9 * * 1' }; // 9 AM every Monday
        break;
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }

    // Add postsPerPeriod to the data
    const jobData = {
      ...data,
      postsPerPeriod
    };

    await queue.add(jobData, { repeat });
  }

  private getQueue(name: string): Queue {
    switch (name) {
      case 'content-generation':
        return this.contentGenerationQueue;
      case 'engagement-monitoring':
        return this.engagementMonitoringQueue;
      default:
        throw new Error(`Queue ${name} not found`);
    }
  }
} 