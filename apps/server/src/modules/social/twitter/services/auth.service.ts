import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApiService } from './twitter-api.service';
import { createClient } from '@supabase/supabase-js';
import * as OAuth from 'oauth-1.0a';
import crypto from 'crypto';

@Injectable()
export class TwitterAuthService {
  private readonly logger = new Logger(TwitterAuthService.name);
  private readonly supabase;
  private readonly oauth: OAuth;

  constructor(
    private readonly configService: ConfigService,
    private readonly twitterApiService: TwitterApiService,
  ) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_KEY')
    );

    this.oauth = new OAuth({
      consumer: {
        key: this.configService.get('TWITTER_CONSUMER_KEY'),
        secret: this.configService.get('TWITTER_CONSUMER_SECRET'),
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString: string, key: string) {
        return crypto.createHmac('sha1', key).update(baseString).digest('base64');
      },
    });
  }

  async getAuthorizationUrl(): Promise<string> {
    const callbackUrl = this.configService.get<string>(
      process.env.NODE_ENV === 'production'
        ? 'TWITTER_CALLBACK_URL'
        : 'TWITTER_CALLBACK_URL_DEV'
    );

    // Get request token using OAuth 1.0a
    const requestTokenURL = 'https://api.twitter.com/oauth/request_token';
    const requestData = {
      url: requestTokenURL,
      method: 'POST',
      data: { oauth_callback: callbackUrl }
    };

    const headers = this.oauth.toHeader(this.oauth.authorize(requestData));
    const response = await fetch(requestTokenURL, {
      method: 'POST',
      headers: headers as unknown as HeadersInit
    });

    const data = await response.text();
    const oauthToken = new URLSearchParams(data).get('oauth_token');

    if (!oauthToken) {
      throw new Error('Failed to get request token');
    }

    return `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;
  }

  async handleCallback(
    userId: string,
    oauthToken: string,
    oauthVerifier: string
  ): Promise<void> {
    // Exchange for access token
    const accessTokenURL = 'https://api.twitter.com/oauth/access_token';
    const requestData = {
      url: accessTokenURL,
      method: 'POST',
      data: { 
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier
      }
    };

    const headers = this.oauth.toHeader(this.oauth.authorize(requestData));
    const response = await fetch(accessTokenURL, {
      method: 'POST',
      headers: headers as unknown as HeadersInit
    });

    const data = await response.text();
    const params = new URLSearchParams(data);
    const accessToken = params.get('oauth_token');
    const refreshToken = params.get('oauth_token_secret');

    if (!accessToken || !refreshToken) {
      throw new Error('Failed to get access token');
    }

    // Store in Supabase
    const { error } = await this.supabase
      .from('social_connections')
      .insert({
        user_id: userId,
        platform: 'twitter',
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        platform_settings: {}
      });

    if (error) {
      this.logger.error('Failed to store Twitter credentials:', error);
      throw new Error('Failed to store Twitter credentials');
    }
  }
} 