import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/guards/jwt.guard';
import { PostService } from '../services/post.service';

@Controller('social/posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('scheduled')
  async getScheduledPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.postService.getScheduledPosts(page, limit);
  }
} 