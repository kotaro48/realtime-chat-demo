import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'; // nestjs core
import { PrismaService } from '../prisma/prisma.service';
import { CreateWallPinDto } from './dto/create-wall-pin.dto';
import { UpdateWallPinDto } from './dto/update-wall-pin.dto';

function detectPlatform(url: string): string {
  if (/twitter\.com|x\.com/.test(url)) return 'twitter';
  if (/instagram\.com/.test(url)) return 'instagram';
  return 'other';
}

@Injectable()
export class WallPinService {
  constructor(private readonly prisma: PrismaService) {}

  async preview(url: string) {
    return this.fetchOgp(url);
  }

  async create(userId: string, dto: CreateWallPinDto) {
    const ogp = await this.fetchOgp(dto.url);
    return this.prisma.wallPin.create({
      data: {
        userId,
        url: dto.url,
        platform: detectPlatform(dto.url),
        title: ogp.title,
        description: ogp.description,
        imageUrl: ogp.imageUrl,
        authorName: ogp.authorName,
        authorAvatar: ogp.authorAvatar,
        siteName: ogp.siteName,
        memo: dto.memo ?? null,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.wallPin.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateWallPinDto) {
    const pin = await this.prisma.wallPin.findUnique({ where: { id } });
    if (!pin) throw new NotFoundException();
    if (pin.userId !== userId) throw new ForbiddenException();
    return this.prisma.wallPin.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const pin = await this.prisma.wallPin.findUnique({ where: { id } });
    if (!pin) throw new NotFoundException();
    if (pin.userId !== userId) throw new ForbiddenException();
    return this.prisma.wallPin.delete({ where: { id } });
  }

  private async fetchOgp(url: string) {
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
    if (!res.ok) return {};
    const json: any = await res.json();
    const d = json.data ?? {};
    return {
      title: d.title ?? null,
      description: d.description ?? null,
      imageUrl: d.image?.url ?? d.logo?.url ?? null,
      authorName: d.author ?? d.publisher ?? null,
      authorAvatar: d.logo?.url ?? null,
      siteName: d.publisher ?? null,
    };
  }
}
