import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase;
  private readonly logger = new Logger(AuthService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    this.logger.debug(`Supabase URL: ${supabaseUrl ? 'exists' : 'missing'}`);
    this.logger.debug(`Supabase Key: ${supabaseKey ? 'exists' : 'missing'}`);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        `Supabase configuration is missing: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async validateToken(token: string) {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  }
} 