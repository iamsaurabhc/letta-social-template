import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { PostService } from '@/modules/social/posts/services/post.service';

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
    const postService = app.get(PostService);

    // Get posts scheduled for the next 15-minute window
    const now = new Date();
    const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);

    const { data: postsToPublish, error } = await app.get('SupabaseService').client
      .from('social_posts')
      .select(`
        *,
        post_approvals (status),
        social_connections!inner (posting_mode)
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_for', now.toISOString())
      .lt('scheduled_for', fifteenMinsFromNow.toISOString())
      .or(
        `and(post_approvals.status.eq.approved),
         and(social_connections.posting_mode.eq.automatic,post_approvals.status.is.null)`
      );

    if (error) throw error;

    // Process each post
    for (const post of postsToPublish) {
      try {
        await postService.publishPost({
          postId: post.id,
          content: post.content,
          format: post.metadata?.format || 'normal'
        });
      } catch (error) {
        // Update post status to failed
        await app.get('SupabaseService').client
          .from('social_posts')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', post.id);
          
        console.error(`Failed to publish post ${post.id}:`, error);
        continue;
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Cron job failed:', error);
    return res.status(500).json({ error: error.message });
  }
}