import { Injectable, Logger } from '@nestjs/common';
import { TwitterApiService } from '../../../services/twitter-api.service';
import { TwitterAuth, TwitterResponse, Tweet, TwitterMediaUploadResponse } from '../../../interfaces/twitter.interface';

@Injectable()
export class TwitterPostService {
  private readonly logger = new Logger(TwitterPostService.name);
  private readonly TWITTER_UPLOAD_API_BASE = 'https://upload.twitter.com/1.1';

  constructor(private readonly twitterApiService: TwitterApiService) {}

  /**
   * Retrieves tweets for the authenticated user
   * @param auth - Twitter authentication credentials
   * @returns List of tweets with their creation date and public metrics
   * @see Reference implementation in old_twitter.ts (lines 107-127)
   */
  async getPosts(auth: TwitterAuth) {
    this.logger.log('Fetching Twitter posts');
    const userId = await this.getUserId(auth);
    return this.twitterApiService.makeTwitterRequest(
      `/users/${userId}/tweets?tweet.fields=created_at,public_metrics`,
      { method: 'GET' },
      auth
    );
  }

  /**
   * Creates a new tweet, optionally with media
   * @param auth - Twitter authentication credentials
   * @param postData - Object containing tweet text and optional media ID
   * @returns The created tweet data
   * @see Reference implementation in old_twitter.ts (lines 169-191)
   */
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

  /**
   * Creates a tweet with an attached media file
   * @param auth - Twitter authentication credentials
   * @param text - Tweet text content
   * @param file - Media file buffer to upload
   * @returns The created tweet data
   * @see Reference implementation in old_twitter.ts (lines 169-191)
   */
  async createPostWithMedia(auth: TwitterAuth, text: string, file: Buffer) {
    this.logger.log('Creating Twitter post with media');
    const mediaId = await this.uploadMedia(auth, file);
    return this.createPost(auth, { text, mediaId });
  }

  /**
   * Gets detailed information about a specific tweet
   * @param auth - Twitter authentication credentials
   * @param tweetId - ID of the tweet to fetch
   * @returns Detailed tweet data including metrics and attachments
   */
  async getTweetDetails(auth: TwitterAuth, tweetId: string) {
    this.logger.log(`Fetching tweet details: ${tweetId}`);
    return this.twitterApiService.makeTwitterRequest(
      `/tweets/${tweetId}?tweet.fields=created_at,public_metrics,entities,attachments`,
      { method: 'GET' },
      auth
    );
  }

  /**
   * Retrieves replies for a specific tweet
   * @param auth - Twitter authentication credentials
   * @param tweetId - ID of the tweet to fetch replies for
   * @returns List of replies to the specified tweet
   */
  async getTweetReplies(auth: TwitterAuth, tweetId: string) {
    this.logger.log(`Fetching replies for tweet: ${tweetId}`);
    return this.twitterApiService.makeTwitterRequest(
      `/tweets/search/recent?query=conversation_id:${tweetId}`,
      { method: 'GET' },
      auth
    );
  }

  /**
   * Posts a reply to an existing tweet
   * @param auth - Twitter authentication credentials
   * @param tweetId - ID of the tweet to reply to
   * @param text - Reply text content
   * @returns The created reply tweet data
   */
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

  /**
   * Deletes a tweet
   * @param auth - Twitter authentication credentials
   * @param id - ID of the tweet to delete
   * @returns The deleted tweet data
   */
  async deletePost(auth: TwitterAuth, id: string) {
    this.logger.log(`Deleting Twitter post: ${id}`);
    return this.twitterApiService.makeTwitterRequest(
      `/tweets/${id}`,
      { method: 'DELETE' },
      auth
    );
  }

  /**
   * Uploads media to Twitter for use in tweets
   * @param auth - Twitter authentication credentials
   * @param file - Media file buffer to upload
   * @returns Media ID string for use in tweet creation
   * @private
   * @see Reference implementation in old_twitter.ts (lines 130-164)
   */
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

  /**
   * Gets the authenticated user's Twitter ID
   * @param auth - Twitter authentication credentials
   * @returns The user's Twitter ID
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