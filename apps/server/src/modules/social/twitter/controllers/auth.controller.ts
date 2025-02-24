import { Controller, Get, Req, Res, UseGuards, Logger, UnauthorizedException, BadRequestException, Query } from '@nestjs/common';
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
    state?: string;
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
  async getAuthUrl(
    @Req() request: AuthenticatedRequest,
    @Query('agentId') agentId: string
  ) {
    if (!request.user?.id) {
      this.logger.error('No user ID in request');
      throw new UnauthorizedException('User not authenticated');
    }
    
    if (!agentId) {
      this.logger.error('No agent ID provided');
      throw new BadRequestException('Agent ID is required');
    }
    
    this.logger.debug('Getting Twitter auth URL');
    this.logger.debug(`User ID from request: ${request.user.id}`);
    this.logger.debug(`Agent ID from request: ${agentId}`);
    
    try {
      const authUrl = await this.twitterAuthService.getAuthorizationUrl(request.user.id, agentId);
      this.logger.debug(`Auth URL generated: ${authUrl}`);
      return { url: authUrl };
    } catch (error) {
      this.logger.error('Failed to get auth URL:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get('callback')
  async handleCallback(
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const { oauth_token, oauth_verifier, state } = request.query;
    
    try {
      const userId = state;
      const { redirectUrl } = await this.twitterAuthService.handleCallback(
        userId,
        oauth_token as string,
        oauth_verifier as string
      );
      
      return response.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Twitter auth error:', error);
      const clientUrl = this.configService.get('CLIENT_URL');
      return response.redirect(`${clientUrl}/dashboard/automation?step=social&status=error&message=${encodeURIComponent(error.message)}`);
    }
  }
} 