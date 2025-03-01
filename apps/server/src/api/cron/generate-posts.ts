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
      try {
        // Generate multiple posts for the day
        const postsPerDay = agent.social_connections[0]?.platform_settings?.posts_per_day || 5;
        const today = new Date();
        
        for (let i = 0; i < postsPerDay; i++) {
          // Calculate scheduled time (spread throughout the day)
          const scheduledFor = new Date(today);
          scheduledFor.setHours(9 + Math.floor((14 / postsPerDay) * i)); // Posts between 9 AM and 11 PM
          scheduledFor.setMinutes(Math.floor(Math.random() * 60)); // Random minute

          await agentService.generateAndSchedulePost(agent.id, undefined, scheduledFor);
        }
      } catch (error) {
        console.error(`Failed to generate posts for agent ${agent.id}:`, error);
        continue;
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Cron job failed:', error);
    return res.status(500).json({ error: error.message });
  }
} 