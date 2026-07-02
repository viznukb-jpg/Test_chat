import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { RedisService } from '@/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  async logout(userId: string) {
    await this.redisService.del(`auth:sessions:${userId}`);
    // Soft delete all refresh tokens for this user
    await this.refreshTokenRepository.softDelete({ userId });
    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  async deleteAccount(userId: string) {
    // 1. Delete session from Redis
    await this.redisService.del(`auth:sessions:${userId}`);
    // 2. Delete user from DB (cascade should handle rooms/messages where applicable)
    await this.usersService.delete(userId);
    return { success: true };
  }

  async refreshTokens(token: string) {
    const refreshTokenRecord = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: { user: true },
    });

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshTokenRecord.expiresAt < new Date()) {
      await this.refreshTokenRepository.softRemove(refreshTokenRecord);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = refreshTokenRecord.user;
    
    // Soft remove the old token
    await this.refreshTokenRepository.softRemove(refreshTokenRecord);

    return this.generateTokens(user.id);
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload);
    
    // Save to Redis (Whitelist)
    // 15 mins for access token TTL in Redis
    const TTL_15_MINS = 15 * 60;
    await this.redisService.set(`auth:sessions:${userId}`, accessToken, 'EX', TTL_15_MINS);

    // Generate refresh token
    const refreshTokenString = randomBytes(40).toString('hex');
    
    // 7 days expiration for refresh token
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
