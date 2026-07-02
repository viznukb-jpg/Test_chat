import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly redisService: RedisService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'super-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const userId = payload.sub;

    // Перевірка Whitelist у Redis
    const sessionToken = await this.redisService.get(`auth:sessions:${userId}`);
    
    if (!sessionToken) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    return { userId };
  }
}
