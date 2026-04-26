/**
 * [INPUT]: 依赖 @vis.gl/react-google-maps 的地图组件，依赖 activityLogService，依赖 useAuth
 * [OUTPUT]: 对外提供 ActivityMapPage（偶像活地図主页面）
 * [POS]: venue-map 模块的根组件，由 App.tsx /venue 路由挂载
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useState, useRef } from 'react'
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps'  // @vis.gl/react-google-maps: Google Maps 官方 React 封装
import { motion } from 'framer-motion'  // framer-motion: 页面入场动画
import { Plus, MapPin } from 'lucide-react'  // lucide-react: 图标
import { useAuth } from '../context/AuthContext'  // AuthContext: 登录状态
import { activityLogService } from './activityLogService'
import { ActivityMarker } from './ActivityMarker'
import { ActivityDetailSheet } from './ActivityDetailSheet'
import { ActivityForm } from './ActivityForm'
import type { ActivityLog, ActivityEventType } from '../types'

// 初始视角：日本全图（东京为中心，zoom 6 可见全国）
const JAPAN_CENTER = { lat: 35.6762, lng: 139.6503 }
const JAPAN_ZOOM = 6

// 活动类型过滤选项
const FILTER_TYPES: { value: ActivityEventType | 'ALL'; label: string }[] = [
  { value: 'ALL',        label: '全て' },
  { value: 'HANDSHAKE',  label: '握手会' },
  { value: 'CONCERT',    label: 'コンサート' },
  { value: 'THEATER',    label: '劇場公演' },
  { value: 'PILGRIMAGE', label: '聖地巡礼' },
  { value: 'OTHER',      label: 'その他' },
]

// 有活动记录时，自动调整地图视野以显示所有 markers
function AutoFitBounds({ logs }: { logs: ActivityLog[] }) {
  const map = useMap()
  const fittedRef = useRef(false)

  useEffect(() => {
    if (!map || logs.length === 0 || fittedRef.current) return
    if (logs.length === 1) {
      map.setCenter({ lat: logs[0].lat, lng: logs[0].lng })
      map.setZoom(12)
    } else {
      const bounds = new google.maps.LatLngBounds()
      logs.forEach(l => bounds.extend({ lat: l.lat, lng: l.lng }))
      map.fitBounds(bounds, 40)
    }
    fittedRef.current = true
  }, [logs, map])

  return null
}

export function ActivityMapPage() {
  const { isLoggedIn, user } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [filter, setFilter] = useState<ActivityEventType | 'ALL'>('ALL')

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return }
    activityLogService.getMyLogs()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  function handleCreated(log: ActivityLog) {
    setLogs(prev => [log, ...prev])
  }

  function handleDeleted(id: string) {
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter(l => l.eventType === filter)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

  return (
    <motion.div
      className="relative h-dvh flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* APIProvider: 注入 Google Maps JS API key，包裹所有地图子组件 */}
      <APIProvider apiKey={apiKey}>
        {/* 地図本体 — 撑满全屏 */}
        <div className="flex-1 relative" aria-label="活動記録地図">
          <Map
            defaultCenter={JAPAN_CENTER}
            defaultZoom={JAPAN_ZOOM}
            mapId="3fdaa21d3577e5f21ad81156"  // mapId 为 AdvancedMarker 必需，在 Google Cloud Console Map Management 创建
            className="w-full h-full"
            disableDefaultUI={false}
            gestureHandling="greedy"  // greedy: 单指即可拖动地图，移动端体验更好
          >
            {/* 有记录时自动 fit bounds */}
            {!loading && logs.length > 0 && <AutoFitBounds logs={logs} />}

            {/* 活动 markers */}
            {filteredLogs.map(log => (
              <ActivityMarker
                key={log.id}
                log={log}
                onClick={setSelectedLog}
                userAvatarUrl={user?.avatarUrl}
                userAvatarColor={user?.avatarColor ?? '#94a3b8'}
                userNickname={user?.nickname ?? ''}
              />
            ))}
          </Map>

          {/* 过滤 pills — 悬浮在地图顶部 */}
          <div className="absolute top-3 left-0 right-0 z-10 px-3">
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {FILTER_TYPES.map(ft => (
                <button
                  key={ft.value}
                  onClick={() => setFilter(ft.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-ui backdrop-blur-sm transition-colors ${
                    filter === ft.value
                      ? 'bg-ds-accent text-white shadow-sm'
                      : 'bg-bg/80 text-ds-text-2 border border-ds-border/60 hover:bg-bg'
                  }`}
                >
                  {ft.label}
                </button>
              ))}
            </div>
          </div>

          {/* 加载中指示 */}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-bg/80 backdrop-blur-sm rounded-xl px-4 py-2.5 text-[13px] font-ui text-ds-text-3">
                読み込み中...
              </div>
            </div>
          )}

          {/* 空状态 — 零记录时显示引导 */}
          {!loading && logs.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-bg/90 backdrop-blur-sm rounded-2xl px-6 py-5 text-center shadow-lg max-w-[260px]">
                <MapPin className="mx-auto mb-2 text-ds-accent" size={28} />
                <p className="font-jp text-[15px] font-semibold text-ds-text mb-1">
                  まだ記録がありません
                </p>
                <p className="font-jp text-[12px] text-ds-text-3">
                  + ボタンで最初の現場を記録しよう
                </p>
              </div>
            </div>
          )}

          {/* FAB — 新建记录按钮（在 BottomTabBar 上方）*/}
          <button
            onClick={() => setFormOpen(true)}
            aria-label="活動を記録する"
            className="absolute bottom-[72px] right-4 z-10 w-14 h-14 rounded-full bg-ds-accent text-white shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center md:bottom-6"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>
      </APIProvider>

      {/* 详情弹出（createPortal 到 body，在 APIProvider 外侧，不受地图 stacking context 影响）*/}
      <ActivityDetailSheet
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onDeleted={handleDeleted}
      />

      {/* 新建表单（同上，portal 到 body）*/}
      <ActivityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={handleCreated}
      />
    </motion.div>
  )
}
