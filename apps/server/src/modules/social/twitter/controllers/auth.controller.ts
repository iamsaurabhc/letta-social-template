import { Controller, Get, Req, Res, UseGuards, Logger, UnauthorizedException, BadRequestException, Query, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../auth/guards/jwt.guard';
import { TwitterAuthService } from '../services/auth.service';
import { SupabaseService } from '../../../../supabase/supabase.service';

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
@UseGuards(JwtAuthGuard)
export class TwitterAuthController {
  private readonly logger = new Logger(TwitterAuthController.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly twitterAuthService: TwitterAuthService,
    private readonly supabaseService: SupabaseService,
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
      if (!oauth_token || !oauth_verifier) {
        throw new Error('Missing OAuth token or verifier');
      }

      if (!state) {
        throw new Error('Missing state parameter');
      }

      const { redirectUrl } = await this.twitterAuthService.handleCallback(
        state as string,
        oauth_token as string,
        oauth_verifier as string
      );
      
      return response.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Twitter auth error:', error);
      const clientUrl = this.configService.get('CLIENT_URL');
      const errorMessage = encodeURIComponent(error.message || 'Failed to authenticate with Twitter');
      return response.redirect(`${clientUrl}/dashboard/automation?step=social&status=error&message=${errorMessage}`);
    }
  }

  @Get('timeline-status')
  @UseGuards(JwtAuthGuard)
  async getTimelineStatus(
    @Query('agentId') agentId: string,
    @Request() req
  ) {
    if (!agentId) {
      throw new BadRequestException('Agent ID is required');
    }

    const { data, error } = await this.supabaseService.client
      .from('social_connections')
      .select('timeline_synced, timeline_synced_at')
      .eq('user_id', req.user.id)
      .eq('agent_id', agentId)
      .eq('platform', 'twitter')
      .single();

    if (error) {
      this.logger.error('Failed to get timeline status:', error);
      throw new BadRequestException('Failed to get timeline status');
    }

    return {
      timelineSynced: data?.timeline_synced || false,
      syncedAt: data?.timeline_synced_at
    };
  }
} 