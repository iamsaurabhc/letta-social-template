import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SocialModule } from '../social/social.module';
import { LettaModule } from '../letta/letta.module';

@Module({
  imports: [SocialModule, LettaModule],
  providers: [SchedulerService],
  exports: [SchedulerService]
})
export class SchedulerModule {} 