/**
 * [INPUT]: 依赖 class-validator 的校验装饰器，依赖 Prisma 的 ActivityEventType enum
 * [OUTPUT]: 对外提供 CreateActivityLogDto 类
 * [POS]: activity-log/dto 的请求体校验，被 ActivityLogController 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  Min,
  Max,
} from 'class-validator'  // class-validator: 请求体字段校验

import { ActivityEventType } from '@prisma/client'  // Prisma: ActivityEventType enum

export class CreateActivityLogDto {
  @IsDateString()
  date: string                         // 活动日期（ISO 字符串）

  @IsEnum(ActivityEventType)
  eventType: ActivityEventType         // 活动类型

  @IsString()
  @IsNotEmpty()
  venueName: string                    // 场馆名称

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number                          // 纬度

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number                          // 经度

  @IsOptional()
  @IsString()
  memo?: string                        // 备注（可选）

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberIds?: string[]                 // 关联成员 ID 列表（可选）
}
