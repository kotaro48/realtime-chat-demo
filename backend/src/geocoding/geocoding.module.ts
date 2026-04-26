/**
 * [INPUT]: 依赖 GeocodingController 和 GeocodingService
 * [OUTPUT]: 对外提供 GeocodingModule（注册到 AppModule）
 * [POS]: geocoding 模块的入口，代理 Nominatim 地理编码请求
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Module } from '@nestjs/common'  // NestJS 内置：模块装饰器
import { GeocodingController } from './geocoding.controller'
import { GeocodingService } from './geocoding.service'

@Module({
  controllers: [GeocodingController],
  providers: [GeocodingService],
})
export class GeocodingModule {}
