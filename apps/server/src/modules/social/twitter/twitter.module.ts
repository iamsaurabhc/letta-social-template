import { Module, forwardRef } from '@nestjs/common';
import { TwitterPostController } from './features/posts/controllers/post.controller';
import { TwitterEngagementController } from './features/engagement/controllers/engagement.controller';
import { TwitterProfileController } from './features/profile/controllers/profile.controller';
import { TwitterPostService } from './features/posts/services/post.service';
import { TwitterEngagementService } from './features/engagement/services/engagement.service';
import { TwitterProfileService } from './features/profile/services/profile.service';
import { TwitterApiService } from './services/twitter-api.service';
import { SupabaseModule } from '../../../supabase/supabase.module';
import { TwitterAuthService } from './services/auth.service';
import { LettaModule } from '../../letta/letta.module';
import { TwitterClient } from './twitter.client';

@Module({
  imports: [
    SupabaseModule,
    forwardRef(() => LettaModule),
  ],
  controllers: [
    TwitterPostController,
    TwitterEngagementController,
    TwitterProfileController
  ],
  providers: [
    TwitterPostService,
    TwitterEngagementService,
    TwitterProfileService,
    TwitterApiService,
    TwitterAuthService,
    TwitterClient
  ],
  exports: [
    TwitterPostService,
    TwitterEngagementService,
    TwitterProfileService,
    TwitterApiService,
    TwitterAuthService
  ]
})
export class TwitterModule {} 