import { Module } from '@nestjs/common';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';
import { SupabaseModule } from '../../../../supabase/supabase.module';
import { BullQueueModule } from '../../../bull/bull.module';

@Module({
  imports: [
    BullQueueModule,
    SupabaseModule
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService]
})
export class AgentModule {}
