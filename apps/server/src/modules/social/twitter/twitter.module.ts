import { Module } from '@nestjs/common';
import { TwitterPostController } from './features/posts/controllers/post.controller';
import { TwitterPostService } from './features/posts/services/post.service';

@Module({
  controllers: [TwitterPostController],
  providers: [TwitterPostService],
  exports: [TwitterPostService]
})
export class TwitterModule {} 