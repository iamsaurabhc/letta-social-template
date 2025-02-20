import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AgentService } from '../services/agent.service';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt.guard';

@Controller('letta/agents')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  async getAgents() {
    return this.agentService.getAgents();
  }

  @Post()
  async createAgent(@Body() agentData: any) {
    return this.agentService.createAgent(agentData);
  }

  @Put(':id')
  async updateAgent(@Param('id') id: string, @Body() agentData: any) {
    return this.agentService.updateAgent(id, agentData);
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    return this.agentService.deleteAgent(id);
  }
} 