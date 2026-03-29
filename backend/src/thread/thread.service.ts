import { Injectable, NotFoundException } from '@nestjs/common'   // NestJS 内置：Injectable 标记可注入的 Service，NotFoundException 返回 404
import { PrismaService } from '../prisma/prisma.service'
import { CreateThreadDto } from './dto/create-thread.dto'

@Injectable()
export class ThreadService {
  constructor(private readonly prisma: PrismaService) {}

  // 获取指定版块下的帖子列表，按最新回复时间倒序
  async findByBoard(slug: string) {
    const board = await this.prisma.board.findUnique({ where: { slug } })
    if (!board) throw new NotFoundException(`版块 "${slug}" 不存在`)

    return this.prisma.thread.findMany({
      where: { boardId: board.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        author: {
          select: { id: true, nickname: true, avatarUrl: true, avatarColor: true },
        },
        _count: { select: { posts: true } }, // 统计回复数量
      },
    })
  }

  // 创建新帖：同时创建 Thread 和第一楼 Post（用事务保证原子性）
  async create(slug: string, dto: CreateThreadDto, authorId: string) {
    const board = await this.prisma.board.findUnique({ where: { slug } })
    if (!board) throw new NotFoundException(`版块 "${slug}" 不存在`)

    return this.prisma.$transaction(async (tx) => {
      const thread = await tx.thread.create({
        data: {
          title: dto.title,
          boardId: board.id,
          authorId,
        },
      })

      await tx.post.create({
        data: {
          content: dto.content,
          threadId: thread.id,
          authorId,
        },
      })

      return thread
    })
  }
}
