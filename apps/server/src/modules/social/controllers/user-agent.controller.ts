import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { User } from '../../../auth/decorators/user.decorator';
import { UserAgentService } from '../services/user-agent.service';
import { CreateUserAgentDto } from '../dto/user-agent.dto';
import { SupabaseService } from '../../../supabase/supabase.service';

@Controller('social/agents')
@UseGuards(JwtAuthGuard)
export class UserAgentController {
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
    return this.supabaseService.getAgentStatus(userId);
  }
} 