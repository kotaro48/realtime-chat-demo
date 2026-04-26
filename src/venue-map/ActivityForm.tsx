/**
 * [INPUT]: 依赖 framer-motion 的弹出动画，依赖 activityLogService 的创建/搜索，依赖 api 的成员列表
 * [OUTPUT]: 对外提供 ActivityForm 组件（新建活动记录的底部弹出表单）
 * [POS]: venue-map 模块的表单层，包含 VenueSearch 子逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'                  // createPortal: 把弹窗挂到 body，逃离父级 stacking context
import { motion, AnimatePresence } from 'framer-motion'  // framer-motion: 弹出动画
import { X, Search, MapPin, Loader2, Check } from 'lucide-react'  // lucide-react: 图标
import { api } from '../services/api'              // api: 获取成员列表
import { activityLogService } from './activityLogService'
import type { ActivityEventType, GeocodingResult, ActivityLog } from '../types'

const EVENT_TYPES: { value: ActivityEventType; label: string }[] = [
  { value: 'HANDSHAKE',  label: '握手会' },
  { value: 'CONCERT',    label: 'コンサート' },
  { value: 'THEATER',    label: '劇場公演' },
  { value: 'PILGRIMAGE', label: '聖地巡礼' },
  { value: 'OTHER',      label: 'その他' },
]

interface AllMember {
  id: string
  name: string
  nameKana: string | null
  team: string | null
  imageUrl: string | null
}

interface ActivityFormProps {
  open: boolean
  onClose: () => void
  onCreated: (log: ActivityLog) => void
}

export function ActivityForm({ open, onClose, onCreated }: ActivityFormProps) {
  // 表单字段
  const [eventType, setEventType] = useState<ActivityEventType>('HANDSHAKE')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [memo, setMemo] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

  // 场馆搜索状态
  const [venueQuery, setVenueQuery] = useState('')
  const [venueResults, setVenueResults] = useState<GeocodingResult[]>([])
  const [selectedVenue, setSelectedVenue] = useState<GeocodingResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const composingRef = useRef(false)  // 日文 IME 输入状态
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 成员列表
  const [allMembers, setAllMembers] = useState<AllMember[]>([])
  const [submitting, setSubmitting] = useState(false)

  // 打开时加载成员列表
  useEffect(() => {
    if (!open) return
    api.get<AllMember[]>('/api/members').then(setAllMembers).catch(() => {})
  }, [open])

  // 关闭时重置表单
  useEffect(() => {
    if (!open) {
      setEventType('HANDSHAKE')
      setDate(new Date().toISOString().slice(0, 10))
      setMemo('')
      setSelectedMemberIds([])
      setVenueQuery('')
      setVenueResults([])
      setSelectedVenue(null)
      setSearchError('')
    }
  }, [open])

  // 场馆搜索：防抖 300ms，IME 输入结束后触发
  const triggerSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q || q.length < 2) {
      setVenueResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      setSearchError('')
      try {
        const results = await activityLogService.searchVenue(q)
        setVenueResults(results)
        if (results.length === 0) setSearchError('見つかりませんでした')
      } catch {
        setSearchError('検索に失敗しました')
        setVenueResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
  }, [])

  function handleVenueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setVenueQuery(val)
    setSelectedVenue(null)   // 重新输入时清除已选场馆
    if (!composingRef.current) triggerSearch(val)
  }

  function handleVenueSelect(result: GeocodingResult) {
    setSelectedVenue(result)
    // 只取 display_name 的第一段作为场馆名
    setVenueQuery(result.displayName.split(',')[0].trim())
    setVenueResults([])
  }

  function toggleMember(id: string) {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedVenue || submitting) return

    setSubmitting(true)
    try {
      const log = await activityLogService.createLog({
        date,
        eventType,
        venueName: venueQuery,
        lat: selectedVenue.lat,
        lng: selectedVenue.lng,
        memo: memo.trim() || undefined,
        memberIds: selectedMemberIds,
      })
      onCreated(log)
      onClose()
    } catch {
      setSubmitting(false)
    }
  }

  const canSubmit = !!selectedVenue && !submitting

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[910] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-0 bottom-0 z-[911] max-w-2xl mx-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="bg-bg border border-ds-border rounded-t-3xl px-5 pt-3 pb-8 shadow-2xl max-h-[85dvh] overflow-y-auto">
              {/* 拖拽把手 */}
              <div className="w-10 h-1 bg-ds-border rounded-full mx-auto mb-4" />

              {/* 标题行 */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-jp text-[16px] font-semibold text-ds-text">
                  現場を記録する
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-ds-text-3 hover:bg-ds-border transition-colors"
                  aria-label="閉じる"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 活动类型 */}
                <div>
                  <label className="block font-ui text-[11px] text-ds-text-3 mb-1.5">
                    イベント種類
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setEventType(t.value)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-ui transition-colors ${
                          eventType === t.value
                            ? 'bg-ds-accent text-white'
                            : 'bg-ds-border text-ds-text-2 hover:bg-ds-border/70'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 日期 */}
                <div>
                  <label className="block font-ui text-[11px] text-ds-text-3 mb-1.5">
                    日付
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-ds-border/30 border border-ds-border rounded-lg px-3 py-2 text-[13px] font-ui text-ds-text focus:outline-none focus:border-ds-accent"
                  />
                </div>

                {/* 场馆搜索 */}
                <div>
                  <label className="block font-ui text-[11px] text-ds-text-3 mb-1.5">
                    会場 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="flex items-center gap-2 bg-ds-border/30 border border-ds-border rounded-lg px-3 py-2">
                      {selectedVenue ? (
                        <Check size={14} className="text-green-400 shrink-0" />
                      ) : (
                        <Search size={14} className="text-ds-text-3 shrink-0" />
                      )}
                      <input
                        value={venueQuery}
                        onChange={handleVenueChange}
                        onCompositionStart={() => { composingRef.current = true }}
                        onCompositionEnd={e => {
                          composingRef.current = false
                          triggerSearch((e.target as HTMLInputElement).value)
                        }}
                        placeholder="幕張メッセ、東京ドーム..."
                        className="flex-1 bg-transparent text-[13px] font-jp text-ds-text placeholder:text-ds-text-4 focus:outline-none"
                      />
                      {searchLoading && <Loader2 size={14} className="text-ds-text-3 animate-spin shrink-0" />}
                    </div>

                    {/* 搜索结果下拉 */}
                    {venueResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-bg border border-ds-border rounded-lg shadow-xl z-10 overflow-hidden">
                        {venueResults.map((r, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleVenueSelect(r)}
                            className="w-full text-left px-3 py-2.5 text-[12px] font-jp text-ds-text hover:bg-ds-border/50 transition-colors border-b border-ds-border/50 last:border-0 flex items-start gap-2"
                          >
                            <MapPin size={12} className="text-ds-accent shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{r.displayName}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 无结果 / 错误提示 */}
                    {searchError && !searchLoading && venueResults.length === 0 && venueQuery.length >= 2 && (
                      <p className="mt-1 text-[11px] font-ui text-ds-text-3">{searchError}</p>
                    )}
                  </div>
                </div>

                {/* 成员（可多选） */}
                {allMembers.length > 0 && (
                  <div>
                    <label className="block font-ui text-[11px] text-ds-text-3 mb-1.5">
                      会ったメンバー（任意）
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {allMembers.map(m => {
                        const selected = selectedMemberIds.includes(m.id)
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleMember(m.id)}
                            className={`flex items-center gap-1.5 pl-0.5 pr-2.5 py-0.5 rounded-full text-[11px] font-jp transition-colors ${
                              selected
                                ? 'bg-ds-accent text-white'
                                : 'bg-ds-border/50 text-ds-text-2 hover:bg-ds-border'
                            }`}
                          >
                            {/* 圆形头像，object-position 上移露脸 */}
                            <span className="w-5 h-5 rounded-full overflow-hidden bg-ds-border shrink-0 flex items-center justify-center">
                              {m.imageUrl ? (
                                <img
                                  src={m.imageUrl}
                                  alt={m.name}
                                  className="w-full h-full object-cover"
                                  style={{ objectPosition: 'center 18%' }}
                                  referrerPolicy="no-referrer"
                                  draggable={false}
                                />
                              ) : (
                                <span className="text-[8px] font-ui text-ds-text-3">
                                  {m.name.charAt(0)}
                                </span>
                              )}
                            </span>
                            {m.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 备注 */}
                <div>
                  <label className="block font-ui text-[11px] text-ds-text-3 mb-1.5">
                    メモ（任意）
                  </label>
                  <textarea
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    rows={2}
                    placeholder="今日の感想、セトリ、天気など..."
                    className="w-full bg-ds-border/30 border border-ds-border rounded-lg px-3 py-2 text-[13px] font-jp text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-accent resize-none"
                  />
                </div>

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full py-3 rounded-xl text-[14px] font-ui font-semibold transition-all ${
                    canSubmit
                      ? 'bg-ds-accent text-white hover:opacity-90'
                      : 'bg-ds-border text-ds-text-3 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={15} className="animate-spin" />
                      保存中...
                    </span>
                  ) : (
                    '記録する'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
