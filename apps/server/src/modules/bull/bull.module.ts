import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { BullQueueService } from './bull-queue.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'content-generation',
      },
      {
        name: 'engagement-monitoring',
      },
      {
        name: 'post-publisher',
      }
    ),
  ],
  providers: [BullQueueService],
  exports: [BullQueueService],
})
export class BullQueueModule {} 