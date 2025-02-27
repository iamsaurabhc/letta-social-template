import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private redis: Redis;
  private readonly logger = new Logger(CacheService.name);
  private readonly DEFAULT_TTL = 300; // 5 minutes

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.initializeRedisConnection();
  }

  private initializeRedisConnection() {
    try {
      const connectionString = `rediss://default:${this.configService.get('REDIS_PASSWORD')}@${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`;
      
      this.redis = new Redis(connectionString, {
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        lazyConnect: true,
        retryStrategy(times) {
          const delay = Math.min(times * 1000, 5000);
          return delay;
        }
      });

      this.redis.on('error', (error) => {
        this.logger.error(`Redis connection error: ${error.message}`);
      });

      this.redis.on('connect', () => {
        this.logger.log('Successfully connected to Redis');
      });

      this.logger.log('Initialized Redis connection');
    } catch (error) {
      this.logger.error(`Failed to initialize Redis: ${error.message}`);
      throw error;
    }
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
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttl, serializedValue);
    } catch (error) {
      this.logger.error(`Cache set error: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error: ${error.message}`);
    }
  }
} 