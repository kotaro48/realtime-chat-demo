import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { api } from '../services/api'              // api: 统一 HTTP 封装
import type { OfficialEvent } from '../types'       // types: 共享类型

// ── cssClass → 显示配置 ───────────────────────────────────
const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  scheduleHandshake: { label: '握手',  color: 'text-[#8C1F1F]', bg: 'bg-[#F5ECEC]' },
  scheduleLive:      { label: 'Live',  color: 'text-[#1A5C8C]', bg: 'bg-[#EBF3FA]' },
  scheduleRelease:   { label: '発売',  color: 'text-[#2E6B35]', bg: 'bg-[#EBF5EC]' },
  scheduleEvent:     { label: 'Event', color: 'text-[#6B4A1A]', bg: 'bg-[#F5F0E8]' },
  scheduleTheater:   { label: '劇場',  color: 'text-[#4A2E6B]', bg: 'bg-[#F0EBF5]' },
}
const DEFAULT_TYPE = { label: 'その他', color: 'text-ds-text-3', bg: 'bg-bg-3' }

function getTypeConfig(ev: Pick<OfficialEvent, 'cssClass' | 'category' | 'parentCategory'>) {
  // 劇場判定（category/parentCategory ベース）を cssClass より優先
  if (ev.category === '999' || ev.category === '1032' || ev.parentCategory === '1') {
    return EVENT_TYPE_CONFIG['scheduleTheater']
  }
  return (ev.cssClass && EVENT_TYPE_CONFIG[ev.cssClass]) ? EVENT_TYPE_CONFIG[ev.cssClass] : DEFAULT_TYPE
}

// ── フィルター定義 ────────────────────────────────────────
const FILTER_TYPES = [
  { value: 'all',               label: '全部' },
  { value: 'scheduleHandshake', label: '握手会' },
  { value: 'scheduleTheater',   label: '劇場' },
  { value: 'scheduleLive',      label: 'Live' },
  { value: 'scheduleRelease',   label: '発売' },
  { value: 'scheduleEvent',     label: 'Event' },
]

// 各フィルター値 → マッチング関数
// cssClass ベースのフィルターはそのまま比較、
// scheduleTheater は category/parentCategory の複合条件
const FILTER_PREDICATES: Record<string, (e: OfficialEvent) => boolean> = {
  all:               () => true,
  scheduleHandshake: e => e.cssClass === 'scheduleHandshake',
  scheduleTheater:   e => e.category === '999' || e.category === '1032' || e.parentCategory === '1',
  scheduleLive:      e => e.cssClass === 'scheduleLive',
  scheduleRelease:   e => e.cssClass === 'scheduleRelease',
  scheduleEvent:     e => e.cssClass === 'scheduleEvent',
}

// 格子最多显示几条活动，超出部分用 "+N" 表示
const MAX_CELL = 2

// ── ユーティリティ ───────────────────────────────────────
function getFirstDow(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay()
}
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}
function toJstDateKey(iso: string) {
  return new Date(iso).toLocaleDateString('sv', { timeZone: 'Asia/Tokyo' })
}
function toTimeStr(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })
}

