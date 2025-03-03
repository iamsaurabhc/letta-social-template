import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullQueueService } from './bull-queue.service';
import { queueConfig } from './bull-queues.config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          tls: configService.get('REDIS_TLS') ? {} : undefined
        }
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(...queueConfig)
  ],
  providers: [BullQueueService],
  exports: [BullQueueService, BullModule]
})
export class BullQueueModule {} 