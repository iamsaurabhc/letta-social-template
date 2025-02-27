import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConnectionPool } from './connection-pool.service';
import { CacheService } from '../modules/cache/cache.service';

@Injectable()
export class SupabaseService {
  private readonly supabaseClient: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(
    private configService: ConfigService,
    private connectionPool: SupabaseConnectionPool,
    private cacheService: CacheService
  ) {
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
    const cacheKey = `agent_status:${userId}`;
    
    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const client = this.connectionPool.getConnection();
    try {
      const { data, error } = await client
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

      if (error) throw error;

      const result = {
        incompleteAgent: data ? {
          id: data.id,
          name: data.name,
          hasSocialConnections: data.social_connections.length > 0,
          hasTriggers: data.social_connections.some(conn => 
            conn.platform_settings?.newPosts?.enabled || 
            conn.platform_settings?.engagement?.enabled
          )
        } : null
      };

      // Cache result
      await this.cacheService.set(cacheKey, result, 300);
      return result;

    } finally {
      this.connectionPool.releaseConnection(client);
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