/**
 * [INPUT]: 依赖 ActivityLogService 的业务方法，依赖 AuthGuard('jwt') 的认证
 * [OUTPUT]: 对外暴露 /api/activity-logs CRUD 端点
 * [POS]: activity-log 模块的路由层，处理请求权限与参数传递
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'  // NestJS 内置：路由装饰器
import { AuthGuard } from '@nestjs/passport'         // passport: JWT 守卫
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'  // swagger 文档
import { ActivityLogService } from './activity-log.service'
import { CreateActivityLogDto } from './dto/create-activity-log.dto'
import { UpdateActivityLogDto } from './dto/update-activity-log.dto'

@ApiTags('activity-log')
@Controller('api/activity-logs')
@UseGuards(AuthGuard('jwt'))   // 所有端点均需登录
@ApiBearerAuth()
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  // 获取当前用户所有活动记录（地图 markers 数据源）
  @Get()
  @ApiOperation({ summary: '获取当前用户的偶像活记录列表' })
  getMyLogs(@Req() req: any) {
    return this.activityLogService.getMyLogs(req.user.id)
  }

  // 新建活动记录
  @Post()
  @ApiOperation({ summary: '新建偶像活记录' })
  createLog(@Req() req: any, @Body() dto: CreateActivityLogDto) {
    return this.activityLogService.createLog(req.user.id, dto)
  }

  // 编辑活动记录（校验 ownership 在 service 层完成）
  @Patch(':id')
  @ApiOperation({ summary: '编辑偶像活记录' })
  updateLog(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateActivityLogDto,
  ) {
    return this.activityLogService.updateLog(req.user.id, id, dto)
  }

  // 删除活动记录
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除偶像活记录' })
  deleteLog(@Req() req: any, @Param('id') id: string) {
    return this.activityLogService.deleteLog(req.user.id, id)
  }
}
