import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase;
  private readonly logger = new Logger(AuthService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    this.logger.debug(`Initializing Supabase client...`);
    this.logger.debug(`URL exists: ${!!supabaseUrl}`);
    this.logger.debug(`Key exists: ${!!supabaseKey}`);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      this.logger.error(`Sign up error: ${error.message}`);
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.error(`Sign in error: ${error.message}`);
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async validateToken(token: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error || !user) {
        this.logger.error('Token validation error:', error);
        throw new UnauthorizedException('Invalid token');
      }

      return {
        id: user.id,
        email: user.email
      };
    } catch (error) {
      this.logger.error('Token validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
} 