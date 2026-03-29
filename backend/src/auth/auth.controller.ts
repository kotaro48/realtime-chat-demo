import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 注册新账号
  @Post('register')
  @ApiOperation({ summary: '注册新账号，返回 JWT' })
  async register(@Body() body: { email: string; password: string; nickname: string }) {
    return this.authService.register(body.email, body.password, body.nickname);
  }

  // 邮箱+密码登录
  @Post('login')
  @ApiOperation({ summary: '邮箱密码登录，返回 JWT' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.loginWithPassword(body.email, body.password);
  }

  // 跳转到 Google 授权页
  @Get('google')
  @ApiOperation({ summary: '跳转 Google OAuth 登录页' })
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  // Google 回调，生成 JWT 后重定向前端
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth 回调，返回 JWT' })
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { id: string; email: string };
    const { accessToken } = this.authService.login(user);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  // 返回当前登录用户信息
  @Get('me')
  @ApiOperation({ summary: '获取当前登录用户信息' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: Request) {
    return req.user;
  }
}
