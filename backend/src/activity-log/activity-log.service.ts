/**
 * [INPUT]: 依赖 PrismaService 的数据库操作，依赖 DTO 的请求参数
 * [OUTPUT]: 对外提供 ActivityLogService（CRUD 方法）
 * [POS]: activity-log 模块的核心业务层，被 ActivityLogController 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'  // NestJS 内置：Injectable/错误类型
import { PrismaService } from '../prisma/prisma.service'
import { CreateActivityLogDto } from './dto/create-activity-log.dto'
import { UpdateActivityLogDto } from './dto/update-activity-log.dto'

// 查询时返回的成员子集
const MEMBER_SELECT = {
  id: true,
  name: true,
  nameKana: true,
  imageUrl: true,
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  // ── 获取当前用户所有活动记录 ─────────────────────────────
  async getMyLogs(userId: string) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        members: {
          include: { member: { select: MEMBER_SELECT } },
        },
      },
    })
  }

  // ── 新建活动记录 ─────────────────────────────────────────
  async createLog(userId: string, dto: CreateActivityLogDto) {
    const { memberIds = [], ...rest } = dto

    // 过滤掉不存在的 memberId，防止外键错误
    const validMembers = memberIds.length > 0
      ? await this.prisma.member.findMany({
          where: { id: { in: memberIds } },
          select: { id: true },
        })
      : []

    return this.prisma.activityLog.create({
      data: {
        userId,
        date: new Date(rest.date),
        eventType: rest.eventType,
        venueName: rest.venueName,
        lat: rest.lat,
        lng: rest.lng,
        memo: rest.memo ?? null,
        members: {
          create: validMembers.map(m => ({ memberId: m.id })),
        },
      },
      include: {
        members: {
          include: { member: { select: MEMBER_SELECT } },
        },
      },
    })
  }

  // ── 编辑活动记录 ─────────────────────────────────────────
  async updateLog(userId: string, logId: string, dto: UpdateActivityLogDto) {
    const log = await this.prisma.activityLog.findUnique({ where: { id: logId } })
    if (!log) throw new NotFoundException('活动记录不存在')
    if (log.userId !== userId) throw new ForbiddenException()

    const { memberIds, ...rest } = dto

    // 如果传了 memberIds，则全量替换关联成员
    const membersUpdate = memberIds !== undefined
      ? {
          deleteMany: {},
          create: (memberIds.length > 0
            ? await this.prisma.member
                .findMany({ where: { id: { in: memberIds } }, select: { id: true } })
                .then(ms => ms.map(m => ({ memberId: m.id })))
            : []
          ),
        }
      : undefined

    return this.prisma.activityLog.update({
      where: { id: logId },
      data: {
        ...(rest.date ? { date: new Date(rest.date) } : {}),
        ...(rest.eventType ? { eventType: rest.eventType } : {}),
        ...(rest.venueName ? { venueName: rest.venueName } : {}),
        ...(rest.lat !== undefined ? { lat: rest.lat } : {}),
        ...(rest.lng !== undefined ? { lng: rest.lng } : {}),
        ...(rest.memo !== undefined ? { memo: rest.memo } : {}),
        ...(membersUpdate ? { members: membersUpdate } : {}),
      },
      include: {
        members: {
          include: { member: { select: MEMBER_SELECT } },
        },
      },
    })
  }

  // ── 删除活动记录 ─────────────────────────────────────────
  async deleteLog(userId: string, logId: string) {
    const log = await this.prisma.activityLog.findUnique({ where: { id: logId } })
    if (!log) throw new NotFoundException('活动记录不存在')
    if (log.userId !== userId) throw new ForbiddenException()

    await this.prisma.activityLog.delete({ where: { id: logId } })
    return { ok: true }
  }
}
