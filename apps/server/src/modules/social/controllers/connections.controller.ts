import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { User } from '@/auth/decorators/user.decorator';
import { SupabaseService } from '@/supabase/supabase.service';

@Controller('social/connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getUserConnections(@User('sub') userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('social_connections')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }
} 