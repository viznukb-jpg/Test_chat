import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async register(body: any) {
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

  async login(body: any) {
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
    return { success: true };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    
    const accessToken = this.jwtService.sign(payload);
    
    // Встановлюємо токен в Redis на 7 днів
    const TTL_7_DAYS = 60 * 60 * 24 * 7;
    await this.redisService.set(`auth:sessions:${userId}`, accessToken, 'EX', TTL_7_DAYS);

    return {
      accessToken,
    };
  }
}
