/**
 * [INPUT]: 依赖 ActivityLogController 和 ActivityLogService
 * [OUTPUT]: 对外提供 ActivityLogModule（注册到 AppModule）
 * [POS]: activity-log 模块的入口，暴露偶像活记录的 CRUD 路由
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Module } from '@nestjs/common'  // NestJS 内置：模块装饰器
import { ActivityLogController } from './activity-log.controller'
import { ActivityLogService } from './activity-log.service'

@Module({
  controllers: [ActivityLogController],
  providers: [ActivityLogService],
})
export class ActivityLogModule {}
