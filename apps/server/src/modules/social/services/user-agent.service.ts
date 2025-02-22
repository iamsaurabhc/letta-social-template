import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { CreateUserAgentDto } from '../dto/user-agent.dto';

@Injectable()
export class UserAgentService {
  private supabase;
  private readonly logger = new Logger(UserAgentService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async createUserAgent(userId: string, data: CreateUserAgentDto) {
    try {
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
          letta_agent_id: '' // This will be updated later when Letta agent is created
        })
        .select()
        .single();

      if (error) throw error;
      return agent;
    } catch (error) {
      this.logger.error('Error creating user agent:', error);
      throw error;
    }
  }
} 