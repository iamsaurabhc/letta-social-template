import { Module, forwardRef } from '@nestjs/common';
import { AgentController } from './features/agents/controllers/agent.controller';
import { AgentService } from './features/agents/services/agent.service';
import { BlockService } from './features/blocks/services/block.service';
import { SourceService } from './features/sources/services/source.service';
import { ToolService } from './features/tools/services/tool.service';
import { SocialModule } from '../social/social.module';
import { BullQueueModule } from '../bull/bull.module';

@Module({
  imports: [
    forwardRef(() => SocialModule),
    BullQueueModule
  ],
  controllers: [
    AgentController
  ],
  providers: [
    AgentService,
    BlockService,
    SourceService,
    ToolService
  ],
  exports: [
    AgentService,
    BlockService,
    SourceService,
    ToolService
  ]
})
export class LettaModule {}