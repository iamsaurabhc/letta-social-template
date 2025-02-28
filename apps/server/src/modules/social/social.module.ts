import { Module } from '@nestjs/common';
import { LinkedInModule } from './linkedin/linkedin.module';
import { TwitterModule } from './twitter/twitter.module';
import { UserAgentController } from './controllers/user-agent.controller';
import { UserAgentService } from './services/user-agent.service';
import { WebsiteScraperService } from './services/website-scraper.service';
import { WebsiteScraperProcessor } from './processors/website-scraper.processor';
import { BullModule } from '@nestjs/bull';
import { LettaModule } from '../../modules/letta/letta.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { TwitterAuthController } from './twitter/controllers/auth.controller';
import { TwitterAuthService } from './twitter/services/auth.service';
import { TwitterApiService } from './twitter/services/twitter-api.service';
import { AuthModule } from '../../auth/auth.module';
import { ConnectionsController } from './connections/connections.controller';
import { SupabaseService } from '../../supabase/supabase.service';
import { AgentsController } from './agents/agents.controller';
import { PostService } from './posts/services/post.service';
import { TwitterPostService } from './twitter/features/posts/services/post.service';
import { BullQueueModule } from '../bull/bull.module';
import { CacheModule } from '../cache/cache.module';
import { PostController } from './posts/controllers/post.controller';
import { PostPublisherProcessor } from './posts/processors/post-publisher.processor';

@Module({
  imports: [
    TwitterModule,
    LinkedInModule,
    BullModule.registerQueue({
      name: 'website-scraping',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      }
    }),
    LettaModule,
    SupabaseModule,
    AuthModule,
    CacheModule,
    BullModule.registerQueue({
      name: 'content-generation',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      }
    }),
    BullModule.registerQueue({
      name: 'engagement-monitoring',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      }
    }),
    BullQueueModule,
    BullModule.registerQueue({
      name: 'post-publisher',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      }
    }),
  ],
  controllers: [
    UserAgentController,
    TwitterAuthController,
    ConnectionsController,
    AgentsController,
    PostController
  ],
  providers: [
    UserAgentService,
    WebsiteScraperService,
    WebsiteScraperProcessor,
    TwitterAuthService,
    TwitterApiService,
    SupabaseService,
    PostService,
    TwitterPostService,
    PostPublisherProcessor
  ],
  exports: [
    TwitterModule,
    LinkedInModule,
    UserAgentService,
    PostService,
    TwitterPostService
  ]
})
export class SocialModule {} 