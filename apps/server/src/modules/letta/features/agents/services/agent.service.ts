import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseService } from '../../../services/base.service';
import { LettaClient, LettaError } from '@letta-ai/letta-client';
import { CreateAgentDto, UpdateAgentDto } from '../dto/agent.dto';
import { CreateArchivalMemoryDto } from '../dto/archival-memory.dto';
import { ModifyBlockDto } from '../dto/core-memory.dto';

@Injectable()
export class AgentService extends BaseService {
  constructor(configService: ConfigService) {
    super(AgentService.name, configService);
  }

  async getAgents() {
    try {
      this.logger.log('Fetching agents from Letta');
      const agents = await this.lettaClient.agents.list();
      return agents;
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async createAgent(agentData: CreateAgentDto) {
    try {
      this.logger.log('Creating new agent in Letta');
      const agent = await this.lettaClient.agents.create({
        name: agentData.name,
        description: agentData.description,
        system: agentData.systemPrompt,
        agentType: agentData.agentType,
        model: agentData.model || 'openai/gpt-4',
        embedding: agentData.embedding || 'openai/text-embedding-ada-002'
      });
      return agent;
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async updateAgent(id: string, agentData: UpdateAgentDto) {
    try {
      this.logger.log(`Updating agent: ${id}`);
      const agent = await this.lettaClient.agents.modify(id, {
        name: agentData.name,
        description: agentData.description,
        system: agentData.systemPrompt
      });
      return agent;
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async deleteAgent(id: string) {
    try {
      this.logger.log(`Deleting agent: ${id}`);
      await this.lettaClient.agents.delete(id);
      return { success: true };
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  // Source Management
  async getAgentSources(agentId: string) {
    try {
      this.logger.log(`Fetching sources for agent: ${agentId}`);
      return await this.lettaClient.agents.sources.list(agentId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async attachSourceToAgent(agentId: string, sourceId: string) {
    try {
      this.logger.log(`Attaching source ${sourceId} to agent ${agentId}`);
      return await this.lettaClient.agents.sources.attach(agentId, sourceId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async detachSourceFromAgent(agentId: string, sourceId: string) {
    try {
      this.logger.log(`Detaching source ${sourceId} from agent ${agentId}`);
      return await this.lettaClient.agents.sources.detach(agentId, sourceId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  // Tool Management
  async getAgentTools(agentId: string) {
    try {
      this.logger.log(`Fetching tools for agent: ${agentId}`);
      return await this.lettaClient.agents.tools.list(agentId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async attachToolToAgent(agentId: string, toolId: string) {
    try {
      this.logger.log(`Attaching tool ${toolId} to agent ${agentId}`);
      return await this.lettaClient.agents.tools.attach(agentId, toolId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async detachToolFromAgent(agentId: string, toolId: string) {
    try {
      this.logger.log(`Detaching tool ${toolId} from agent ${agentId}`);
      return await this.lettaClient.agents.tools.detach(agentId, toolId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  // Context Management
  async getAgentContext(agentId: string) {
    try {
      this.logger.log(`Fetching context for agent: ${agentId}`);
      return await this.lettaClient.agents.context.retrieve(agentId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  // Archival Memory Management
  async getAgentArchivalMemories(agentId: string) {
    try {
      this.logger.log(`Fetching archival memories for agent: ${agentId}`);
      return await this.lettaClient.agents.archivalMemory.list(agentId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async createAgentArchivalMemory(agentId: string, memoryData: CreateArchivalMemoryDto) {
    try {
      this.logger.log(`Creating archival memory for agent: ${agentId}`);
      return await this.lettaClient.agents.archivalMemory.create(agentId, memoryData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async deleteAgentArchivalMemory(agentId: string, memoryId: string) {
    try {
      this.logger.log(`Deleting archival memory ${memoryId} from agent ${agentId}`);
      return await this.lettaClient.agents.archivalMemory.delete(agentId, memoryId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  // Core Memory Management
  async getAgentCoreMemory(agentId: string) {
    try {
      this.logger.log(`Fetching core memory for agent: ${agentId}`);
      return await this.lettaClient.agents.coreMemory.retrieve(agentId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async getAgentCoreMemoryBlock(agentId: string, blockLabel: string) {
    try {
      this.logger.log(`Fetching core memory block ${blockLabel} for agent: ${agentId}`);
      return await this.lettaClient.agents.coreMemory.retrieveBlock(agentId, blockLabel);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async updateAgentCoreMemoryBlock(agentId: string, blockLabel: string, blockData: ModifyBlockDto) {
    try {
      this.logger.log(`Updating core memory block ${blockLabel} for agent: ${agentId}`);
      return await this.lettaClient.agents.coreMemory.modifyBlock(agentId, blockLabel, blockData);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async getAgentCoreMemoryBlocks(agentId: string) {
    try {
      this.logger.log(`Fetching core memory blocks for agent: ${agentId}`);
      return await this.lettaClient.agents.coreMemory.listBlocks(agentId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async attachBlockToCoreMemory(agentId: string, blockId: string) {
    try {
      this.logger.log(`Attaching block ${blockId} to agent ${agentId} core memory`);
      return await this.lettaClient.agents.coreMemory.attachBlock(agentId, blockId);
    } catch (error) {
      this.handleLettaError(error);
    }
  }

  async detachBlockFromCoreMemory(agentId: string, blockId: string) {
    try {
      this.logger.log(`Detaching block ${blockId} from agent ${agentId} core memory`);
      return await this.lettaClient.agents.coreMemory.detachBlock(agentId, blockId);
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
      throw new InternalServerErrorException(error.message);
    }
    throw error;
  }
} 