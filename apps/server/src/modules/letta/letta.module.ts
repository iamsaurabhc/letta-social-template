import { Module } from '@nestjs/common';
import { AgentController } from './features/agents/controllers/agent.controller';
import { AgentService } from './features/agents/services/agent.service';
import { SourceController } from './features/sources/controllers/source.controller';
import { SourceService } from './features/sources/services/source.service';

@Module({
  controllers: [AgentController, SourceController],
  providers: [AgentService, SourceService],
  exports: [AgentService, SourceService]
})
export class LettaModule {}