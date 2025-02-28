import { Controller, Post, Body, Headers, Get } from '@nestjs/common';
import { AgentService } from '../letta/features/agents/services/agent.service';
import { PostService } from '../social/posts/services/post.service';
import { Receiver, Client } from "@upstash/qstash";
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Controller('workflow')
export class WorkflowController {
  private readonly receiver: Receiver;
  private readonly client: Client;
  private readonly baseUrl: string;
  private readonly logger: Logger;
  
  constructor(
    private readonly agentService: AgentService,
    private readonly postService: PostService,
    private readonly configService: ConfigService,
  ) {
    this.receiver = new Receiver({
      currentSigningKey: this.configService.get('QSTASH_CURRENT_SIGNING_KEY'),
      nextSigningKey: this.configService.get('QSTASH_NEXT_SIGNING_KEY'),
    });

    this.client = new Client({
      token: this.configService.get('QSTASH_TOKEN')
    });
    
    this.baseUrl = this.configService.get('SERVER_URL', 'https://social-auto-agent.vercel.app') + '/api';
    this.logger = new Logger(WorkflowController.name);
  }

  @Get('health')
  async healthCheck() {
    try {
      // Test QStash connectivity
      const testWorkflow = await this.client.publishJSON({
        url: `${this.baseUrl}/workflow/health/ping`,
        body: { test: true },
        retries: 3
      });

      return {
        status: 'healthy',
        qstash: {
          connected: true,
          messageId: testWorkflow.messageId
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        qstash: {
          connected: false,
          error: error.message
        }
      };
    }
  }

  @Post('health/ping')
  async healthPing(
    @Body() data: any,
    @Headers('upstash-signature') signature: string
  ) {
    const isValid = await this.receiver.verify({
      body: JSON.stringify(data),
      signature,
      url: `${this.configService.get('SERVER_URL')}/api/workflow/health/ping`
    });

    return {
      status: 'ok',
      signatureValid: isValid,
      timestamp: new Date().toISOString()
    };
  }

  @Post('posts/publish')
  async publishPost(
    @Body() data: { postId: string; content: string; format: 'normal' | 'long_form' },
    @Headers('upstash-signature') signature: string
  ) {
    const isValid = await this.receiver.verify({
      body: JSON.stringify(data),
      signature,
      url: `${this.configService.get('SERVER_URL')}/api/workflow/posts/publish`
    });

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    await this.postService.publishPost(data);
    return { success: true };
  }

  @Post('agents/generate-content')
  async generateContent(
    @Body() data: { agentId: string; settings: any; scheduledFor: Date },
    @Headers('upstash-signature') signature: string
  ) {
    try {
      this.logger.log(`Received content generation request for agent ${data.agentId}`);

      // Skip signature verification in development
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log('Development mode: Skipping signature verification');
        const content = await this.agentService.generatePost({
          agentId: data.agentId,
          format: data.settings.format || 'normal',
          scheduledFor: new Date(data.scheduledFor)
        });

        return { success: true, content };
      }

      this.logger.log('Production mode: Verifying signature');
      const isValid = await this.receiver.verify({
        body: JSON.stringify(data),
        signature,
        url: `${this.configService.get('SERVER_URL')}/api/workflow/agents/generate-content`
      });

      if (!isValid) {
        this.logger.error('Invalid signature received');
        throw new Error('Invalid signature');
      }

      const content = await this.agentService.generatePost({
        agentId: data.agentId,
        format: data.settings.format || 'normal',
        scheduledFor: new Date(data.scheduledFor)
      });

      return { success: true, content };
    } catch (error) {
      this.logger.error('Content generation failed:', {
        error: error.message,
        stack: error.stack,
        data: data
      });
      throw error;
    }
  }
} 