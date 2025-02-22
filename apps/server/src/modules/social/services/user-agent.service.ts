import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AgentService } from '../../letta/features/agents/services/agent.service';
import { CreateUserAgentDto } from '../dto/user-agent.dto';
import { WebsiteScraperService } from './website-scraper.service';
import { AgentType } from '@letta-ai/letta-client/api';
import { BlockService } from '../../letta/features/blocks/services/block.service';

@Injectable()
export class UserAgentService {
  private supabase;
  private readonly logger = new Logger(UserAgentService.name);

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

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createUserAgent(userId: string, data: CreateUserAgentDto) {
    try {
      // 1. First create the Letta agent with comprehensive system prompt
      const systemPrompt = this.generateSystemPrompt(data);
      const lettaAgent = await this.lettaAgentService.createAgent({
        name: data.name,
        description: data.description || `AI agent for ${data.name}`,
        systemPrompt,
        agentType: AgentType.MemgptAgent,
        isPublic: false
      });

      // 2. Create a block with agent preferences
      const block = await this.blockService.createBlock({
        value: JSON.stringify({
          industry: data.industry,
          targetAudience: data.targetAudience,
          brandPersonality: data.brandPersonality,
          contentPreferences: data.contentPreferences
        }),
        label: 'agent_preferences',
        limit: 1 // Only one preferences block needed
      });

      // 3. Attach the block to agent's core memory
      await this.lettaAgentService.attachBlockToCoreMemory(
        lettaAgent.id,
        block.id
      );

      // 4. Create user agent in Supabase with Letta agent ID
      const { data: agent, error } = await this.supabase
        .from('user_agents')
        .insert({
          user_id: userId,
          name: data.name,
          description: data.description,
          website_url: data.websiteUrl,
          industry: data.industry.join(', '),
          target_audience: data.targetAudience.join(', '),
          brand_personality: data.brandPersonality,
          content_preferences: data.contentPreferences,
          letta_agent_id: lettaAgent.id
        })
        .select()
        .single();

      if (error) throw error;

      // 5. If website URL provided, scrape and update both Supabase and Letta
      if (data.websiteUrl) {
        // Queue the scraping job which will handle both updates
        await this.websiteScraperService.queueWebsiteScraping(
          agent.id, 
          data.websiteUrl,
          lettaAgent.id
        );
      }

      return agent;
    } catch (error) {
      this.logger.error('Error creating user agent:', error);
      throw error;
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