import { Module } from '@nestjs/common';
import { AgentController } from './features/agents/controllers/agent.controller';
import { AgentService } from './features/agents/services/agent.service';
import { SourceController } from './features/sources/controllers/source.controller';
import { SourceService } from './features/sources/services/source.service';
import { SourceFileController } from './features/sources/controllers/source-file.controller';
import { SourceFileService } from './features/sources/services/source-file.service';
import { ToolController } from './features/tools/controllers/tool.controller';
import { ToolService } from './features/tools/services/tool.service';

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
  exports: [
    AgentService,
    SourceService,
    SourceFileService,
    ToolService
  ]
})
export class LettaModule {}