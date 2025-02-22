import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AgentService } from '../../letta/features/agents/services/agent.service';
import { CreateUserAgentDto } from '../dto/user-agent.dto';
import { WebsiteScraperService } from './website-scraper.service';
import { AgentType } from '@letta-ai/letta-client/api';

@Injectable()
export class UserAgentService {
  private supabase;
  private readonly logger = new Logger(UserAgentService.name);

  constructor(
    private configService: ConfigService,
    private lettaAgentService: AgentService,
    private websiteScraperService: WebsiteScraperService
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
      // First create the Letta agent
      const systemPrompt = this.generateSystemPrompt(data);
      const lettaAgent = await this.lettaAgentService.createAgent({
        name: data.name,
        description: data.description,
        systemPrompt,
        agentType: AgentType.SOCIAL,
        isPublic: false
      });

      // Then create the user agent in Supabase
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

      // Queue website scraping if URL is provided
      if (data.websiteUrl) {
        await this.websiteScraperService.queueWebsiteScraping(agent.id, data.websiteUrl);
      }

      return agent;
    } catch (error) {
      this.logger.error('Error creating user agent:', error);
      throw error;
    }
  }

  private generateSystemPrompt(data: CreateUserAgentDto): string {
    return `You are a social media expert managing content for ${data.name}.

Industry: ${data.industry.join(', ')}
Target Audience: ${data.targetAudience.join(', ')}
Brand Personality: ${data.brandPersonality.join(', ')}

Your role is to create engaging social media content that:
1. Reflects the brand's personality traits
2. Resonates with the target audience
3. Provides value within the industry context
4. Maintains a consistent voice across all platforms

Always ensure content is professional, engaging, and aligned with the brand's values.`;
  }

  async updateAgentWithScrapedData(agentId: string, scrapedData: any) {
    try {
      // First fetch the current agent data
      const { data: currentAgent, error: fetchError } = await this.supabase
        .from('user_agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (fetchError) throw fetchError;

      // Then update with new data
      const { data: updatedAgent, error: updateError } = await this.supabase
        .from('user_agents')
        .update({
          content_preferences: {
            ...(currentAgent.content_preferences || {}),
            websiteData: scrapedData
          },
          updated_at: new Date()
        })
        .eq('id', agentId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedAgent;
    } catch (error) {
      this.logger.error('Error updating agent with scraped data:', error);
      throw error;
    }
  }
} 