import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common'  // NestJS 内置：路由装饰器
import { AuthGuard } from '@nestjs/passport'  // passport: JWT 守卫
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'  // swagger 文档
import { HandshakeService } from './handshake.service'
import { CreateEventDto } from './dto/create-event.dto'
import { UpsertTicketDto } from './dto/upsert-ticket.dto'

@ApiTags('handshake')
@Controller('api')
export class HandshakeController {
  constructor(private readonly handshakeService: HandshakeService) {}

  // ── 公开接口：成员列表 ──────────────────────────────────
  @Get('members')
  @ApiOperation({ summary: '获取全部 AKB48 成员列表' })
  findAllMembers() {
    return this.handshakeService.findAllMembers()
  }

  // ── 以下接口均需登录 ─────────────────────────────────────

  // 关注成员（Y 轴行）
  @Get('handshake/watched')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户关注的成员列表' })
  getWatched(@Req() req: any) {
    return this.handshakeService.getWatchedMembers(req.user.id)
  }

  @Post('handshake/watched')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加关注成员' })
  addWatched(@Req() req: any, @Body() body: { memberId: string }) {
    return this.handshakeService.addWatchedMember(req.user.id, body.memberId)
  }

  @Delete('handshake/watched/:memberId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消关注成员' })
  removeWatched(@Req() req: any, @Param('memberId') memberId: string) {
    return this.handshakeService.removeWatchedMember(req.user.id, memberId)
  }

  // 活动（X 轴列）
  @Get('handshake/events')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户创建的握手活动列表' })
  getEvents(@Req() req: any) {
    return this.handshakeService.getEvents(req.user.id)
  }

  @Post('handshake/events')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '新建握手活动' })
  createEvent(@Req() req: any, @Body() dto: CreateEventDto) {
    return this.handshakeService.createEvent(req.user.id, dto)
  }

  @Patch('handshake/events/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改握手活动名称/日期' })
  updateEvent(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateEventDto>) {
    return this.handshakeService.updateEvent(req.user.id, id, dto)
  }

  @Delete('handshake/events/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除握手活动（级联删除枚数记录）' })
  deleteEvent(@Req() req: any, @Param('id') id: string) {
    return this.handshakeService.deleteEvent(req.user.id, id)
  }

  // 完整表格数据
  @Get('handshake/grid')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取完整握手记录表格（events × members × tickets）' })
  getGrid(@Req() req: any) {
    return this.handshakeService.getGrid(req.user.id)
  }

  // 单元格写入
  @Put('handshake/tickets')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新单元格（枚数 + 备注）' })
  upsertTicket(@Req() req: any, @Body() dto: UpsertTicketDto) {
    return this.handshakeService.upsertTicket(req.user.id, dto)
  }
}
