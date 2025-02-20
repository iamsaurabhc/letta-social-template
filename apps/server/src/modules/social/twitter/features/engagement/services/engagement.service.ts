import { Injectable, Logger } from '@nestjs/common';
import { TwitterApiService } from '../../../services/twitter-api.service';
import { TwitterAuth } from '../../../interfaces/twitter.interface';

@Injectable()
export class TwitterEngagementService {
  private readonly logger = new Logger(TwitterEngagementService.name);

  constructor(private readonly twitterApiService: TwitterApiService) {}

  /**
   * Likes a tweet for the authenticated user
   * @param auth - Twitter authentication credentials
   * @param tweetId - ID of the tweet to like
   * @returns Twitter API response confirming the like action
   * @see Reference implementation in old_twitter.ts (lines 200-220)
   */
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

  /**
   * Unlikes a previously liked tweet
   * @param auth - Twitter authentication credentials
   * @param tweetId - ID of the tweet to unlike
   * @returns Twitter API response confirming the unlike action
   * @see Reference implementation in old_twitter.ts (lines 222-242)
   */
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

  /**
   * Retweets a tweet for the authenticated user
   * @param auth - Twitter authentication credentials
   * @param tweetId - ID of the tweet to retweet
   * @returns Twitter API response confirming the retweet action
   * @see Reference implementation in old_twitter.ts (lines 244-264)
   */
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

  /**
   * Removes a retweet from the authenticated user's timeline
   * @param auth - Twitter authentication credentials
   * @param tweetId - ID of the tweet to un-retweet
   * @returns Twitter API response confirming the un-retweet action
   * @see Reference implementation in old_twitter.ts (lines 266-286)
   */
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

  /**
   * Retrieves the authenticated user's Twitter ID
   * @param auth - Twitter authentication credentials
   * @returns The user's Twitter ID as a string
   * @private
   */
  private async getUserId(auth: TwitterAuth): Promise<string> {
    const response = await this.twitterApiService.makeTwitterRequest<{ id: string }>(
      '/users/me',
      { method: 'GET' },
      auth
    );
    return response.data.id;
  }
} 