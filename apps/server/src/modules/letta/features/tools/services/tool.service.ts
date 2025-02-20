import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LettaClient, LettaError } from '@letta-ai/letta-client';
import { CreateToolDto, UpdateToolDto, RunToolDto } from '../dto/tool.dto';

@Injectable()
export class ToolService {
  private readonly logger = new Logger(ToolService.name);
  private readonly lettaClient: LettaClient;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('LETTA_API_KEY');
    if (!apiKey) {
      throw new Error('LETTA_API_KEY is not configured');
    }
    
    this.lettaClient = new LettaClient({ token: apiKey });
  }

  async getTools() {
    try {
      this.logger.log('Fetching tools from Letta');
      return await this.lettaClient.tools.list();
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async getToolById(id: string) {
    try {
      this.logger.log(`Fetching tool: ${id}`);
      return await this.lettaClient.tools.retrieve(id);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async createTool(toolData: CreateToolDto) {
    try {
      this.logger.log('Creating new tool in Letta');
      return await this.lettaClient.tools.create(toolData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async updateTool(id: string, toolData: UpdateToolDto) {
    try {
      this.logger.log(`Updating tool: ${id}`);
      return await this.lettaClient.tools.modify(id, toolData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async upsertTool(toolData: CreateToolDto) {
    try {
      this.logger.log('Upserting tool in Letta');
      return await this.lettaClient.tools.upsert(toolData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async deleteTool(id: string) {
    try {
      this.logger.log(`Deleting tool: ${id}`);
      await this.lettaClient.tools.delete(id);
      return { success: true };
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async addBaseTool() {
    try {
      this.logger.log('Adding base tool');
      return await this.lettaClient.tools.addBaseTool();
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async runToolFromSource(toolData: RunToolDto) {
    try {
      this.logger.log('Running tool from source');
      return await this.lettaClient.tools.runToolFromSource(toolData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async listComposioApps() {
    try {
      this.logger.log('Listing Composio apps');
      return await this.lettaClient.tools.listComposioApps();
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async listComposioActionsByApp(appName: string) {
    try {
      this.logger.log(`Listing Composio actions for app: ${appName}`);
      return await this.lettaClient.tools.listComposioActionsByApp(appName);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async addComposioTool(actionName: string) {
    try {
      this.logger.log(`Adding Composio tool: ${actionName}`);
      return await this.lettaClient.tools.addComposioTool(actionName);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  private handleLettaError(error: unknown) {
    if (error instanceof LettaError) {
      this.logger.error(`Letta API error: ${error.message}`, {
        statusCode: error.statusCode,
        body: error.body
      });
      if (error.statusCode === 404) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
    throw error;
  }
} 