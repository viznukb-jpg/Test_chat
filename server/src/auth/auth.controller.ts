import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import express from 'express';

interface AuthUser {
  userId: string;
}

const COOKIE_OPTIONS_ACCESS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const COOKIE_OPTIONS_REFRESH = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const tokens = await this.authService.register(body);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true };
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const tokens = await this.authService.login(body);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true };
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    // Try to get refresh token from httpOnly cookie first, then from body
    const cookies = req.cookies as Record<string, string | undefined>;
    const body = req.body as Record<string, any>;
    const refreshToken =
      cookies?.refreshToken || (body?.refreshToken as string | undefined);

    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED);
      return { message: 'No refresh token provided' };
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const user = req.user as AuthUser;
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken = cookies?.refreshToken;
    const accessToken = cookies?.accessToken;
    const result = await this.authService.logout(
      user.userId,
      refreshToken,
      accessToken,
    );
    this.clearTokenCookies(res);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() req: express.Request) {
    const user = req.user as AuthUser;
    return this.authService.getMe(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('me')
  async deleteAccount(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const user = req.user as AuthUser;
    const cookies = req.cookies as Record<string, string | undefined>;
    const accessToken = cookies?.accessToken;
    const result = await this.authService.deleteAccount(
      user.userId,
      accessToken,
    );
    this.clearTokenCookies(res);
    return result;
  }

  private setTokenCookies(
    res: express.Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('accessToken', accessToken, COOKIE_OPTIONS_ACCESS);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS_REFRESH);
  }

  private clearTokenCookies(res: express.Response) {
    res.clearCookie('accessToken', {
      ...COOKIE_OPTIONS_ACCESS,
      maxAge: 0,
    });
    res.clearCookie('refreshToken', {
      ...COOKIE_OPTIONS_REFRESH,
      maxAge: 0,
    });
  }
}
