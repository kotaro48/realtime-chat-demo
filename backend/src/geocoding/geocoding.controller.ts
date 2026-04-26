/**
 * [INPUT]: 依赖 GeocodingService.search，依赖 AuthGuard('jwt') 的认证
 * [OUTPUT]: 对外暴露 GET /api/geocode/search?q=... 端点
 * [POS]: geocoding 模块的路由层，前端通过此端点搜索场馆坐标
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common'  // NestJS 内置：路由装饰器
import { AuthGuard } from '@nestjs/passport'         // passport: JWT 守卫
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'  // swagger 文档
import { GeocodingService } from './geocoding.service'

@ApiTags('geocoding')
@Controller('api/geocode')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  // 搜索场馆坐标（代理 Nominatim，全局限速+缓存在 service 层处理）
  @Get('search')
  @ApiOperation({ summary: '搜索场馆坐标（Nominatim 代理）' })
  search(@Query('q') q: string) {
    return this.geocodingService.search(q ?? '')
  }
}
