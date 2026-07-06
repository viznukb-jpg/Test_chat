import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { hashToken } from './auth.service';

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
    const secretOrKey = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secretOrKey) {
      throw new Error(
        'JWT_ACCESS_SECRET is not defined in environment variables',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromRequest]),
      ignoreExpiration: false,
      secretOrKey,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload & { sessionId?: string }) {
    const userId = payload.sub;
    const incomingToken = extractTokenFromRequest(req);

    if (incomingToken) {
      const isBlacklisted = await this.redisService.get(
        `blacklist:${hashToken(incomingToken)}`,
      );
      if (isBlacklisted) {
        throw new UnauthorizedException('Token revoked');
      }
    }

    if (payload.sessionId) {
      const activeSession = await this.redisService.get(
        `active_session:${userId}`,
      );
      if (!activeSession || activeSession !== payload.sessionId) {
        throw new UnauthorizedException(
          'Session expired or invalid',
        );
      }
    }

    return { userId };
  }
}
