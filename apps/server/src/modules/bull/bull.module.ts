import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { WorkflowService } from '../workflow/workflow.service';
import { BullQueueService } from './bull-queue.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'content-generation',
      },
      {
        name: 'engagement-monitoring',
      }
    ),
  ],
  providers: [WorkflowService, BullQueueService],
  exports: [WorkflowService, BullQueueService],
})
export class BullQueueModule {} 