import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AgentService } from '../services/agent.service';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt.guard';
import { CreateAgentDto, UpdateAgentDto } from '../dto/agent.dto';
import { CreateArchivalMemoryDto } from '../dto/archival-memory.dto';
import { ModifyBlockDto } from '../dto/core-memory.dto';
import { User } from '../../../../../auth/decorators/user.decorator';
import { TriggerSettingsDto } from '../../../../social/dto/trigger.dto';
import { UserEntity } from '../../../../../types/user.entity';

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

  @Get(':agentId/tools')
  async getAgentTools(@Param('agentId') agentId: string) {
    return this.agentService.getAgentTools(agentId);
  }

  @Post(':agentId/tools/:toolId')
  async attachTool(
    @Param('agentId') agentId: string,
    @Param('toolId') toolId: string,
  ) {
    return this.agentService.attachToolToAgent(agentId, toolId);
  }

  @Delete(':agentId/tools/:toolId')
  async detachTool(
    @Param('agentId') agentId: string,
    @Param('toolId') toolId: string,
  ) {
    return this.agentService.detachToolFromAgent(agentId, toolId);
  }

  @Get(':agentId/context')
  async getAgentContext(@Param('agentId') agentId: string) {
    return this.agentService.getAgentContext(agentId);
  }

  @Get(':agentId/archival-memory')
  async getAgentArchivalMemories(@Param('agentId') agentId: string) {
    return this.agentService.getAgentArchivalMemories(agentId);
  }

  @Post(':agentId/archival-memory')
  async createAgentArchivalMemory(
    @Param('agentId') agentId: string,
    @Body() memoryData: CreateArchivalMemoryDto,
  ) {
    return this.agentService.createAgentArchivalMemory(agentId, memoryData);
  }

  @Delete(':agentId/archival-memory/:memoryId')
  async deleteAgentArchivalMemory(
    @Param('agentId') agentId: string,
    @Param('memoryId') memoryId: string,
  ) {
    return this.agentService.deleteAgentArchivalMemory(agentId, memoryId);
  }

  @Get(':agentId/core-memory')
  async getAgentCoreMemory(@Param('agentId') agentId: string) {
    return this.agentService.getAgentCoreMemory(agentId);
  }

  @Get(':agentId/core-memory/blocks')
  async getAgentCoreMemoryBlocks(@Param('agentId') agentId: string) {
    return this.agentService.getAgentCoreMemoryBlocks(agentId);
  }

  @Get(':agentId/core-memory/blocks/:blockLabel')
  async getAgentCoreMemoryBlock(
    @Param('agentId') agentId: string,
    @Param('blockLabel') blockLabel: string,
  ) {
    return this.agentService.getAgentCoreMemoryBlock(agentId, blockLabel);
  }

  @Put(':agentId/core-memory/blocks/:blockLabel')
  async updateAgentCoreMemoryBlock(
    @Param('agentId') agentId: string,
    @Param('blockLabel') blockLabel: string,
    @Body() blockData: ModifyBlockDto,
  ) {
    return this.agentService.updateAgentCoreMemoryBlock(agentId, blockLabel, blockData);
  }

  @Post(':agentId/core-memory/blocks/:blockId/attach')
  async attachBlockToCoreMemory(
    @Param('agentId') agentId: string,
    @Param('blockId') blockId: string,
  ) {
    return this.agentService.attachBlockToCoreMemory(agentId, blockId);
  }

  @Delete(':agentId/core-memory/blocks/:blockId')
  async detachBlockFromCoreMemory(
    @Param('agentId') agentId: string,
    @Param('blockId') blockId: string,
  ) {
    return this.agentService.detachBlockFromCoreMemory(agentId, blockId);
  }

  @Post(':id/triggers')
  async saveTriggers(
    @Param('id') agentId: string,
    @Body() triggerData: TriggerSettingsDto,
    @User() user: UserEntity
  ) {
    return this.agentService.saveTriggers(agentId, triggerData, user.id);
  }
} 