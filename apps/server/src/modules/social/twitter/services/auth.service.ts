import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApiService } from './twitter-api.service';
import OAuth from 'oauth-1.0a';
import { createHmac } from 'crypto';
import { SupabaseService } from '@/supabase/supabase.service';
import * as crypto from 'crypto';

@Injectable()
export class TwitterAuthService {
  private readonly oauth: InstanceType<typeof OAuth>;
  private readonly logger = new Logger(TwitterAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly twitterApiService: TwitterApiService,
    private readonly supabaseService: SupabaseService,
  ) {
    const consumerKey = this.configService.get('TWITTER_CONSUMER_KEY');
    const consumerSecret = this.configService.get('TWITTER_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      this.logger.error('Twitter API credentials are not configured');
      throw new Error('Twitter API credentials are not configured');
    }

    this.logger.debug(`Initializing Twitter OAuth with consumer key: ${consumerKey.substring(0, 5)}...`);

    this.oauth = new (OAuth as any)({
      consumer: {
        key: consumerKey,
        secret: consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString: string, key: string) => {
        return crypto
          .createHmac('sha1', key)
          .update(baseString)
          .digest('base64');
      },
    });
  }

  async getAuthorizationUrl(userId: string, agentId: string): Promise<string> {
    try {
      const serverUrl = this.configService.get('SERVER_URL');
      const callbackUrl = `${serverUrl}/api/social/twitter/auth/callback`;
      
      // Create state parameter with both user and agent IDs
      const state = encodeURIComponent(JSON.stringify({ userId, agentId }));
      
      const requestData = {
        url: 'https://api.twitter.com/oauth/request_token',
        method: 'POST',
        data: { 
          oauth_callback: `${callbackUrl}?state=${state}`
        }
      };

      const headers = this.oauth.toHeader(this.oauth.authorize(requestData));
      const response = await fetch('https://api.twitter.com/oauth/request_token', {
        method: 'POST',
        headers: headers as unknown as HeadersInit
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Twitter API error: ${response.status} - ${errorText}`);
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.text();
      const { oauth_token } = Object.fromEntries(new URLSearchParams(data));
      
      return `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
    } catch (error) {
      this.logger.error('Failed to get authorization URL:', error);
      throw error;
    }
  }

  async handleCallback(
    state: string,
    oauthToken: string,
    oauthVerifier: string
  ): Promise<{ redirectUrl: string }> {
    try {
      const stateData = JSON.parse(decodeURIComponent(state));
      const { userId, agentId } = stateData;

      if (!userId || !agentId) {
        throw new Error('Invalid state parameter');
      }

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
        headers: {
          ...headers as unknown as HeadersInit,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.text();
      const params = new URLSearchParams(data);
      const accessToken = params.get('oauth_token');
      const refreshToken = params.get('oauth_token_secret');
      const username = params.get('screen_name');

      if (!accessToken || !refreshToken || !username) {
        throw new Error('Failed to get required tokens from Twitter');
      }

      await this.supabaseService.client
        .from('social_connections')
        .insert({
          user_id: userId,
          agent_id: agentId,
          platform: 'twitter',
          access_token: accessToken,
          refresh_token: refreshToken,
          username: username,
          token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          platform_settings: {}
        });

      const clientUrl = this.configService.get('CLIENT_URL');
      const twitterData = {
        username: username,
        token: accessToken,
        tokenSecret: refreshToken
      };

      return {
        redirectUrl: `${clientUrl}/dashboard/automation?step=social&status=success&twitterData=${encodeURIComponent(JSON.stringify(twitterData))}&agentId=${agentId}`
      };
    } catch (error) {
      this.logger.error('Twitter callback error:', error);
      throw error;
    }
  }
} 