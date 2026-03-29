import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface FindOrCreateUserInput {
  googleId: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async findOrCreateUser(input: FindOrCreateUserInput) {
    const existing = await this.prisma.user.findUnique({
      where: { googleId: input.googleId },
    });
    if (existing) return existing;

    return this.prisma.user.create({
      data: {
        googleId: input.googleId,
        email: input.email,
        nickname: input.nickname,
        avatarUrl: input.avatarUrl,
      },
    });
  }

  async register(email: string, password: string, nickname: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('このメールアドレスは既に登録されています');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, nickname, passwordHash },
    });
    return this.login(user);
  }

  async loginWithPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが違います');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが違います');
    }
    return this.login(user);
  }

  login(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
