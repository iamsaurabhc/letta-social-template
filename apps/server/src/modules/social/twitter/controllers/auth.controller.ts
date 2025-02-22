import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../auth/guards/jwt.guard';
import { TwitterAuthService } from '../services/auth.service';

// Custom interface for the request with user property
interface AuthenticatedRequest {
  user: {
    id: string;
    [key: string]: any;
  };
  query: {
    oauth_token?: string;
    oauth_verifier?: string;
    [key: string]: string | undefined;
  };
}

@Controller('social/twitter/auth')
export class TwitterAuthController {
  private readonly logger = new Logger(TwitterAuthController.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly twitterAuthService: TwitterAuthService,
  ) {}

  @Get('url')
  @UseGuards(JwtAuthGuard)
  async getAuthUrl() {
    this.logger.debug('Getting Twitter auth URL');
    const authUrl = await this.twitterAuthService.getAuthorizationUrl();
    this.logger.debug(`Auth URL generated: ${authUrl}`);
    return { url: authUrl };
  }

  @Get('callback')
  @UseGuards(JwtAuthGuard)
  async handleCallback(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const { oauth_token, oauth_verifier } = request.query;
    
    try {
      const twitterData = await this.twitterAuthService.handleCallback(
        request.user.id,
        oauth_token as string,
        oauth_verifier as string
      );
      
      const clientUrl = this.configService.get('CLIENT_URL');
      const encodedData = encodeURIComponent(JSON.stringify(twitterData));
      return response.redirect(`${clientUrl}/dashboard?step=social&status=success&twitterData=${encodedData}`);
    } catch (error) {
      console.error('Twitter auth error:', error);
      const clientUrl = this.configService.get('CLIENT_URL');
      return response.redirect(`${clientUrl}/dashboard?step=social&status=error`);
    }
  }
} 