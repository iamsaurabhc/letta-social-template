import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ToolService } from '../services/tool.service';
import { JwtAuthGuard } from '../../../../../auth/guards/jwt.guard';
import { CreateToolDto, UpdateToolDto, RunToolDto } from '../dto/tool.dto';

@Controller('letta/tools')
@UseGuards(JwtAuthGuard)
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @Get()
  async getTools() {
    return this.toolService.getTools();
  }

  @Get(':id')
  async getToolById(@Param('id') id: string) {
    return this.toolService.getToolById(id);
  }

  @Post()
  async createTool(@Body() toolData: CreateToolDto) {
    return this.toolService.createTool(toolData);
  }

  @Put(':id')
  async updateTool(@Param('id') id: string, @Body() toolData: UpdateToolDto) {
    return this.toolService.updateTool(id, toolData);
  }

  @Post('upsert')
  async upsertTool(@Body() toolData: CreateToolDto) {
    return this.toolService.upsertTool(toolData);
  }

  @Delete(':id')
  async deleteTool(@Param('id') id: string) {
    return this.toolService.deleteTool(id);
  }

  @Post('base')
  async addBaseTool() {
    return this.toolService.addBaseTool();
  }

  @Post('run')
  async runToolFromSource(@Body() toolData: RunToolDto) {
    return this.toolService.runToolFromSource(toolData);
  }

  @Get('composio/apps')
  async listComposioApps() {
    return this.toolService.listComposioApps();
  }

  @Get('composio/apps/:appName/actions')
  async listComposioActionsByApp(@Param('appName') appName: string) {
    return this.toolService.listComposioActionsByApp(appName);
  }

  @Post('composio/:actionName')
  async addComposioTool(@Param('actionName') actionName: string) {
    return this.toolService.addComposioTool(actionName);
  }
} 