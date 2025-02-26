import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
@Injectable()
export class PostService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getScheduledPosts(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await this.supabase
      .from('social_posts')
      .select('*, social_connections(platform, username)', { count: 'exact' })
      .eq('status', 'scheduled')
      .order('scheduled_for', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      posts: data,
      total: count,
      page,
      limit
    };
  }
} 