import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/guards/jwt.guard';
import { PostService } from '../services/post.service';
import { CreateScheduledPostDto } from '../dto/create-scheduled-post.dto';

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

  @Post('schedule')
  async schedulePost(@Body() createPostDto: CreateScheduledPostDto) {
    return this.postService.schedulePost(createPostDto);
  }
} 