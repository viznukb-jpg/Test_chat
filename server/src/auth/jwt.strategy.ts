import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

function extractTokenFromRequest(req: Request): string | null {
  if (req.cookies && typeof req.cookies === 'object') {
    const cookies = req.cookies as Record<string, unknown>;

    if (typeof cookies.accessToken === 'string') {
      return cookies.accessToken;
    }
  }

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly redisService: RedisService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromRequest]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'super-secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const userId = payload.sub;
    const incomingToken = extractTokenFromRequest(req);

    const storedToken = await this.redisService.get(`auth:sessions:${userId}`);

    if (!storedToken || storedToken !== incomingToken) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    return { userId };
  }
}
