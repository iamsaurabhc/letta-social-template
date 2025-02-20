import { Injectable, Logger } from '@nestjs/common';
import { TwitterApiService } from '../../../services/twitter-api.service';
import { TwitterAuth, TwitterUser } from '../../../interfaces/twitter.interface';

@Injectable()
export class TwitterProfileService {
  private readonly logger = new Logger(TwitterProfileService.name);

  constructor(private readonly twitterApiService: TwitterApiService) {}

  async getMyAccountDetails(auth: TwitterAuth): Promise<TwitterUser> {
    this.logger.log('Fetching account details');
    const response = await this.twitterApiService.makeTwitterRequest<TwitterUser>(
      '/users/me?user.fields=created_at,description,location,profile_image_url,public_metrics,verified',
      { method: 'GET' },
      auth
    );
    return response.data;
  }

  async getUserTimeline(auth: TwitterAuth, userId: string, maxResults: number = 10) {
    this.logger.log(`Fetching timeline for user: ${userId}`);
    return this.twitterApiService.makeTwitterRequest(
      `/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics`,
      { method: 'GET' },
      auth
    );
  }

  async getTweetsFromList(auth: TwitterAuth, listId: string, maxResults: number = 10) {
    this.logger.log(`Fetching tweets from list: ${listId}`);
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,attachments,text,public_metrics',
      expansions: 'author_id,attachments.media_keys',
      'user.fields': 'name,username,profile_image_url',
      'media.fields': 'type,url,preview_image_url'
    });

    return this.twitterApiService.makeTwitterRequest(
      `/lists/${listId}/tweets?${params.toString()}`,
      { method: 'GET' },
      auth
    );
  }
} 