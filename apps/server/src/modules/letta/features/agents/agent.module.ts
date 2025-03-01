import { Module, forwardRef } from '@nestjs/common';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';
import { SupabaseModule } from '../../../../supabase/supabase.module';
import { BullQueueModule } from '../../../bull/bull.module';
import { SocialModule } from '../../../social/social.module';

@Module({
  imports: [
    BullQueueModule,
    SupabaseModule,
    forwardRef(() => SocialModule)
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService]
})
export class AgentModule {}
