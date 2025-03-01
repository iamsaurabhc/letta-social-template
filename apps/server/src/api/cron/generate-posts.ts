import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AgentService } from "@/modules/letta/features/agents/services/agent.service";
import { PostService } from "@/modules/social/posts/services/post.service";

let app;

async function getAppInstance() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn']
    });
  }
  return app;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Vercel cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const app = await getAppInstance();
    const agentService = app.get(AgentService);
    const postService = app.get(PostService);

    // Get all active agents
    const activeAgents = await postService.getActiveAgentsForPosting();
    
    for (const agent of activeAgents) {
      await agentService.generateAndSchedulePost(agent.id);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Cron job failed:', error);
    return res.status(500).json({ error: error.message });
  }
} 