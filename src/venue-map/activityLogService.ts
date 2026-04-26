/**
 * [INPUT]: 依赖 src/services/api 的 request 封装，依赖 src/types 的 ActivityLog 类型
 * [OUTPUT]: 对外提供 activityLogService（getMyLogs/createLog/updateLog/deleteLog/searchVenue）
 * [POS]: venue-map 模块的数据层，所有后端通信通过此服务
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { api } from '../services/api'  // api: 统一 HTTP 封装（自动附加 JWT）
import type { ActivityLog, CreateActivityLogPayload, GeocodingResult } from '../types'

export const activityLogService = {
  // 获取当前用户所有活动记录
  getMyLogs: () =>
    api.get<ActivityLog[]>('/api/activity-logs'),

  // 新建活动记录
  createLog: (data: CreateActivityLogPayload) =>
    api.post<ActivityLog>('/api/activity-logs', data),

  // 编辑活动记录
  updateLog: (id: string, data: Partial<CreateActivityLogPayload>) =>
    api.patch<ActivityLog>(`/api/activity-logs/${id}`, data),

  // 删除活动记录
  deleteLog: (id: string) =>
    api.delete<void>(`/api/activity-logs/${id}`),

  // 搜索场馆坐标（通过后端代理 Nominatim）
  searchVenue: (q: string) =>
    api.get<GeocodingResult[]>(`/api/geocode/search?q=${encodeURIComponent(q)}`),
}
