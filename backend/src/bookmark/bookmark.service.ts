import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private readonly prisma: PrismaService) {}

  // 返回创建的书签记录，让前端可以乐观更新或刷新
  async addBookmark(userId: string, threadId: string) {
    return this.prisma.threadBookmark.upsert({
      where: { userId_threadId: { userId, threadId } },
      update: {},
      create: { userId, threadId },
    });
  }

  // 返回受影响的行数（count）
  async removeBookmark(userId: string, threadId: string) {
    return this.prisma.threadBookmark.deleteMany({
      where: { userId, threadId },
    });
  }

  async getBookmarks(userId: string) {
    const rows = await this.prisma.threadBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        thread: {
          include: {
            board: { select: { slug: true, name: true } },
            author: { select: { nickname: true, avatarColor: true } },
            _count: { select: { posts: true } },
          },
        },
      },
    });
    return rows.map(r => ({
      bookmarkedAt: r.createdAt,
      thread: {
        id: r.thread.id,
        title: r.thread.title,
        createdAt: r.thread.createdAt,
        updatedAt: r.thread.updatedAt,
        board: r.thread.board,
        author: r.thread.author,
        postCount: r.thread._count.posts,
      },
    }));
  }
}
