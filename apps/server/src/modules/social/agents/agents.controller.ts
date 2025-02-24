import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { SupabaseService } from '../../../supabase/supabase.service';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@Controller('social/agents')
export class AgentsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAgent(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    const { data, error } = await this.supabaseService.client
      .from('user_agents')
      .select(`
        id,
        name,
        social_connections (
          id,
          platform,
          username,
          platform_settings
        )
      `)
      .eq('id', id)
      .eq('user_id', request.user!.id)
      .single();

    if (error) throw error;
    return data;
  }
} 