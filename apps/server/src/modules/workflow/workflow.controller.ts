import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AgentService } from '../letta/features/agents/services/agent.service';
import { PostService } from '../social/posts/services/post.service';
import { Receiver } from "@upstash/qstash";
import { ConfigService } from '@nestjs/config';

@Controller('workflow')
export class WorkflowController {
  private readonly receiver: Receiver;
  
  constructor(
    private readonly agentService: AgentService,
    private readonly postService: PostService,
    private readonly configService: ConfigService,
  ) {
    this.receiver = new Receiver({
      currentSigningKey: this.configService.get('QSTASH_CURRENT_SIGNING_KEY'),
      nextSigningKey: this.configService.get('QSTASH_NEXT_SIGNING_KEY'),
    });
  }

  @Post('posts/publish')
  async publishPost(
    @Body() data: { postId: string; content: string; format: 'normal' | 'long_form' },
    @Headers('upstash-signature') signature: string
  ) {
    // Verify QStash signature
    const isValid = await this.receiver.verify({
      body: JSON.stringify(data),
      signature,
      url: `${this.configService.get('SERVER_URL')}/api/workflow/posts/publish`
    });

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Execute the post publishing
    await this.postService.publishPost(data);
    return { success: true };
  }

  @Post('agents/generate-content')
  async generateContent(
    @Body() data: { agentId: string; settings: any; scheduledFor: Date },
    @Headers('upstash-signature') signature: string
  ) {
    // Verify QStash signature
    const isValid = await this.receiver.verify({
      body: JSON.stringify(data),
      signature,
      url: `${this.configService.get('SERVER_URL')}/api/workflow/agents/generate-content`
    });

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Generate content using the agent service
    const content = await this.agentService.generatePost({
      agentId: data.agentId,
      format: data.settings.format || 'normal',
      scheduledFor: new Date(data.scheduledFor)
    });

    return { success: true, content };
  }
} 