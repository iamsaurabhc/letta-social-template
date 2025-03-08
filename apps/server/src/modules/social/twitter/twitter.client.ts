import { Injectable, Logger } from '@nestjs/common';
import { TwitterAuth, TweetResponse } from './interfaces/twitter.interface';

interface TweetParams {
  text: string;
  auth: TwitterAuth;
  userId: string;
  media?: {
    media_ids?: string[];
    tagged_user_ids?: string[];
  };
}

@Injectable()
export class TwitterClient {
  private readonly logger = new Logger(TwitterClient.name);
  private readonly API_BASE_URL = 'https://api.twitter.com/2';

  async tweet({ text, auth, media }: TweetParams): Promise<TweetResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/tweets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          ...(media && { media }),
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Twitter API error: ${JSON.stringify(error)}`);
      }

      const data = await response.json();
      
      return {
        id: data.data.id,
        text: data.data.text,
        url: `https://twitter.com/i/web/status/${data.data.id}`
      };
    } catch (error) {
      this.logger.error('Failed to post tweet:', error);
      throw error;
    }
  }
} 