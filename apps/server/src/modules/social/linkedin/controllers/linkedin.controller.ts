import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LinkedInService } from '../services/linkedin.service';
import { JwtAuthGuard } from '../../../../auth/guards/jwt.guard';

@Controller('social/linkedin')
@UseGuards(JwtAuthGuard)
export class LinkedInController {
  constructor(private readonly linkedInService: LinkedInService) {}

  @Get('posts')
  async getPosts() {
    return this.linkedInService.getPosts();
  }

  @Post('posts')
  async createPost(@Body() postData: any) {
    return this.linkedInService.createPost(postData);
  }

  @Get('posts/:id/comments')
  async getComments(@Param('id') postId: string) {
    return this.linkedInService.getComments(postId);
  }
} 