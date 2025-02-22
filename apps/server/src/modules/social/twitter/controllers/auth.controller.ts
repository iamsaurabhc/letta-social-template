import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
  constructor(
    private readonly configService: ConfigService,
    private readonly twitterAuthService: TwitterAuthService,
  ) {}

  @Get()
  async initiateAuth(@Res() response: Response) {
    const authUrl = await this.twitterAuthService.getAuthorizationUrl();
    return response.redirect(authUrl);
  }

  @Get('callback')
  @UseGuards(JwtAuthGuard)
  async handleCallback(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const { oauth_token, oauth_verifier } = request.query;
    
    try {
      await this.twitterAuthService.handleCallback(
        request.user.id,
        oauth_token as string,
        oauth_verifier as string
      );
      
      // Redirect back to the app
      const appUrl = this.configService.get('APP_URL');
      return response.redirect(`${appUrl}/automation?step=social&status=success`);
    } catch (error) {
      console.error('Twitter auth error:', error);
      const appUrl = this.configService.get('APP_URL');
      return response.redirect(`${appUrl}/automation?step=social&status=error`);
    }
  }
} 