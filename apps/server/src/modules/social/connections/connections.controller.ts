import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

@Controller('social/connections')
export class ConnectionsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getConnections(@Req() request: AuthenticatedRequest) {
    const { data, error } = await this.supabaseService.client
      .from('social_connections')
      .select('platform, username, platform_settings')
      .eq('user_id', request.user!.id);

    if (error) throw error;
    return data;
  }
} 