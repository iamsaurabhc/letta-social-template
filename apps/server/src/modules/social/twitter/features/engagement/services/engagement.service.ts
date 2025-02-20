import { Injectable, Logger } from '@nestjs/common';
import { TwitterApiService } from '../../../services/twitter-api.service';
import { TwitterAuth } from '../../../interfaces/twitter.interface';

@Injectable()
export class TwitterEngagementService {
  private readonly logger = new Logger(TwitterEngagementService.name);

  constructor(private readonly twitterApiService: TwitterApiService) {}

  async likeTweet(auth: TwitterAuth, tweetId: string) {
    this.logger.log(`Liking tweet: ${tweetId}`);
    const userId = await this.getUserId(auth);
    return this.twitterApiService.makeTwitterRequest(
      `/users/${userId}/likes`,
      {
        method: 'POST',
        body: JSON.stringify({ tweet_id: tweetId }),
      },
      auth
    );
  }

  async unlikeTweet(auth: TwitterAuth, tweetId: string) {
    this.logger.log(`Unliking tweet: ${tweetId}`);
    const userId = await this.getUserId(auth);
    return this.twitterApiService.makeTwitterRequest(
      `/users/${userId}/likes/${tweetId}`,
      {
        method: 'DELETE',
      },
      auth
    );
  }

  async retweet(auth: TwitterAuth, tweetId: string) {
    this.logger.log(`Retweeting tweet: ${tweetId}`);
    const userId = await this.getUserId(auth);
    return this.twitterApiService.makeTwitterRequest(
      `/users/${userId}/retweets`,
      {
        method: 'POST',
        body: JSON.stringify({ tweet_id: tweetId }),
      },
      auth
    );
  }

  async unretweet(auth: TwitterAuth, tweetId: string) {
    this.logger.log(`Removing retweet: ${tweetId}`);
    const userId = await this.getUserId(auth);
    return this.twitterApiService.makeTwitterRequest(
      `/users/${userId}/retweets/${tweetId}`,
      {
        method: 'DELETE',
      },
      auth
    );
  }

  private async getUserId(auth: TwitterAuth): Promise<string> {
    const response = await this.twitterApiService.makeTwitterRequest<{ id: string }>(
      '/users/me',
      { method: 'GET' },
      auth
    );
    return response.data.id;
  }
} 