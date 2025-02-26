import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkflowService } from '../workflow/workflow.service';
import { BullQueueService } from './bull-queue.service';

@Module({
  imports: [],
  providers: [WorkflowService, BullQueueService],
  exports: [WorkflowService, BullQueueService],
})
export class BullQueueModule {} 