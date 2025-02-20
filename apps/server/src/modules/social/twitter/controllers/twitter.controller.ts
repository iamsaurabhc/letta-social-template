import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TwitterService } from '../services/twitter.service';
import { JwtAuthGuard } from '../../../../auth/guards/jwt.guard';

@Controller('social/twitter')
@UseGuards(JwtAuthGuard)
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  @Get('posts')
  async getPosts() {
    return this.twitterService.getPosts();
  }

  @Post('posts')
  async createPost(@Body() postData: any) {
    return this.twitterService.createPost(postData);
  }

  @Get('posts/:id/comments')
  async getComments(@Param('id') postId: string) {
    return this.twitterService.getComments(postId);
  }
} 