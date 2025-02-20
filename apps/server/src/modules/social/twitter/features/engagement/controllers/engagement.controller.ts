import { Controller, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { TwitterEngagementService } from '../services/engagement.service';
import { JwtAuthGuard } from '../../../../../../auth/guards/jwt.guard';

@Controller('social/twitter/engagement')
@UseGuards(JwtAuthGuard)
export class TwitterEngagementController {
  constructor(private readonly engagementService: TwitterEngagementService) {}

  @Post('tweets/:id/like')
  async likeTweet(@Request() req, @Param('id') tweetId: string) {
    return this.engagementService.likeTweet(req.user.twitter.auth, tweetId);
  }

  @Delete('tweets/:id/like')
  async unlikeTweet(@Request() req, @Param('id') tweetId: string) {
    return this.engagementService.unlikeTweet(req.user.twitter.auth, tweetId);
  }

  @Post('tweets/:id/retweet')
  async retweet(@Request() req, @Param('id') tweetId: string) {
    return this.engagementService.retweet(req.user.twitter.auth, tweetId);
  }

  @Delete('tweets/:id/retweet')
  async unretweet(@Request() req, @Param('id') tweetId: string) {
    return this.engagementService.unretweet(req.user.twitter.auth, tweetId);
  }
}