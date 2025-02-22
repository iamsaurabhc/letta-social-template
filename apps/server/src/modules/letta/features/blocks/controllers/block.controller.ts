import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BlockService } from '../services/block.service';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt.guard';
import { CreateBlockDto, UpdateBlockDto } from '../dto/block.dto';
import { Letta } from '@letta-ai/letta-client';

@Controller('letta/blocks')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  async getBlocks() {
    return this.blockService.getBlocks();
  }

  @Get(':id')
  async getBlockById(@Param('id') id: string) {
    return this.blockService.getBlockById(id);
  }

  @Post()
  async createBlock(@Body() blockData: CreateBlockDto) {
    return this.blockService.createBlock(blockData);
  }

  @Put(':id')
  async updateBlock(@Param('id') id: string, @Body() blockData: Letta.CreateBlock) {
    return this.blockService.updateBlock(id, blockData);
  }

  @Delete(':id')
  async deleteBlock(@Param('id') id: string) {
    return this.blockService.deleteBlock(id);
  }

  @Get(':blockId/agents')
  async getBlockAgents(@Param('blockId') blockId: string) {
    return this.blockService.getBlockAgents(blockId);
  }
} 