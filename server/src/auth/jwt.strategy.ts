import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret',
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;

    // Перевірка Whitelist у Redis
    const sessionToken = await this.redisService.get(`auth:sessions:${userId}`);
    
    if (!sessionToken) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    return { userId };
  }
}
