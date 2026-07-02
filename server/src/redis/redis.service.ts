import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    super(configService.get<string>('REDIS_URL') || 'redis://localhost:6379');
  }

  onModuleInit() {
    this.logger.log('Redis initialized successfully');

    this.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });

    this.on('connect', () => {
      this.logger.log('Connected to Redis server');
    });
  }

  onModuleDestroy() {
    this.logger.log('Disconnecting from Redis');
    this.disconnect();
  }
}
