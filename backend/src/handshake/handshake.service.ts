import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'  // NestJS 内置：Injectable/错误类型
import { PrismaService } from '../prisma/prisma.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpsertTicketDto } from './dto/upsert-ticket.dto'

@Injectable()
export class HandshakeService {
  constructor(private readonly prisma: PrismaService) {}

  // ── 成员列表（公开，用于前端选择关注成员）──────────────────
  async findAllMembers() {
    return this.prisma.member.findMany({
      where: { isActive: true },
      orderBy: [{ team: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, nameKana: true, team: true },
    })
  }

  // ── 用户关注的成员（Y 轴行）───────────────────────────────
  async getWatchedMembers(userId: string) {
    const rows = await this.prisma.userMemberWatch.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
      include: {
        member: { select: { id: true, name: true, nameKana: true, team: true } },
      },
    })
    return rows.map(r => r.member)
  }

  async addWatchedMember(userId: string, memberId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } })
    if (!member) throw new NotFoundException('成员不存在')

    // 计算当前最大排序值，新成员追加到末尾
    const maxRow = await this.prisma.userMemberWatch.findFirst({
      where: { userId },
      orderBy: { sortOrder: 'desc' },
    })
    const sortOrder = maxRow ? maxRow.sortOrder + 1 : 0

    await this.prisma.userMemberWatch.upsert({
      where: { userId_memberId: { userId, memberId } },
      update: {},
      create: { userId, memberId, sortOrder },
    })
    return { ok: true }
  }

  async removeWatchedMember(userId: string, memberId: string) {
    await this.prisma.userMemberWatch.deleteMany({ where: { userId, memberId } })
    return { ok: true }
  }

  // ── 握手活动（X 轴列）────────────────────────────────────
  async getEvents(userId: string) {
    return this.prisma.handshakeEvent.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    })
  }

  async createEvent(userId: string, dto: CreateEventDto) {
    return this.prisma.handshakeEvent.create({
      data: {
        userId,
        name: dto.name,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    })
  }

  async updateEvent(userId: string, eventId: string, dto: Partial<CreateEventDto>) {
    const event = await this.prisma.handshakeEvent.findUnique({ where: { id: eventId } })
    if (!event) throw new NotFoundException('活动不存在')
    if (event.userId !== userId) throw new ForbiddenException()

    return this.prisma.handshakeEvent.update({
      where: { id: eventId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.date ? { date: new Date(dto.date) } : {}),
        ...(dto.endDate !== undefined ? { endDate: dto.endDate ? new Date(dto.endDate) : null } : {}),
      },
    })
  }

  async deleteEvent(userId: string, eventId: string) {
    const event = await this.prisma.handshakeEvent.findUnique({ where: { id: eventId } })
    if (!event) throw new NotFoundException('活动不存在')
    if (event.userId !== userId) throw new ForbiddenException()

    await this.prisma.handshakeEvent.delete({ where: { id: eventId } })
    return { ok: true }
  }

  // ── 自动导入官方握手活动（调用前置）────────────────────────
  // 将 OfficialEvent(cssClass=scheduleHandshake) 自动 upsert 到用户的 HandshakeEvent 表
  // 时间窗口：过去 12 个月 ~ 未来 6 个月
  private async autoImportOfficialHandshake(userId: string) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 12, 1)
    const end   = new Date(now.getFullYear(), now.getMonth() + 6,  1)

    const official = await this.prisma.officialEvent.findMany({
      where: {
        cssClass: 'scheduleHandshake',
        date: { gte: start, lt: end },
      },
      select: { id: true, title: true, date: true, endDate: true },
    })

    for (const ev of official) {
      await this.prisma.handshakeEvent.upsert({
        where: { userId_officialEventId: { userId, officialEventId: ev.id } },
        create: {
          userId,
          name:           ev.title,
          date:           ev.date,
          endDate:        ev.endDate,
          officialEventId: ev.id,
        },
        update: {
          name:    ev.title,
          date:    ev.date,
          endDate: ev.endDate,
        },
      })
    }
  }

  // ── 完整表格数据 ──────────────────────────────────────────
  // 返回结构：events 列表 + members 列表（含行合计） + tickets 映射
  // tickets key: "${eventId}_${memberId}"
  async getGrid(userId: string) {
    await this.autoImportOfficialHandshake(userId)

    const [events, watchedRows, tickets] = await Promise.all([
      this.prisma.handshakeEvent.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      }),
      this.prisma.userMemberWatch.findMany({
        where: { userId },
        orderBy: { sortOrder: 'asc' },
        include: { member: { select: { id: true, name: true, team: true } } },
      }),
      this.prisma.handshakeTicket.findMany({
        where: { userId },
        select: { eventId: true, memberId: true, count: true, note: true },
      }),
    ])

    const members = watchedRows.map(r => r.member)

    // 构建 ticket 映射：key = "eventId_memberId"
    const ticketMap: Record<string, { count: number; note: string | null }> = {}
    for (const t of tickets) {
      ticketMap[`${t.eventId}_${t.memberId}`] = { count: t.count, note: t.note }
    }

    // 每个 event 的列合计（该场用了多少枚）
    const eventTotals: Record<string, number> = {}
    for (const event of events) {
      eventTotals[event.id] = tickets
        .filter(t => t.eventId === event.id)
        .reduce((s, t) => s + t.count, 0)
    }

    // 每个成员的行合计（该成员总共多少枚）
    const memberTotals: Record<string, number> = {}
    for (const m of members) {
      memberTotals[m.id] = tickets
        .filter(t => t.memberId === m.id)
        .reduce((s, t) => s + t.count, 0)
    }

    return {
      events: events.map(e => ({ ...e, totalCount: eventTotals[e.id] ?? 0 })),
      members: members.map(m => ({ ...m, totalCount: memberTotals[m.id] ?? 0 })),
      tickets: ticketMap,
    }
  }

  // ── 单元格写入（upsert）──────────────────────────────────
  async upsertTicket(userId: string, dto: UpsertTicketDto) {
    // 验证 event 归属当前用户
    const event = await this.prisma.handshakeEvent.findUnique({ where: { id: dto.eventId } })
    if (!event || event.userId !== userId) throw new ForbiddenException()

    if (dto.count === 0 && !dto.note) {
      // 枚数为 0 且无备注时删除记录（保持表格整洁）
      await this.prisma.handshakeTicket.deleteMany({
        where: { userId, eventId: dto.eventId, memberId: dto.memberId },
      })
      return { ok: true, deleted: true }
    }

    const ticket = await this.prisma.handshakeTicket.upsert({
      where: {
        userId_eventId_memberId: { userId, eventId: dto.eventId, memberId: dto.memberId },
      },
      update: { count: dto.count, note: dto.note ?? null },
      create: {
        userId,
        eventId: dto.eventId,
        memberId: dto.memberId,
        count: dto.count,
        note: dto.note ?? null,
      },
    })
    return ticket
  }
}
