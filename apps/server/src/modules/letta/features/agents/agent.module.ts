import { Module } from '@nestjs/common';
import { AgentController } from './controllers/agent.controller';
import { AgentService } from './services/agent.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService]
})
export class AgentModule {}
