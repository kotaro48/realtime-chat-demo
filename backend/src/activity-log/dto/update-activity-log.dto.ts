/**
 * [INPUT]: 依赖 CreateActivityLogDto 的字段定义
 * [OUTPUT]: 对外提供 UpdateActivityLogDto 类（所有字段可选）
 * [POS]: activity-log/dto 的编辑请求体校验，被 ActivityLogController PATCH 端点消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { PartialType } from '@nestjs/mapped-types'  // NestJS: 将 DTO 所有字段变为可选
import { CreateActivityLogDto } from './create-activity-log.dto'

export class UpdateActivityLogDto extends PartialType(CreateActivityLogDto) {}
