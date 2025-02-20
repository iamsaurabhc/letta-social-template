import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LettaModule } from './modules/letta/letta.module';
import { SocialModule } from './modules/social/social.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [() => ({
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        JWT_SECRET: process.env.JWT_SECRET,
        LETTA_API_URL: process.env.LETTA_API_URL,
        LETTA_PASSWORD: process.env.LETTA_PASSWORD,
        TWITTER_API_KEY: process.env.TWITTER_API_KEY,
        LINKEDIN_API_KEY: process.env.LINKEDIN_API_KEY,
      })],
    }),
    AuthModule,
    LettaModule,
    SocialModule,
  ],
  controllers: [AppController],
})
export class AppModule {} 