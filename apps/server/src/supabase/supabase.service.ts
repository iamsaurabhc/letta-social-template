import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabaseClient: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public'
      }
    });
  }

  // Public method to get Supabase client
  get client(): SupabaseClient {
    return this.supabaseClient;
  }

  async getAgentStatus(userId: string) {
    try {
      const { data: agent, error } = await this.supabaseClient
        .from('user_agents')
        .select(`
          id,
          name,
          social_connections (
            id,
            platform,
            posting_mode,
            platform_settings
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (!agent) {
        return { incompleteAgent: null };
      }

      return {
        incompleteAgent: {
          id: agent.id,
          name: agent.name,
          hasSocialConnections: agent.social_connections.length > 0,
          hasTriggers: agent.social_connections.some(conn => conn.posting_mode === 'automatic')
        }
      };
    } catch (error) {
      this.logger.error('Failed to get agent status:', error);
      throw error;
    }
  }
} 