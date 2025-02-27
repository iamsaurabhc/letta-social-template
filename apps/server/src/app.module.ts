import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LettaModule } from './modules/letta/letta.module';
import { SocialModule } from './modules/social/social.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AppController } from './app.controller';
import { BullModule } from '@nestjs/bull';
import { WorkflowModule } from './modules/workflow/workflow.module';

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
        CLIENT_URL: process.env.CLIENT_URL,
        SERVER_URL: process.env.SERVER_URL,
        TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
        TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
      })],
    }),
    AuthModule,
    LettaModule,
    SocialModule,
    SupabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    WorkflowModule,
  ],
  controllers: [AppController],
})
export class AppModule {} 