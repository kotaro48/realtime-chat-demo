import { Injectable, ConflictException, NotFoundException } from '@nestjs/common' // NestJS 内置：Injectable 标记可注入的服务，ConflictException/NotFoundException 是标准 HTTP 异常
import { PrismaService } from '../prisma/prisma.service'
import { CreateBoardDto } from './dto/create-board.dto'

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {} // PrismaService 由 NestJS 依赖注入，类似 Spring 的 @Autowired

  // 获取所有版块，附带每个版块的帖子数量
  async findAll() {
    return this.prisma.board.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { threads: true } }, // 聚合查询：统计每个版块下的 Thread 数量
      },
    })
  }

  // 根据 slug 获取单个版块
  async findOne(slug: string) {
    const board = await this.prisma.board.findUnique({
      where: { slug },
      include: {
        _count: { select: { threads: true } },
      },
    })
    if (!board) throw new NotFoundException(`版块 "${slug}" 不存在`)
    return board
  }

  // 全站最新动态：取最近更新的 8 条 Thread
  async getActivity() {
    return this.prisma.thread.findMany({
      take: 8,
      orderBy: { updatedAt: 'desc' },
      include: {
        board:  { select: { slug: true, name: true } },
        author: { select: { nickname: true } },
        _count: { select: { posts: true } },
      },
    })
  }

  // 创建新版块（仅 ADMIN）
  async create(dto: CreateBoardDto) {
    // slug 是唯一索引，重复时抛出 409 Conflict
    const exists = await this.prisma.board.findUnique({ where: { slug: dto.slug } })
    if (exists) throw new ConflictException(`slug "${dto.slug}" 已被使用`)

    return this.prisma.board.create({ data: dto })
  }
}
