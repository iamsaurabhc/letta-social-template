import { Module, forwardRef } from '@nestjs/common';
import { LinkedInModule } from './linkedin/linkedin.module';
import { TwitterModule } from './twitter/twitter.module';
import { UserAgentController } from './controllers/user-agent.controller';
import { UserAgentService } from './services/user-agent.service';
import { WebsiteScraperService } from './services/website-scraper.service';
import { WebsiteScraperProcessor } from './processors/website-scraper.processor';
import { BullModule } from '@nestjs/bull';
import { LettaModule } from '../letta/letta.module';
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
import { AgentService } from '../letta/features/agents/services/agent.service';

@Module({
  imports: [
    forwardRef(() => TwitterModule),
    LinkedInModule,
    forwardRef(() => LettaModule),
    SupabaseModule,
    BullQueueModule,
    CacheModule
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
    PostPublisherProcessor,
    AgentService
  ],
  exports: [
    TwitterModule,
    LinkedInModule,
    UserAgentService,
    PostService,
    TwitterPostService,
    WebsiteScraperService,
    AgentService
  ]
})
export class SocialModule {} 