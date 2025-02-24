import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApiService } from './twitter-api.service';
import * as OAuth from 'oauth-1.0a';
import { createHmac } from 'crypto';
import { SupabaseService } from '@/supabase/supabase.service';

@Injectable()
export class TwitterAuthService {
  private readonly logger = new Logger(TwitterAuthService.name);
  private readonly oauth: OAuth;

  constructor(
    private readonly configService: ConfigService,
    private readonly twitterApiService: TwitterApiService,
    private readonly supabaseService: SupabaseService,
  ) {
    const consumerKey = this.configService.get('TWITTER_CONSUMER_KEY');
    const consumerSecret = this.configService.get('TWITTER_CONSUMER_SECRET');

    if (!consumerKey || !consumerSecret) {
      throw new Error('Twitter configuration is missing');
    }

    this.logger.debug(`Initializing Twitter OAuth with consumer key: ${consumerKey.substring(0, 5)}...`);

    this.oauth = new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString: string, key: string) => {
        return createHmac('sha1', key).update(baseString).digest('base64');
      }
    });
  }

  async getAuthorizationUrl(userId: string, agentId: string): Promise<string> {
    if (!userId || !agentId) {
      this.logger.error('Missing required parameters');
      throw new Error('User ID and Agent ID are required');
    }

    try {
      const serverUrl = this.configService.get('SERVER_URL');
      if (!serverUrl) {
        throw new Error('SERVER_URL is not configured');
      }

      const callbackUrl = `${serverUrl}/api/social/twitter/auth/callback`;
      this.logger.debug(`Callback URL: ${callbackUrl}`);

      const requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
      
      const state = JSON.stringify({ userId, agentId });
      
      const requestData = {
        url: requestTokenUrl,
        method: 'POST',
        data: { 
          oauth_callback: callbackUrl,
          state: encodeURIComponent(state)
        }
      };

      const authHeaders = this.oauth.toHeader(
        this.oauth.authorize(requestData)
      );

      this.logger.debug(`Request headers: ${JSON.stringify(authHeaders)}`);
      this.logger.debug(`Making request to: ${requestTokenUrl}`);

      const response = await fetch(requestTokenUrl, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Twitter API error: ${response.status} - ${errorText}`);
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.text();
      const params = new URLSearchParams(data);
      const oauth_token = params.get('oauth_token');

      if (!oauth_token) {
        throw new Error('Failed to get OAuth token');
      }

      return `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}&state=${encodeURIComponent(state)}`;
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
      const { userId, agentId } = JSON.parse(state);
      
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

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.statusText}`);
      }

      const data = await response.text();
      const params = new URLSearchParams(data);
      const accessToken = params.get('oauth_token');
      const refreshToken = params.get('oauth_token_secret');

      if (!accessToken || !refreshToken) {
        throw new Error('Failed to get access token');
      }

      const { error } = await this.supabaseService.client
        .from('social_connections')
        .insert({
          user_id: userId,
          agent_id: agentId,
          platform: 'twitter',
          access_token: accessToken,
          refresh_token: refreshToken,
          username: params.get('screen_name'),
          token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          platform_settings: {}
        });

      if (error) {
        this.logger.error('Failed to store Twitter credentials:', error);
        throw new Error('Failed to store Twitter credentials');
      }

      // Return the Twitter data along with saving to DB
      const twitterData = {
        token: accessToken,
        tokenSecret: refreshToken,
        id: userId,
        username: params.get('screen_name')
      };

      const clientUrl = this.configService.get('CLIENT_URL');
      const encodedData = encodeURIComponent(JSON.stringify(twitterData));
      
      // Return the URL instead of redirecting
      return {
        redirectUrl: `${clientUrl}/dashboard/automation?step=social&status=success&twitterData=${encodedData}&agentId=${agentId}`
      };
    } catch (error) {
      this.logger.error('Twitter callback error:', error);
      throw error;
    }
  }
} 