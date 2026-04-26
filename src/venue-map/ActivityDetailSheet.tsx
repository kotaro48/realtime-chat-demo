/**
 * [INPUT]: 依赖 framer-motion 的动画，依赖 ActivityLog 类型，依赖 activityLogService 的删除
 * [OUTPUT]: 对外提供 ActivityDetailSheet 组件（底部弹出详情面板）
 * [POS]: venue-map 模块的详情展示层，复用 PhotoCardLightbox 的 glass morphism 模式
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { createPortal } from 'react-dom'                  // createPortal: 把弹窗挂到 body，逃离父级 stacking context
import { motion, AnimatePresence } from 'framer-motion'  // framer-motion: 弹出动画
import { X, Trash2, MapPin, Calendar, Tag, FileText } from 'lucide-react'  // lucide-react: 图标
import type { ActivityLog } from '../types'
import { activityLogService } from './activityLogService'

const EVENT_TYPE_LABELS: Record<string, string> = {
  HANDSHAKE:  '握手会',
  CONCERT:    'コンサート',
  THEATER:    '劇場公演',
  PILGRIMAGE: '聖地巡礼',
  OTHER:      'その他',
}

// 与 ActivityMarker 使用相同算法，保证颜色一致
function stringToHue(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 360
}

function getMemberColor(memberId: string): string {
  return `hsl(${stringToHue(memberId)}, 72%, 52%)`
}

interface ActivityDetailSheetProps {
  log: ActivityLog | null
  onClose: () => void
  onDeleted: (id: string) => void
}

export function ActivityDetailSheet({ log, onClose, onDeleted }: ActivityDetailSheetProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!log) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await activityLogService.deleteLog(log.id)
      onDeleted(log.id)
      onClose()
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const dateStr = log
    ? new Date(log.date).toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  return createPortal(
    <AnimatePresence>
      {log && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 z-[900] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 底部弹出面板 —— glass morphism 风格 */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[901] max-w-2xl mx-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose() }}
          >
            <div className="bg-bg border border-ds-border rounded-t-3xl px-5 pt-3 pb-8 shadow-2xl">
              {/* 拖拽把手 */}
              <div className="w-10 h-1 bg-ds-border rounded-full mx-auto mb-4" />

              {/* 标题行 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-jp text-[17px] font-semibold text-ds-text truncate">
                    {log.venueName}
                  </h2>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-ui bg-ds-accent/15 text-ds-accent">
                    {EVENT_TYPE_LABELS[log.eventType] ?? log.eventType}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="ml-3 p-1.5 rounded-full text-ds-text-3 hover:bg-ds-border transition-colors"
                  aria-label="閉じる"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 详情列表 */}
              <div className="space-y-3">
                {/* 日期 */}
                <div className="flex items-center gap-2.5 text-[13px] text-ds-text-2">
                  <Calendar size={14} className="text-ds-text-3 shrink-0" />
                  <span className="font-ui">{dateStr}</span>
                </div>

                {/* 坐标 */}
                <div className="flex items-center gap-2.5 text-[13px] text-ds-text-3">
                  <MapPin size={14} className="shrink-0" />
                  <span className="font-ui tabular-nums">
                    {log.lat.toFixed(4)}, {log.lng.toFixed(4)}
                  </span>
                </div>

                {/* 成员 chips：头像 + 名字 */}
                {log.members.length > 0 && (
                  <div className="flex items-start gap-2.5">
                    <Tag size={14} className="text-ds-text-3 shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {log.members.map(lm => (
                        <span
                          key={lm.memberId}
                          className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full text-[11px] font-jp text-white"
                          style={{ background: getMemberColor(lm.memberId) }}
                        >
                          {/* 圆形头像，AKB 半身照锚点上移露脸 */}
                          <span className="w-5 h-5 rounded-full overflow-hidden bg-white/20 shrink-0 flex items-center justify-center">
                            {lm.member.imageUrl ? (
                              <img
                                src={lm.member.imageUrl}
                                alt={lm.member.name}
                                className="w-full h-full object-cover"
                                style={{ objectPosition: 'center 18%' }}
                                referrerPolicy="no-referrer"
                                draggable={false}
                              />
                            ) : (
                              <span className="text-[8px] font-ui">
                                {lm.member.name.charAt(0)}
                              </span>
                            )}
                          </span>
                          {lm.member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 备注 */}
                {log.memo && (
                  <div className="flex items-start gap-2.5 text-[13px] text-ds-text-2">
                    <FileText size={14} className="text-ds-text-3 shrink-0 mt-0.5" />
                    <p className="font-jp leading-relaxed">{log.memo}</p>
                  </div>
                )}
              </div>

              {/* 删除按钮 */}
              <div className="mt-5 pt-4 border-t border-ds-border">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`flex items-center gap-1.5 text-[13px] font-ui transition-colors ${
                    confirmDelete
                      ? 'text-red-500 font-semibold'
                      : 'text-ds-text-3 hover:text-red-400'
                  }`}
                >
                  <Trash2 size={14} />
                  {deleting ? '削除中...' : confirmDelete ? '本当に削除する' : 'この記録を削除'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
