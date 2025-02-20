import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TwitterPostService } from '../services/post.service';
import { JwtAuthGuard } from '../../../../../../auth/guards/jwt.guard';

@Controller('social/twitter/posts')
@UseGuards(JwtAuthGuard)
export class TwitterPostController {
  constructor(private readonly postService: TwitterPostService) {}

  @Get()
  async getPosts(@Request() req) {
    return this.postService.getPosts(req.user.twitter.auth);
  }

  @Post()
  async createPost(@Request() req, @Body() postData: { text: string }) {
    return this.postService.createPost(req.user.twitter.auth, postData);
  }

  @Post('with-media')
  @UseInterceptors(FileInterceptor('file'))
  async createPostWithMedia(
    @Request() req,
    @Body() postData: { text: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.postService.createPostWithMedia(req.user.twitter.auth, postData.text, file.buffer);
  }

  @Get(':id')
  async getTweetDetails(@Request() req, @Param('id') id: string) {
    return this.postService.getTweetDetails(req.user.twitter.auth, id);
  }

  @Get(':id/replies')
  async getTweetReplies(@Request() req, @Param('id') id: string) {
    return this.postService.getTweetReplies(req.user.twitter.auth, id);
  }

  @Post(':id/reply')
  async replyToTweet(
    @Request() req,
    @Param('id') id: string,
    @Body() replyData: { text: string }
  ) {
    return this.postService.replyToTweet(req.user.twitter.auth, id, replyData.text);
  }

  @Delete(':id')
  async deletePost(@Request() req, @Param('id') id: string) {
    return this.postService.deletePost(req.user.twitter.auth, id);
  }
} 