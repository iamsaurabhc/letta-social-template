import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SourceService } from '../services/source.service';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt.guard';
import { CreateSourceDto, UpdateSourceDto } from '../dto/source.dto';

@Controller('letta/sources')
@UseGuards(JwtAuthGuard)
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Get()
  async getSources() {
    return this.sourceService.getSources();
  }

  @Get(':id')
  async getSourceById(@Param('id') id: string) {
    return this.sourceService.getSourceById(id);
  }

  @Get('name/:name')
  async getSourceByName(@Param('name') name: string) {
    return this.sourceService.getSourceByName(name);
  }

  @Post()
  async createSource(@Body() sourceData: CreateSourceDto) {
    return this.sourceService.createSource(sourceData);
  }

  @Put(':id')
  async updateSource(@Param('id') id: string, @Body() sourceData: UpdateSourceDto) {
    return this.sourceService.updateSource(id, sourceData);
  }

  @Delete(':id')
  async deleteSource(@Param('id') id: string) {
    return this.sourceService.deleteSource(id);
  }
} 