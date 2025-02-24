import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AgentService } from '../../letta/features/agents/services/agent.service';
import { CreateUserAgentDto } from '../dto/user-agent.dto';
import { WebsiteScraperService } from './website-scraper.service';
import { AgentType } from '@letta-ai/letta-client/api';
import { BlockService } from '../../letta/features/blocks/services/block.service';
import { setTimeout } from 'timers/promises';

@Injectable()
export class UserAgentService {
  private supabase;
  private readonly logger = new Logger(UserAgentService.name);
  private readonly SUPABASE_TIMEOUT = 10000; // 10 seconds

  constructor(
    private configService: ConfigService,
    private lettaAgentService: AgentService,
    private websiteScraperService: WebsiteScraperService,
    private blockService: BlockService
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public'
      }
    });
  }

  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = setTimeout(timeoutMs).then(() => {
      throw new Error(`Operation timed out after ${timeoutMs}ms`);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  async createUserAgent(userId: string, data: CreateUserAgentDto) {
    let lettaAgent;
    let block;

    try {
      this.logger.log('Starting user agent creation process');
      
      // First check if agent already exists
      const { data: existingAgent, error: fetchError } = await this.supabase
        .from('user_agents')
        .select('*')
        .eq('user_id', userId)
        .eq('name', data.name)
        .single();

      if (existingAgent) {
        this.logger.log('Agent already exists, using existing agent:', existingAgent.id);
        
        // Make scraping non-blocking
        if (data.websiteUrl) {
          this.logger.log('Queueing website scraping for existing agent...');
          this.websiteScraperService.queueWebsiteScraping(
            existingAgent.id,
            data.websiteUrl,
            existingAgent.letta_agent_id
          ).catch(error => {
            this.logger.error('Failed to queue website scraping:', error);
          });
        }
        
        return existingAgent;
      }

      // Continue with normal creation flow if agent doesn't exist
      this.logger.log('Starting user agent creation process');
      
      this.logger.debug('Input data:', data);

      // 1. Create Letta agent
      this.logger.log('Creating Letta agent...');
      const systemPrompt = this.generateSystemPrompt(data);
      lettaAgent = await this.lettaAgentService.createAgent({
        name: data.name,
        description: data.description || `AI agent for ${data.name}`,
        systemPrompt,
        agentType: AgentType.MemgptAgent,
        isPublic: false
      });
      this.logger.log('Letta agent created successfully:', lettaAgent.id);

      // 2. Create preferences block
      this.logger.log('Creating preferences block...');
      const preferencesData = {
        industry: data.industry,
        targetAudience: data.targetAudience,
        brandPersonality: data.brandPersonality,
        contentPreferences: data.contentPreferences
      };
      
      block = await this.blockService.createBlock({
        value: JSON.stringify(preferencesData),
        label: 'agent_preferences',
        description: 'Agent preferences and configuration'
      });
      this.logger.log('Preferences block created successfully:', block.id);

      // 3. Attach block to core memory
      await this.lettaAgentService.attachBlockToCoreMemory(
        lettaAgent.id,
        block.id
      );
      this.logger.log('Block attached successfully');

      // 4. Create Supabase record with timeout
      this.logger.log('Creating Supabase user agent record...');
      const supabasePromise = this.supabase
        .from('user_agents')
        .insert({
          user_id: userId,
          name: data.name,
          description: data.description,
          website_url: data.websiteUrl,
          industry: data.industry.join(', '),
          target_audience: data.targetAudience,
          brand_personality: data.brandPersonality,
          content_preferences: {
            ...data.contentPreferences,
            updatedAt: new Date().toISOString()
          },
          letta_agent_id: lettaAgent.id
        })
        .select()
        .single();

      const { data: agent, error } = await this.executeWithTimeout<{
        data: any;
        error: any;
      }>(supabasePromise, this.SUPABASE_TIMEOUT);

      if (error) {
        throw error;
      }

      // 5. Queue website scraping if URL provided
      if (data.websiteUrl) {
        this.logger.log('Queueing website scraping...');
        await this.websiteScraperService.queueWebsiteScraping(
          agent.id,
          data.websiteUrl,
          lettaAgent.id
        );
      }

      return agent;

    } catch (error) {
      this.logger.error('Error during agent creation:', error);

      // Cleanup in reverse order
      try {
        if (block?.id) {
          await this.blockService.deleteBlock(block.id);
          this.logger.log('Cleaned up block');
        }
        
        if (lettaAgent?.id) {
          await this.lettaAgentService.deleteAgent(lettaAgent.id);
          this.logger.log('Cleaned up Letta agent');
        }
      } catch (cleanupError) {
        this.logger.error('Error during cleanup:', cleanupError);
      }

      throw new InternalServerErrorException('Failed to create agent');
    }
  }

  async updateAgentWithScrapedData(agentId: string, scrapedData: any, lettaAgentId: string) {
    try {
      // Update Supabase agent
      const { data: currentAgent, error: fetchError } = await this.supabase
        .from('user_agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await this.supabase
        .from('user_agents')
        .update({
          content_preferences: {
            ...(currentAgent.content_preferences || {}),
            websiteData: scrapedData
          },
          updated_at: new Date()
        })
        .eq('id', agentId);

      if (updateError) throw updateError;

      // Format scraped data as text
      const formattedText = `
            Website Content:
            Title: ${scrapedData.title}
            Description: ${scrapedData.description || 'N/A'}
            Keywords: ${scrapedData.keywords || 'N/A'}
            Main Content: ${scrapedData.mainContent}
      `.trim();

      // Add website content to agent's archival memory
      await this.lettaAgentService.createAgentArchivalMemory(
        lettaAgentId,
        {
          text: formattedText,
          collections: ['website_content']
        }
      );

      return currentAgent;
    } catch (error) {
      this.logger.error('Error updating agent with scraped data:', error);
      throw error;
    }
  }

  private generateSystemPrompt(data: CreateUserAgentDto): string {
    const brandPersonalityTraits = data.brandPersonality.map(trait => `- ${trait}`).join('\n');
    const industryContext = data.industry.map(ind => `- ${ind}`).join('\n');
    const audienceSegments = data.targetAudience.map(audience => `- ${audience}`).join('\n');

    return `You are an AI social media expert managing content for ${data.name}.

    BRAND PROFILE:
    ${data.description ? `Description: ${data.description}\n` : ''}
    Industry Focus:
    ${industryContext}

    Target Audience Segments:
    ${audienceSegments}

    Brand Personality Traits:
    ${brandPersonalityTraits}

    ROLE AND RESPONSIBILITIES:
    1. Create engaging social media content that:
    - Embodies each brand personality trait
    - Speaks directly to defined target audience segments
    - Demonstrates industry expertise and authority
    - Maintains consistent brand voice across platforms

    2. Content Guidelines:
    - Adapt tone and style to match brand personality
    - Use industry-specific terminology appropriately
    - Address audience pain points and interests
    - Create platform-specific content formats

    3. Content Strategy:
    - Balance educational, promotional, and engaging content
    - Incorporate industry trends and news
    - Maintain brand voice consistency
    - Focus on audience value and engagement

    Always ensure all content aligns with:
    - Brand personality traits
    - Target audience preferences
    - Industry context and standards
    - Platform-specific best practices`;
  }
} 