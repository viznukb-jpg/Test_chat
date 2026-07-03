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
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

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
  ) {}

  async register(body: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(body.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
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

    return this.generateTokens(user.id);
  }

  async logout(userId: string) {
    await this.redisService.del(`auth:sessions:${userId}`);

    await this.refreshTokenRepository.softDelete({ userId });
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

  async deleteAccount(userId: string) {
    await this.redisService.del(`auth:sessions:${userId}`);

    await this.usersService.delete(userId);
    return { success: true };
  }

  async refreshTokens(token: string) {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ deletedAt: new Date() })
      .where('token = :token', { token })
      .andWhere('deletedAt IS NULL')
      .andWhere('expiresAt > :now', { now: new Date() })
      .returning('*')
      .execute();

    const row = result.raw?.[0];

    if (!row) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId: string = row.user_id;

    return this.generateTokens(userId);
  }

  async generateTokens(userId: string) {
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload);

    const TTL_15_MINS = 15 * 60;
    await this.redisService.set(
      `auth:sessions:${userId}`,
      accessToken,
      'EX',
      TTL_15_MINS,
    );

    // Delete all old refresh tokens for this user before creating a new one
    await this.refreshTokenRepository.softDelete({ userId });

    const refreshTokenString = randomBytes(40).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshTokenString,
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
