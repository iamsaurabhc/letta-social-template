import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseService } from '../../../services/base.service';
import { LettaClient, LettaError } from '@letta-ai/letta-client';
import { CreateAgentDto, UpdateAgentDto } from '../dto/agent.dto';
import { CreateArchivalMemoryDto } from '../dto/archival-memory.dto';
import { ModifyBlockDto } from '../dto/core-memory.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import { TriggersDto, TriggerSettingsDto } from '../../../../social/dto/trigger.dto';
import { BullQueueService } from '../../../../bull/bull-queue.service';

@Injectable()
export class AgentService extends BaseService {
  private readonly supabaseClient: SupabaseClient;

  constructor(
    configService: ConfigService,
    private readonly queueService: BullQueueService
  ) {
    super(AgentService.name, configService);
    
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabaseClient = new SupabaseClient(supabaseUrl, supabaseKey);
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

  async saveTriggers(agentId: string, triggerData: TriggerSettingsDto, userId: string) {
    try {
      this.logger.log(`Saving triggers for agent ${agentId}`);
      
      // First verify agent ownership
      const { data: agent, error: agentError } = await this.supabaseClient
        .from('user_agents')
        .select('id')
        .eq('id', agentId)
        .eq('user_id', userId)
        .single();
  
      if (agentError || !agent) {
        this.logger.error(`Agent not found or unauthorized: ${agentError?.message}`);
        throw new NotFoundException('Agent not found or unauthorized');
      }
  
      // Update social connections with new trigger settings
      this.logger.log('Updating social connections with trigger settings');
      const { error: updateError } = await this.supabaseClient
        .from('social_connections')
        .update({
          posting_mode: triggerData.postingMode,
          platform_settings: triggerData.triggers
        })
        .eq('agent_id', agentId)
        .eq('user_id', userId);
  
      if (updateError) {
        this.logger.error(`Error updating social connections: ${updateError.message}`);
        throw updateError;
      }
  
      // Schedule automation jobs based on trigger settings in a non-blocking way
      this.scheduleAutomationJobs(agentId, triggerData.triggers)
        .catch(error => {
          this.logger.error(`Error scheduling automation jobs: ${error.message}`);
          // Don't throw here, we still want to return success if the DB was updated
        });
  
      this.logger.log('Triggers saved successfully');
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to save triggers: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  // New method to handle scheduling in a non-blocking way
  private async scheduleAutomationJobs(agentId: string, triggers: TriggersDto) {
    try {
      // Schedule content generation if enabled
      if (triggers.newPosts?.enabled) {
        try {
          await this.scheduleContentGeneration(agentId, triggers.newPosts);
          this.logger.log(`Content generation scheduled for agent ${agentId}`);
        } catch (error) {
          this.logger.error(`Failed to schedule content generation: ${error.message}`);
        }
      }
  
      // Schedule engagement monitoring if enabled
      if (triggers.engagement?.enabled) {
        try {
          await this.scheduleEngagementMonitoring(agentId, triggers.engagement);
          this.logger.log(`Engagement monitoring scheduled for agent ${agentId}`);
        } catch (error) {
          this.logger.error(`Failed to schedule engagement monitoring: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in scheduleAutomationJobs: ${error.message}`);
      throw error;
    }
  }

  private async scheduleContentGeneration(agentId: string, settings: any) {
    try {
      const jobData = {
        agentId,
        settings,
        type: 'content_generation'
      };
  
      // Validate the frequency and settings
      if (settings.frequency === 'custom' && settings.customSchedule && 
          settings.customSchedule.days && settings.customSchedule.days.length > 0 && 
          settings.customSchedule.time) {
        // Schedule for specific days and times
        this.logger.log(`Scheduling custom content generation for agent ${agentId}`);
        await this.queueService.scheduleCustom('content-generation', jobData, {
          days: settings.customSchedule.days,
          time: settings.customSchedule.time,
          postsPerPeriod: settings.postsPerPeriod || 5 // Default to 5 if not specified
        });
      } else {
        // Use the specified frequency or default to daily
        const frequency = ['daily', 'weekly'].includes(settings.frequency) ? settings.frequency : 'daily';
        this.logger.log(`Scheduling ${frequency} content generation for agent ${agentId}`);
        await this.queueService.scheduleRecurring('content-generation', jobData, frequency, settings.postsPerPeriod || 5);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error in scheduleContentGeneration: ${error.message}`);
      throw error;
    }
  }

  private async scheduleEngagementMonitoring(agentId: string, settings: any) {
    const jobData = {
      agentId,
      settings,
      type: 'engagement_monitoring'
    };

    // Engagement monitoring runs more frequently
    await this.queueService.scheduleRecurring('engagement-monitoring', jobData, 'hourly');
  }
} 