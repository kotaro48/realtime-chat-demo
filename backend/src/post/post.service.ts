import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common' // NestJS 内置：Injectable、404、403 异常
import { PrismaService } from '../prisma/prisma.service'
import { CreatePostDto } from './dto/create-post.dto'
import { Role } from '@prisma/client' // Prisma 生成的 Role 枚举

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  // 获取帖子下的所有楼层，按创建时间正序
  async findByThread(threadId: string) {
    const thread = await this.prisma.thread.findUnique({ where: { id: threadId } })
    if (!thread) throw new NotFoundException(`帖子 "${threadId}" 不存在`)

    return this.prisma.post.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, nickname: true, avatarUrl: true, avatarColor: true },
        },
        replyTo: {
          // 显示被引用楼层的摘要，软删除的显示已删除提示
          select: { id: true, content: true, deletedAt: true, author: { select: { nickname: true } } },
        },
      },
    })
  }

  // 在帖子下发一条回复
  async create(threadId: string, dto: CreatePostDto, authorId: string) {
    const thread = await this.prisma.thread.findUnique({ where: { id: threadId } })
    if (!thread) throw new NotFoundException(`帖子 "${threadId}" 不存在`)

    // 如果引用了某楼，验证该楼存在且属于同一帖子
    if (dto.replyToId) {
      const replyTo = await this.prisma.post.findUnique({ where: { id: dto.replyToId } })
      if (!replyTo || replyTo.threadId !== threadId) {
        throw new NotFoundException(`引用的楼层不存在`)
      }
    }

    // 发布新楼后，同步更新 Thread.updatedAt（让版块列表按最新回复排序）
    const [post] = await this.prisma.$transaction([
      this.prisma.post.create({
        data: { content: dto.content, threadId, authorId, replyToId: dto.replyToId },
        include: {
          author: { select: { id: true, nickname: true, avatarUrl: true, avatarColor: true } },
          replyTo: {
            select: { id: true, content: true, deletedAt: true, author: { select: { nickname: true } } },
          },
        },
      }),
      this.prisma.thread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      }),
    ])

    return post
  }

  // 软删除楼层：本人或 MODERATOR/ADMIN 可操作
  async remove(postId: string, requesterId: string, requesterRole: Role) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } })
    if (!post) throw new NotFoundException(`楼层不存在`)
    if (post.deletedAt) throw new NotFoundException(`楼层已被删除`)

    const canDelete =
      post.authorId === requesterId ||
      requesterRole === Role.MODERATOR ||
      requesterRole === Role.ADMIN

    if (!canDelete) throw new ForbiddenException('无权删除此楼层')

    return this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    })
  }
}
