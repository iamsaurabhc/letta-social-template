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

@Module({
  imports: [
    TwitterModule,
    LinkedInModule,
    BullModule.registerQueue({
      name: 'website-scraping',
    }),
    LettaModule,
    SupabaseModule,
    AuthModule
  ],
  controllers: [
    UserAgentController,
    TwitterAuthController
  ],
  providers: [
    UserAgentService,
    WebsiteScraperService,
    WebsiteScraperProcessor,
    TwitterAuthService,
    TwitterApiService
  ],
  exports: [
    TwitterModule,
    LinkedInModule,
    UserAgentService
  ]
})
export class SocialModule {} 