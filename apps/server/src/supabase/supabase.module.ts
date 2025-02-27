import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseConnectionPool } from './connection-pool.service';
import { CacheModule } from '../modules/cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [
    SupabaseService,
    SupabaseConnectionPool
  ],
  exports: [
    SupabaseService,
    SupabaseConnectionPool
  ]
})
export class SupabaseModule {} 