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
import { AssistantMessage } from '@letta-ai/letta-client/api';

@Injectable()
export class AgentService extends BaseService {
  private readonly supabaseClient: SupabaseClient;
  private readonly MAX_ATTEMPTS = 30; // 30 attempts with 1 second delay = 30 seconds timeout

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
        model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
        embedding: 'hugging-face/letta-free',
        llmConfig: {
          temperature: 0.7,
          maxTokens: 2000,
          contextWindow: 4096,
          modelEndpointType: 'together',
          model: 'deepseek-coder-33b-instruct'
        }
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

  private sanitizePromptData(data: any): string {
    this.logger.debug('Sanitizing data:', {
      type: typeof data,
      isArray: Array.isArray(data),
      rawValue: data
    });

    if (!data) {
      this.logger.debug('Empty data, returning empty string');
      return '';
    }

    if (Array.isArray(data)) {
      const sanitizedArray = data.map(item => this.sanitizePromptData(item));
      this.logger.debug('Sanitized array:', sanitizedArray);
      return sanitizedArray.join(', ');
    }

    const stringified = String(data);
    const sanitized = stringified.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    if (stringified !== sanitized) {
      this.logger.debug('Found and removed control characters:', {
        before: stringified,
        after: sanitized,
        removedChars: stringified.split('').filter(char => sanitized.indexOf(char) === -1)
      });
    }

    return sanitized;
  }

