import { Controller, Get, Param, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { SupabaseService } from '../../../supabase/supabase.service';
import type { Request } from 'express';
import { User } from '@/auth/decorators/user.decorator';
import { UserEntity } from '@/types/user.entity';

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
        description,
        website_url,
        industry,
        target_audience,
        brand_personality,
        content_preferences,
        created_at,
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

  @Get(':id/connections')
  @UseGuards(JwtAuthGuard)
  async getAgentConnections(
    @Param('id') agentId: string,
    @Req() request: AuthenticatedRequest
  ) {
    try {
      const { data, error } = await this.supabaseService.client
        .from('social_connections')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', request.user!.id);
        
      if (error) {
        console.error(`Error fetching agent connections: ${error.message}`);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to get agent connections: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch agent connections');
    }
  }
} 

