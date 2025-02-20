import { Injectable, Logger } from '@nestjs/common';
import { TwitterApiService } from '../../../services/twitter-api.service';
import { TwitterAuth, TwitterResponse, Tweet, TwitterMediaUploadResponse } from '../../../interfaces/twitter.interface';

@Injectable()
export class TwitterPostService {
  private readonly logger = new Logger(TwitterPostService.name);
  private readonly TWITTER_UPLOAD_API_BASE = 'https://upload.twitter.com/1.1';

  constructor(private readonly twitterApiService: TwitterApiService) {}

  async getPosts(auth: TwitterAuth) {
    this.logger.log('Fetching Twitter posts');
    const userId = await this.getUserId(auth);
    return this.twitterApiService.makeTwitterRequest(
      `/users/${userId}/tweets?tweet.fields=created_at,public_metrics`,
      { method: 'GET' },
      auth
    );
  }

  async createPost(auth: TwitterAuth, postData: { text: string; mediaId?: string }) {
    this.logger.log('Creating Twitter post');
    const body = postData.mediaId 
      ? { text: postData.text, media: { media_ids: [postData.mediaId] } }
      : { text: postData.text };

    return this.twitterApiService.makeTwitterRequest<Tweet>(
      '/tweets',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      auth
    );
  }

  async createPostWithMedia(auth: TwitterAuth, text: string, file: Buffer) {
    this.logger.log('Creating Twitter post with media');
    const mediaId = await this.uploadMedia(auth, file);
    return this.createPost(auth, { text, mediaId });
  }

  async getTweetDetails(auth: TwitterAuth, tweetId: string) {
    this.logger.log(`Fetching tweet details: ${tweetId}`);
    return this.twitterApiService.makeTwitterRequest(
      `/tweets/${tweetId}?tweet.fields=created_at,public_metrics,entities,attachments`,
      { method: 'GET' },
      auth
    );
  }

  async getTweetReplies(auth: TwitterAuth, tweetId: string) {
    this.logger.log(`Fetching replies for tweet: ${tweetId}`);
    return this.twitterApiService.makeTwitterRequest(
      `/tweets/search/recent?query=conversation_id:${tweetId}`,
      { method: 'GET' },
      auth
    );
  }

  async replyToTweet(auth: TwitterAuth, tweetId: string, text: string) {
    this.logger.log(`Replying to tweet: ${tweetId}`);
    return this.twitterApiService.makeTwitterRequest(
      '/tweets',
      {
        method: 'POST',
        body: JSON.stringify({
          text,
          reply: { in_reply_to_tweet_id: tweetId }
        }),
      },
      auth
    );
  }

  async deletePost(auth: TwitterAuth, id: string) {
    this.logger.log(`Deleting Twitter post: ${id}`);
    return this.twitterApiService.makeTwitterRequest(
      `/tweets/${id}`,
      { method: 'DELETE' },
      auth
    );
  }

  private async uploadMedia(auth: TwitterAuth, file: Buffer) {
    this.logger.log('Uploading media to Twitter');
    
    const formData = new FormData();
    formData.append('media', new Blob([file]));
    formData.append('media_category', 'tweet_image');

    const response = await this.twitterApiService.makeTwitterRequest<TwitterMediaUploadResponse>(
      '/media/upload.json',
      {
        method: 'POST',
        baseUrl: this.TWITTER_UPLOAD_API_BASE,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      auth
    );

    if (!response.data.media_id_string) {
      throw new Error('Failed to upload media: No media_id_string in response');
    }

    return response.data.media_id_string;
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