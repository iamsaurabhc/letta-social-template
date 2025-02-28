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
    @Query('page') pageStr: string = '1',
    @Query('limit') limitStr: string = '10'
  ) {
    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    
    return this.postService.getScheduledPosts(
      isNaN(page) ? 1 : page,
      isNaN(limit) ? 10 : limit
    );
  }

  @Post('schedule')
  async schedulePost(@Body() createPostDto: CreateScheduledPostDto) {
    return this.postService.schedulePost(createPostDto);
  }
} 