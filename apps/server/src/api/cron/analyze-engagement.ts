import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { TwitterProfileService } from '@/modules/social/twitter/features/profile/services/profile.service';
import { AgentService } from '@/modules/letta/features/agents/services/agent.service';

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

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const app = await getAppInstance();
    const profileService = app.get(TwitterProfileService);
    const agentService = app.get(AgentService);

    // Get all agents with Twitter connections
    const { data: agents, error } = await app.get('SupabaseService').client
      .from('social_connections')
      .select(`
        id,
        platform_user_id,
        agent_id,
        user_id,
        user_agents!inner (*)
      `)
      .eq('platform', 'twitter')
      .eq('posting_mode', 'automatic');

    if (error) throw error;

    // Process each agent
    for (const agent of agents) {
      try {
        // Fetch and store timeline
        const tweets = await profileService.fetchAndStoreTimeline(
          agent.auth,
          agent.platform_user_id,
          agent.agent_id
        );

        // Update agent's memory with new data
        await agentService.updateAgentMemory(agent.agent_id, {
          type: 'twitter_timeline',
          data: tweets
        });
      } catch (error) {
        console.error(`Failed to process agent ${agent.id}:`, error);
        continue; // Continue with next agent even if one fails
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Cron job failed:', error);
    return res.status(500).json({ error: error.message });
  }
} 