import { Controller, Post, Body, UseGuards, Get, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { User } from '../../../auth/decorators/user.decorator';
import { UserAgentService } from '../services/user-agent.service';
import { CreateUserAgentDto } from '../dto/user-agent.dto';
import { SupabaseService } from '../../../supabase/supabase.service';

@Controller('social/agents')
@UseGuards(JwtAuthGuard)
export class UserAgentController {
  private readonly logger = new Logger(UserAgentController.name);

  constructor(
    private readonly userAgentService: UserAgentService,
    private readonly supabaseService: SupabaseService,
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
  async getStats(@User('sub') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User ID not found');
    }
    return this.supabaseService.getAgentStats(userId);
  }

  @Get('connections/stats')
  async getConnectionStats(@User('sub') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User ID not found');
    }
    return this.supabaseService.getConnectionStats(userId);
  }
} 