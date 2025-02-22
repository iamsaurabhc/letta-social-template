import { Module } from '@nestjs/common';
import { TwitterPostController } from './features/posts/controllers/post.controller';
import { TwitterEngagementController } from './features/engagement/controllers/engagement.controller';
import { TwitterProfileController } from './features/profile/controllers/profile.controller';
import { TwitterPostService } from './features/posts/services/post.service';
import { TwitterEngagementService } from './features/engagement/services/engagement.service';
import { TwitterProfileService } from './features/profile/services/profile.service';
import { TwitterApiService } from './services/twitter-api.service';

@Module({
  controllers: [
    TwitterPostController,
    TwitterEngagementController,
    TwitterProfileController
  ],
  providers: [
    TwitterPostService,
    TwitterEngagementService,
    TwitterProfileService,
    TwitterApiService
  ],
  exports: [TwitterPostService, TwitterEngagementService, TwitterProfileService, TwitterApiService]
})
export class TwitterModule {} 