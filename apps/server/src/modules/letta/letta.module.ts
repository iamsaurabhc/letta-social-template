import { Module } from '@nestjs/common';
import { AgentController } from './features/agents/controllers/agent.controller';
import { AgentService } from './features/agents/services/agent.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService]
})
export class LettaModule {}