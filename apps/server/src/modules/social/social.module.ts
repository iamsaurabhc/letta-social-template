import { Module } from '@nestjs/common';
import { LinkedInModule } from './linkedin/linkedin.module';
import { TwitterModule } from './twitter/twitter.module';
import { UserAgentController } from './controllers/user-agent.controller';
import { UserAgentService } from './services/user-agent.service';
import { WebsiteScraperService } from './services/website-scraper.service';
import { WebsiteScraperProcessor } from './processors/website-scraper.processor';
import { BullModule } from '@nestjs/bull';
import { LettaModule } from '../../modules/letta/letta.module';

@Module({
  imports: [
    TwitterModule,
    LinkedInModule,
    BullModule.registerQueue({
      name: 'website-scraping',
    }),
    LettaModule
  ],
  controllers: [UserAgentController],
  providers: [
    UserAgentService,
    WebsiteScraperService,
    WebsiteScraperProcessor
  ],
  exports: [
    TwitterModule,
    LinkedInModule,
    UserAgentService
  ]
})
export class SocialModule {} 