import { Module } from '@nestjs/common';
import { LinkedInModule } from './linkedin/linkedin.module';
import { TwitterModule } from './twitter/twitter.module';
import { UserAgentController } from './controllers/user-agent.controller';
import { UserAgentService } from './services/user-agent.service';

@Module({
  imports: [TwitterModule, LinkedInModule],
  controllers: [UserAgentController],
  providers: [UserAgentService],
  exports: [TwitterModule, LinkedInModule, UserAgentService]
})
export class SocialModule {} 