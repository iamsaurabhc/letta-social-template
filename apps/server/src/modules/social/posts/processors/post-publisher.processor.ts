import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PostService } from '../services/post.service';

@Processor('post-publisher')
export class PostPublisherProcessor {
  private readonly logger = new Logger(PostPublisherProcessor.name);

  constructor(private readonly postService: PostService) {}

  @Process()
  async handlePost(job: Job<{
    postId: string;
    scheduledFor: Date;
    content: string;
    format: 'normal' | 'long_form';
  }>) {
    try {
      this.logger.debug(`Processing post ${job.data.postId}`);
      await this.postService.publishPost({
        postId: job.data.postId,
        content: job.data.content,
        format: job.data.format
      });
      this.logger.debug(`Successfully processed post ${job.data.postId}`);
    } catch (error) {
      this.logger.error(`Failed to process post ${job.data.postId}:`, error);
      throw error;
    }
  }
} 