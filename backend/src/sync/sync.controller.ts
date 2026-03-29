import { Controller, Post, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SyncService } from './sync.service';

@Controller('api')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // GET /api/official-events?year=2026&month=3[&cssClass=scheduleHandshake]
  // 返回指定月份的官方活动，cssClass 可选过滤
  @Get('official-events')
  async getOfficialEvents(
    @Query('year',  ParseIntPipe) year:  number,
    @Query('month', ParseIntPipe) month: number,
    @Query('cssClass') cssClass?: string,
  ) {
    return this.syncService.getMonthEvents(year, month, cssClass);
  }

  // GET /api/sync/dev-trigger — 开发用，无需认证，上线前删除
  @Get('sync/dev-trigger')
  async devTrigger() {
    return this.syncService.syncUpcoming();
  }

  // POST /api/sync/trigger — 管理员手动触发同步（当月 + 未来两月）
  @Post('sync/trigger')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async triggerSync() {
    return this.syncService.syncUpcoming();
  }

  // POST /api/sync/month?year=2026&month=3 — 同步指定月份
  @Post('sync/month')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async syncMonth(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const count = await this.syncService.syncMonth(Number(year), Number(month));
    return { count };
  }
}
