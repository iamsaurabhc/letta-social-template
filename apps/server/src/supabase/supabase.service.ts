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
        .maybeSingle();

      if (error) {
        this.logger.error('Database error:', error);
        throw error;
      }

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
      return { incompleteAgent: null };
    }
  }

  async getAgentStats(userId: string) {
    try {
      const { data: agents, error } = await this.supabaseClient
        .from('user_agents')
        .select('id, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      const now = new Date();
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

      const totalAgents = agents.length;
      const lastMonthAgents = agents.filter(agent => 
        new Date(agent.created_at) > lastMonth
      ).length;

      return {
        total: totalAgents,
        newThisMonth: lastMonthAgents
      };
    } catch (error) {
      this.logger.error('Failed to get agent stats:', error);
      throw error;
    }
  }

  async getConnectionStats(userId: string) {
    try {
      const { data: connections, error } = await this.supabaseClient
        .from('social_connections')
        .select('platform')
        .eq('user_id', userId);

      if (error) {
        this.logger.error('Database error:', error);
        throw error;
      }

      const totalConnections = connections.length;
      const uniquePlatforms = new Set(connections.map(conn => conn.platform)).size;

      return {
        total: totalConnections,
        platformCount: uniquePlatforms
      };
    } catch (error) {
      this.logger.error('Failed to get connection stats:', error);
      return { total: 0, platformCount: 0 };
    }
  }
} 