import { Module, forwardRef } from '@nestjs/common';
import { AgentController } from './features/agents/controllers/agent.controller';
import { AgentService } from './features/agents/services/agent.service';
import { SourceController } from './features/sources/controllers/source.controller';
import { SourceService } from './features/sources/services/source.service';
import { SourceFileController } from './features/sources/controllers/source-file.controller';
import { SourceFileService } from './features/sources/services/source-file.service';
import { ToolController } from './features/tools/controllers/tool.controller';
import { ToolService } from './features/tools/services/tool.service';
import { BlockModule } from './features/blocks/block.module';
import { AgentModule } from './features/agents/agent.module';
import { BullQueueModule } from '../bull/bull.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { SocialModule } from '../social/social.module';

@Module({
  controllers: [
    AgentController,
    SourceController,
    SourceFileController,
    ToolController
  ],
  providers: [
    AgentService,
    SourceService,
    SourceFileService,
    ToolService
  ],
  imports: [
    BlockModule,
    AgentModule,
    BullQueueModule,
    SupabaseModule,
    forwardRef(() => SocialModule)
  ],
  exports: [
    AgentService,
    SourceService,
    SourceFileService,
    ToolService,
    BlockModule,
    AgentModule
  ]
})
export class LettaModule {}