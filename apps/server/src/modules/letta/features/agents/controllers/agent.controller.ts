import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AgentService } from '../services/agent.service';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt.guard';
import { CreateAgentDto, UpdateAgentDto } from '../dto/agent.dto';

@Controller('letta/agents')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  async getAgents() {
    return this.agentService.getAgents();
  }

  @Post()
  async createAgent(@Body() agentData: CreateAgentDto) {
    return this.agentService.createAgent(agentData);
  }

  @Put(':id')
  async updateAgent(@Param('id') id: string, @Body() agentData: UpdateAgentDto) {
    return this.agentService.updateAgent(id, agentData);
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    return this.agentService.deleteAgent(id);
  }

  @Get(':agentId/sources')
  async getAgentSources(@Param('agentId') agentId: string) {
    return this.agentService.getAgentSources(agentId);
  }

  @Post(':agentId/sources/:sourceId')
  async attachSource(
    @Param('agentId') agentId: string,
    @Param('sourceId') sourceId: string,
  ) {
    return this.agentService.attachSourceToAgent(agentId, sourceId);
  }

  @Delete(':agentId/sources/:sourceId')
  async detachSource(
    @Param('agentId') agentId: string,
    @Param('sourceId') sourceId: string,
  ) {
    return this.agentService.detachSourceFromAgent(agentId, sourceId);
  }
} 