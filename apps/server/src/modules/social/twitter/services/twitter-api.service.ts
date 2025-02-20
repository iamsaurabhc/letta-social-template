import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { TwitterAuth, TwitterResponse } from '../interfaces/twitter.interface';

@Injectable()
export class TwitterApiService {
  private readonly logger = new Logger(TwitterApiService.name);
  private readonly TWITTER_API_BASE = 'https://api.twitter.com/2';
  private readonly TWITTER_UPLOAD_API_BASE = 'https://upload.twitter.com/1.1';
  private readonly oauth: OAuth;

  constructor(private readonly configService: ConfigService) {
    this.oauth = new OAuth({
      consumer: {
        key: this.configService.get<string>('TWITTER_CONSUMER_KEY'),
        secret: this.configService.get<string>('TWITTER_CONSUMER_SECRET'),
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString: string, key: string) {
        return crypto
          .createHmac('sha1', key)
          .update(baseString)
          .digest('base64');
      },
    });
  }

  async makeTwitterRequest<T>(
    endpoint: string,
    options: RequestInit & { baseUrl?: string },
    auth: TwitterAuth,
    retryCount = 0
  ): Promise<TwitterResponse<T>> {
    const MAX_RETRIES = 10;
    const BASE_DELAY = 2000;

    try {
      const baseUrl = options.baseUrl || this.TWITTER_API_BASE;
      const url = `${baseUrl}${endpoint}`;
      const requestData = {
        url,
        method: options.method ?? 'GET',
      };

      const token = {
        key: auth.accessToken,
        secret: auth.refreshToken,
      };

      const authHeader = this.oauth.toHeader(this.oauth.authorize(requestData, token));

      const response = await fetch(url, {
        ...options,
        headers: {
          ...authHeader,
          ...options.headers,
        },
      });

      if (response.status === 429 && retryCount < MAX_RETRIES) {
        const waitTime = this.calculateRetryDelay(response, retryCount, BASE_DELAY);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.makeTwitterRequest(endpoint, options, auth, retryCount + 1);
      }

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Twitter API request failed: ${error.message}`);
      throw error;
    }
  }

  private calculateRetryDelay(response: Response, retryCount: number, baseDelay: number): number {
    const resetTime = response.headers.get('x-rate-limit-reset');
    return resetTime
      ? (parseInt(resetTime) * 1000) - Date.now()
      : Math.min(Math.pow(2, retryCount) * baseDelay, 60000);
  }
} 