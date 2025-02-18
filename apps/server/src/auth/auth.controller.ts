import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }
} 