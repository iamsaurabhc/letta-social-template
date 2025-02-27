import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);
  private readonly DEFAULT_TTL = 300; // 5 minutes

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Cache get error: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      this.logger.error(`Cache set error: ${error.message}`);
    }
  }
} 