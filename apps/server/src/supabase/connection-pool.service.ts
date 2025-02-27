import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseConnectionPool implements OnModuleInit, OnModuleDestroy {
  private pool: SupabaseClient[] = [];
  private readonly MAX_CONNECTIONS = 10;
  
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Pre-initialize connection pool
    for (let i = 0; i < this.MAX_CONNECTIONS; i++) {
      this.pool.push(this.createConnection());
    }
  }

  async onModuleDestroy() {
    this.pool = [];
  }

  private createConnection(): SupabaseClient {
    return createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public'
        }
      }
    );
  }

  getConnection(): SupabaseClient {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createConnection();
  }

  releaseConnection(client: SupabaseClient) {
    if (this.pool.length < this.MAX_CONNECTIONS) {
      this.pool.push(client);
    }
  }
} 