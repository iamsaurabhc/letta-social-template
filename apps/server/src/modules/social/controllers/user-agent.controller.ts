import { Controller, Post, Body, UseGuards, Get, UnauthorizedException, Logger, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { User } from '../../../auth/decorators/user.decorator';
import { UserAgentService } from '../services/user-agent.service';
import { CreateUserAgentDto } from '../dto/user-agent.dto';
import { SupabaseService } from '../../../supabase/supabase.service';
import { AgentService } from '../../../modules/letta/features/agents/services/agent.service';
import { TriggerSettingsDto } from '../dto/trigger.dto';

@Controller('social/agents')
@UseGuards(JwtAuthGuard)
export class UserAgentController {
  private readonly logger = new Logger(UserAgentController.name);

  constructor(
    private readonly userAgentService: UserAgentService,
    private readonly supabaseService: SupabaseService,
    private readonly agentService: AgentService
  ) {}

  @Post()
  async create(
    @User('sub') userId: string,
    @Body() createUserAgentDto: CreateUserAgentDto,
  ) {
    return this.userAgentService.createUserAgent(userId, createUserAgentDto);
  }

  @Get('status')
  async getStatus(@User('sub') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User ID not found');
    }
    try {
      return await this.supabaseService.getAgentStatus(userId);
    } catch (error) {
      this.logger.error('Error getting agent status:', error);
      return { incompleteAgent: null };
    }
  }

  @Get('stats')
  async getAgentStats(@User('sub') userId: string) {
    try {
      const { data, error } = await this.supabaseService.client
        .from('user_agents')
        .select('created_at')
        .eq('user_id', userId);

      if (error) throw error;

      const total = data.length;
      const newThisMonth = data.filter(agent => {
        const createdAt = new Date(agent.created_at);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && 
               createdAt.getFullYear() === now.getFullYear();
      }).length;

      return { total, newThisMonth };
    } catch (error) {
      this.logger.error('Error fetching agent stats:', error);
      throw error;
    }
  }

  @Get('connections/stats')
  async getConnectionStats(@User('sub') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User ID not found');
    }
    return this.supabaseService.getConnectionStats(userId);
  }

  @Get()
  async getAllAgents(@User('sub') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User ID not found');
    }
    try {
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
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      this.logger.error('Error fetching agents:', error);
      throw error;
    }
  }

  @Post(':id/triggers')
  async saveTriggers(
    @Param('id') agentId: string,
    @Body() triggerData: TriggerSettingsDto,
    @User('sub') userId: string
  ) {
    return this.agentService.saveTriggers(agentId, triggerData, userId);
  }
} 