import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/guards/jwt.guard';
import { PostService } from '../services/post.service';
import { CreateScheduledPostDto } from '../dto/create-scheduled-post.dto';
import { AgentService } from '../../../letta/features/agents/services/agent.service';

interface GenerateContentDto {
  agentId: string;
  settings: {
    format: 'normal' | 'long_form';
  };
  scheduledFor: string;
}

interface GenerationResponse {
  success: boolean;
  content?: {
    normal: string;
    longForm: string;
  };
  error?: {
    message: string;
  };
}

@Controller('social/posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly agentService: AgentService
  ) {}

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

  @Post('generate')
  async generateContent(
    @Body() data: GenerateContentDto
  ): Promise<GenerationResponse> {
    try {
      // Generate normal content
      const normalContent = await this.agentService.generatePost({
        agentId: data.agentId,
        format: 'normal',
        scheduledFor: new Date(data.scheduledFor)
      });

      // Generate long-form content
      const longFormContent = await this.agentService.generatePost({
        agentId: data.agentId,
        format: 'long_form',
        scheduledFor: new Date(data.scheduledFor)
      });

      return {
        success: true,
        content: {
          normal: normalContent,
          longForm: longFormContent
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message || 'Failed to generate content'
        }
      };
    }
  }
} 