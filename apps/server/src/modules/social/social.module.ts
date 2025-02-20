import { Module } from '@nestjs/common';
import { LinkedInModule } from './linkedin/linkedin.module';
import { TwitterModule } from './twitter/twitter.module';

@Module({
  imports: [TwitterModule, LinkedInModule],
  exports: [TwitterModule, LinkedInModule]
})
export class SocialModule {} 