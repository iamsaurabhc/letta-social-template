import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { TwitterProfileService } from '../services/profile.service';
import { JwtAuthGuard } from '../../../../../../auth/guards/jwt.guard';

@Controller('social/twitter/profile')
@UseGuards(JwtAuthGuard)
export class TwitterProfileController {
  constructor(private readonly profileService: TwitterProfileService) {}

  @Get('me')
  async getMyProfile(@Request() req) {
    return this.profileService.getMyAccountDetails(req.user.twitter.auth);
  }

  @Get('timeline')
  async getTimeline(
    @Request() req,
    @Query('userId') userId: string,
    @Query('maxResults') maxResults: number
  ) {
    return this.profileService.getUserTimeline(req.user.twitter.auth, userId, maxResults);
  }
} 