  async generatePost(params: {
    agentId: string;
    format: 'normal' | 'long_form';
    scheduledFor: Date;
  }) {
    try {
      this.logger.log(`Starting post generation for agent ${params.agentId}`);
      
      // Log raw agent data before sanitization
      const { data: agent, error } = await this.supabaseClient
        .from('user_agents')
        .select(`
          id,
          letta_agent_id,
          content_preferences,
          industry,
          target_audience,
          brand_personality
        `)
        .eq('id', params.agentId)
        .single();

      this.logger.debug('Raw agent data:', JSON.stringify(agent, null, 2));

      if (error || !agent) {
        this.logger.error(`Error fetching agent: ${error?.message}`);
        throw new NotFoundException('Agent not found');
      }

      // Log each field before sanitization
      this.logger.debug('Pre-sanitization values:', {
        industry: agent.industry,
        targetAudience: agent.target_audience,
        brandPersonality: agent.brand_personality,
        contentPreferences: agent.content_preferences,
        format: params.format
      });

      // Sanitize all input data
      const industry = this.sanitizePromptData(agent.industry);
      const targetAudience = this.sanitizePromptData(agent.target_audience);
      const brandPersonality = this.sanitizePromptData(agent.brand_personality);
      const style = this.sanitizePromptData(agent.content_preferences?.style) || 'professional';
      const format = this.sanitizePromptData(params.format);

      // Log sanitized values
      this.logger.debug('Post-sanitization values:', {
        industry,
        targetAudience,
        brandPersonality,
        style,
        format
      });

      // Build prompt parts separately for debugging
      const promptParts = [
        `As a social media content creator for a ${industry} business, create a ${format} post.`,
        '',
        `Target Audience: ${targetAudience}`,
        `Brand Personality: ${brandPersonality}`,
        `Style: ${style}`,
        `Format Requirements: ${format === 'normal' ? 'Create a concise post under 280 characters' : 'Create a detailed long-form post'}`,
        `Post Time: ${params.scheduledFor.toISOString()}`,
        '',
        'Generate a single, engaging post that resonates with our audience while maintaining our brand voice.'
      ];

      // Log each prompt part separately
      this.logger.debug('Prompt parts:', promptParts);

      const prompt = promptParts.join('\n');

      // Log final prompt
      this.logger.debug('Final prompt:', {
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 100) + '...',
        promptBytes: Buffer.from(prompt).length
      });

      this.logger.log('Starting async generation with Letta');
      const run = await this.lettaClient.agents.messages.createAsync(agent.letta_agent_id, {
        messages: [{
          role: 'user',
          content: prompt
        }],
      });

      this.logger.log(`Created Letta run with ID: ${run.id}`);

      let content: string | null = null;
      let attempts = 0;
      
      while (attempts < this.MAX_ATTEMPTS) {
        const runStatus = await this.lettaClient.runs.retrieveRun(run.id!);
        this.logger.debug(`Run status check ${attempts + 1}/${this.MAX_ATTEMPTS}: ${runStatus.status}`);
        
        if (runStatus.status === 'completed') {
          try {
            content = await this.processRunMessages(run.id!);
            if (!content) {
              throw new Error('No content generated');
            }
            break;
          } catch (error) {
            this.logger.error('Error processing run messages:', error);
            throw error;
          }
        } else if (runStatus.status === 'failed') {
          this.logger.error('Run failed with status:', JSON.stringify(runStatus, null, 2));
          throw new Error(`Content generation failed with status: ${runStatus.status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!content) {
        throw new Error('Content generation timed out or no content was generated');
      }

      const formattedContent = this.formatGeneratedContent(content, params.format);
      this.logger.log(`Successfully generated ${params.format} post for agent ${params.agentId}`);
      
      return formattedContent;

    } catch (error) {
      this.logger.error('Failed to generate post:', {
        error: error.message,
        stack: error.stack,
        agentId: params.agentId,
        format: params.format
      });
      throw error;
    }
  }

  private formatGeneratedContent(content: string, format: 'normal' | 'long_form'): string {
    try {
      // Basic cleaning
      let cleanContent = content.trim();
      
      if (format === 'normal') {
        // For normal posts: remove newlines and truncate
        return cleanContent
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 280);
      }
      
      // For long-form: preserve structure but ensure clean paragraphs
      return cleanContent
        .split(/\n\s*\n/)
        .map(para => para.trim())
        .filter(para => para.length > 0)
        .join('\n\n');
        
    } catch (error) {
      this.logger.error('Error formatting content:', {
        error: error.message,
        contentLength: content?.length,
        format
      });
      throw new Error('Failed to format generated content');
    }
  }

  private async processRunMessages(runId: string): Promise<string> {
    try {
      this.logger.log('Processing run messages for runId:', runId);
      
      let messages;
      try {
        messages = await this.lettaClient.runs.listRunMessages(runId, { order: 'asc' });
      } catch (apiError) {
        // If it's a JSON parsing error, try to extract the content directly
        if (apiError.statusCode === 400 && apiError.response?.detail?.includes('Invalid control character')) {
          const rawResponse = apiError.body;
          
          // Try to extract content using a more robust regex pattern
          const contentPattern = /\"content\":\s*\"((?:\\.|[^"\\])*)\"/;
          const match = rawResponse.match(contentPattern);
          
          if (match && match[1]) {
            // Properly unescape the content
            const content = match[1]
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
              
            return this.sanitizePromptData(content);
          }
          
          // If direct content extraction fails, try function arguments
          const argsPattern = /\"arguments\":\s*\"((?:\\.|[^"\\])*)\"/;
          const argsMatch = rawResponse.match(argsPattern);
          
          if (argsMatch && argsMatch[1]) {
            const args = argsMatch[1]
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
              
            try {
              const parsed = JSON.parse(args);
              if (parsed.message) {
                return this.sanitizePromptData(parsed.message);
              }
            } catch {
              return this.sanitizePromptData(args);
            }
          }
        }
        
        this.logger.error('Failed to process API response:', {
          error: apiError.message,
          statusCode: apiError.statusCode,
          response: apiError.body
        });
        throw new Error(`Failed to fetch run messages: ${apiError.message}`);
      }

      const assistantMessage = messages.find(m => m.messageType === 'assistant_message') as AssistantMessage;
      if (!assistantMessage?.content) {
        throw new Error('No valid content found in assistant message');
      }

      const content = typeof assistantMessage.content === 'string' 
        ? assistantMessage.content 
        : JSON.stringify(assistantMessage.content);

      return this.sanitizePromptData(content);

    } catch (error) {
      this.logger.error('Error processing run messages:', {
        error: error.message,
        runId,
        errorDetails: error
      });
      throw new Error('Failed to process generated content');
    }
  }
} 