// ── 当日活动详情 Modal ────────────────────────────────────
function DayModal({ dateKey, events, onClose }: {
  dateKey: string
  events: OfficialEvent[]
  onClose: () => void
}) {
  const d = new Date(dateKey + 'T00:00:00')
  const weekLabel = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  const title = `${d.getMonth() + 1}月${d.getDate()}日（${weekLabel}）`

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full sm:w-[420px] max-h-[70vh] bg-bg border border-ds-border rounded-t-lg sm:rounded-md shadow-lg flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ds-border-2 shrink-0">
          <h2 className="font-ui text-[15px] font-semibold text-ds-text">{title}</h2>
          <button onClick={onClose} className="text-ds-text-3 hover:text-ds-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-2">
          {events.filter((ev, idx, arr) => arr.findIndex(e => e.title === ev.title) === idx).map(ev => {
            const conf    = getTypeConfig(ev)
            const timeStr = toTimeStr(ev.date)
            return (
              <div key={ev.id} className="border border-ds-border-2 rounded-sm p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`font-ui text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${conf.bg} ${conf.color}`}>
                    {conf.label}
                  </span>
                  {timeStr && (
                    <span className="font-mono text-[11px] text-ds-text-4">{timeStr}</span>
                  )}
                </div>
                <p className="font-ui text-[13.5px] font-medium text-ds-text leading-snug">
                  {ev.title}
                </p>
                {ev.endDate && (
                  <p className="font-mono text-[11px] text-ds-text-4 mt-1">
                    〜 {toTimeStr(ev.endDate)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── メインコンポーネント ──────────────────────────────────
export function OfficialCalendar() {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [filter,     setFilter]     = useState('all')
  const [events,     setEvents]     = useState<OfficialEvent[]>([])
  const [loading,    setLoading]    = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get<OfficialEvent[]>(`/api/official-events?year=${year}&month=${month}`)
      .then(data => { setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [year, month])

  // フィルター後のイベント（格子表示用）
  const predicate = FILTER_PREDICATES[filter] ?? (() => true)
  const filtered  = events.filter(predicate)

  // 日付 key でグループ化（格子表示用、フィルター適用）
  const byDate = filtered.reduce<Record<string, OfficialEvent[]>>((acc, ev) => {
    const k = toJstDateKey(ev.date)
    ;(acc[k] ??= []).push(ev)
    return acc
  }, {})

  // Modal 用（フィルターなし全件）
  const allByDate = events.reduce<Record<string, OfficialEvent[]>>((acc, ev) => {
    const k = toJstDateKey(ev.date)
    ;(acc[k] ??= []).push(ev)
    return acc
  }, {})

  const firstDow  = getFirstDow(year, month)
  const daysCount = getDaysInMonth(year, month)
  const numWeeks  = Math.ceil((firstDow + daysCount) / 7)  // 该月占几行（4〜6）
  const todayKey  = now.toLocaleDateString('sv', { timeZone: 'Asia/Tokyo' })
  const weekDays  = ['日', '月', '火', '水', '木', '金', '土']

  function prevMonth() {
    month === 1 ? (setYear(y => y - 1), setMonth(12)) : setMonth(m => m - 1)
  }
  function nextMonth() {
    month === 12 ? (setYear(y => y + 1), setMonth(1)) : setMonth(m => m + 1)
  }
  function dateKey(day: number) {
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  }

  return (
    // 整体：flex 列，撑满父容器高度
    <div className="flex flex-col h-full overflow-hidden">

      {/* フィルターバー */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-ds-border-2 overflow-x-auto shrink-0">
        {FILTER_TYPES.map(ft => (
          <button
            key={ft.value}
            onClick={() => setFilter(ft.value)}
            className={`font-ui text-[12px] font-medium px-3 h-7 rounded-full whitespace-nowrap transition-colors ${
              filter === ft.value
                ? 'bg-ds-accent text-white'
                : 'bg-bg-2 text-ds-text-3 hover:bg-bg-3'
            }`}
          >
            {ft.label}
          </button>
        ))}
      </div>

      {/* 月份ナビ */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-ui text-[14px] font-semibold text-ds-text">
          {year}年{month}月
        </span>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* カレンダー本体 — flex-1 で残り高さをすべて使う */}
      <div className="flex-1 flex flex-col min-h-0 px-3 pb-3 relative">

        {/* ローディング遮罩 — グリッドを保持したまま上に重ねる（レイアウトシフト防止） */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/70 rounded-md">
            <svg className="w-6 h-6 animate-spin text-ds-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}

        {!loading && events.length === 0 && (
          <p className="text-[13px] text-ds-text-4 py-6 text-center">この月のデータがありません</p>
        )}

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 shrink-0 mb-px">
          {weekDays.map((d, i) => (
            <div key={d} className={`text-center font-mono text-[11px] py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-ds-text-4'
            }`}>{d}</div>
          ))}
        </div>

        {/* 日付グリッド
            grid-cols-7 × numWeeks 行
            grid-rows を 1fr で均等分割 → セルが残り高さを等分 */}
        <div
          className="flex-1 min-h-0 grid grid-cols-7 gap-px bg-ds-border-2 border border-ds-border-2 rounded-md overflow-hidden"
          style={{ gridTemplateRows: `repeat(${numWeeks}, 1fr)` }}
        >
          {/* 月初め前の空白 */}
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`e${i}`} className="bg-bg-2" />
          ))}

          {/* 各日付セル */}
          {Array.from({ length: daysCount }).map((_, i) => {
            const day       = i + 1
            const key       = dateKey(day)
            const dayEvs    = byDate[key] ?? []
            const shown     = dayEvs.slice(0, MAX_CELL)
            const overflow  = dayEvs.length - MAX_CELL
            const isToday   = key === todayKey
            const dow       = (firstDow + i) % 7
            const hasEvents = dayEvs.length > 0

            return (
              <div
                key={day}
                onClick={() => hasEvents && setSelectedDay(key)}
                className={`p-1 flex flex-col gap-0.5 overflow-hidden transition-colors min-h-0 ${
                  hasEvents ? 'cursor-pointer hover:bg-bg-2 active:bg-bg-3' : ''
                } ${isToday ? 'bg-[#F5ECEC]/50' : 'bg-bg'}`}
              >
                {/* 日付数字 */}
                <span className={`font-mono text-[11px] leading-none self-start w-[18px] h-[18px] flex items-center justify-center rounded-full shrink-0 ${
                  isToday         ? 'bg-ds-accent text-white font-semibold'
                  : dow === 0     ? 'text-red-400'
                  : dow === 6     ? 'text-blue-400'
                  : 'text-ds-text-3'
                }`}>
                  {day}
                </span>

                {/* 活动 badges（最多 MAX_CELL 条） */}
                {shown.map(ev => {
                  const conf = getTypeConfig(ev)
                  return (
                    <div key={ev.id} className={`${conf.bg} ${conf.color} rounded-sm px-1 shrink-0`}>
                      <span className="font-ui text-[9px] font-medium line-clamp-1 block leading-[14px]">
                        {ev.title}
                      </span>
                    </div>
                  )
                })}

                {/* 超出件数 — overflow > 0 のときだけ表示 */}
                {overflow > 0 && (
                  <span className="font-mono text-[9px] text-ds-text-4 pl-0.5 shrink-0 leading-[14px]">
                    +{overflow}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* 凡例 */}
        {!loading && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 px-0.5 shrink-0">
            {Object.entries(EVENT_TYPE_CONFIG).map(([, conf]) => (
              <div key={conf.label} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-sm ${conf.bg}`} />
                <span className="font-ui text-[10px] text-ds-text-4">{conf.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 当日詳細 Modal */}
      {selectedDay && (
        <DayModal
          dateKey={selectedDay}
          events={allByDate[selectedDay] ?? []}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
