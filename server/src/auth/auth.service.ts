import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { RedisService } from '@/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { randomBytes, createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { APP_CONSTANTS } from '@/common/constants/app.constants';
import { ChatGateway } from '@/chat/chat.gateway';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly chatGateway: ChatGateway,
  ) {}

  async register(body: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(body.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (body.username) {
      const existingUsername = await this.usersService.findByUsername(
        body.username,
      );
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await this.usersService.create({
      email: body.email,
      username: body.username,
      passwordHash,
    });

    return this.generateTokens(user.id);
  }

  async login(body: LoginDto) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Single session constraint: log out from all other devices
    await this.refreshTokenRepository.softDelete({ userId: user.id });

    // Kick from WS immediately
    this.chatGateway.disconnectUser(user.id);

    return this.generateTokens(user.id);
  }

  async logout(userId: string, refreshToken?: string, accessToken?: string) {
    if (refreshToken) {
      // Clear all active refresh tokens for the user to enforce strict single-session
      await this.refreshTokenRepository.softDelete({
        userId,
      });
    }
    if (accessToken) {
      // Blacklist access token for 15 minutes (match expiration)
      await this.redisService.set(
        `blacklist:${hashToken(accessToken)}`,
        '1',
        'EX',
        APP_CONSTANTS.AUTH.ACCESS_TOKEN_EXPIRES_IN_SEC,
      );
    }

    // Clear active session to immediately log out other devices
    await this.redisService.del(`active_session:${userId}`);

    // Disconnect any active WebSockets
    this.chatGateway.disconnectUser(userId);

    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async deleteAccount(userId: string, accessToken?: string) {
    if (accessToken) {
      await this.redisService.set(
        `blacklist:${hashToken(accessToken)}`,
        '1',
        'EX',
        APP_CONSTANTS.AUTH.ACCESS_TOKEN_EXPIRES_IN_SEC,
      );
    }

    await this.redisService.del(`active_session:${userId}`);
    this.chatGateway.disconnectUser(userId);

    await this.usersService.delete(userId);
    return { success: true };
  }

  async refreshTokens(token: string) {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ deletedAt: new Date() })
      .where('token = :token', { token: hashToken(token) })
      .andWhere('deletedAt IS NULL')
      .andWhere('expiresAt > :now', { now: new Date() })
      .returning('*')
      .execute();

    const rawData = result.raw as Array<{ user_id: string }> | undefined;
    const row = rawData?.[0];

    if (!row) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId: string = row.user_id;

    return this.generateTokens(userId);
  }

  async generateTokens(userId: string) {
    const sessionId = randomBytes(16).toString('hex');
    const payload = { sub: userId, sessionId };
    const accessToken = this.jwtService.sign(payload);

    await this.redisService.set(
      `active_session:${userId}`,
      sessionId,
      'EX',
      APP_CONSTANTS.AUTH.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60,
    );

    const refreshTokenString = randomBytes(40).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + APP_CONSTANTS.AUTH.REFRESH_TOKEN_EXPIRES_IN_DAYS,
    );

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: hashToken(refreshTokenString),
      userId: userId,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: refreshTokenString,
    };
  }
}
