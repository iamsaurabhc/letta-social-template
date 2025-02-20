import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TwitterPostService } from '../services/post.service';
import { JwtAuthGuard } from '../../../../../../auth/guards/jwt.guard';

@Controller('social/twitter/posts')
@UseGuards(JwtAuthGuard)
export class TwitterPostController {
  constructor(private readonly postService: TwitterPostService) {}

  @Get()
  async getPosts() {
    return this.postService.getPosts();
  }

  @Post()
  async createPost(@Body() postData: any) {
    return this.postService.createPost(postData);
  }

  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() postData: any) {
    return this.postService.updatePost(id, postData);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postService.deletePost(id);
  }
} 