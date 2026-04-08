import { Injectable, NotFoundException } from '@nestjs/common'   // NestJS 内置：Injectable 标记可注入的 Service，NotFoundException 返回 404
import { PrismaService } from '../prisma/prisma.service'
import { CreateThreadDto } from './dto/create-thread.dto'

// 版块名 board 关联字段
const BOARD_INCLUDE = { board: { select: { name: true, slug: true } } } as const

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

  // 全版块热度排名：posts数 × e^(-0.05 × hours_since_created)
  async trending(limit: number, boardSlug?: string) {
    const where = boardSlug ? { board: { slug: boardSlug } } : {}
    const threads = await this.prisma.thread.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: { ...BOARD_INCLUDE, _count: { select: { posts: true } } },
    })

    const now = Date.now()
    return threads
      .map(t => {
        const hours = (now - t.createdAt.getTime()) / 3600000
        const score = t._count.posts * Math.exp(-0.05 * hours)
        return { ...t, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // 全版块最新帖，支持分页和版块过滤
  async recent(limit: number, offset: number, boardSlug?: string) {
    const where = boardSlug ? { board: { slug: boardSlug } } : {}
    return this.prisma.thread.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: { ...BOARD_INCLUDE, _count: { select: { posts: true } } },
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
