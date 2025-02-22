import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { UserAgentService } from '../services/user-agent.service';
import { CreateUserAgentDto } from '../dto/user-agent.dto';
import { User } from '../../../auth/decorators/user.decorator';

@Controller('social/agents')
@UseGuards(JwtAuthGuard)
export class UserAgentController {
  constructor(private readonly userAgentService: UserAgentService) {}

  @Post()
  async createAgent(
    @User('sub') userId: string,
    @Body() agentData: CreateUserAgentDto
  ) {
    return this.userAgentService.createUserAgent(userId, agentData);
  }
} 