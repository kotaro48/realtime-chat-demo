import { useEffect, useRef, useState } from 'react'
import { authHeaders } from '../lib/auth'  // auth: JWT 请求头

// ── 类型定义 ──────────────────────────────────────────────

interface Member {
  id: string
  name: string
  team: string | null
  totalCount: number
}

interface GridEvent {
  id: string
  name: string
  date: string
  endDate: string | null
  totalCount: number
}

interface Ticket {
  count: number
  note: string | null
}

interface GridData {
  events: GridEvent[]
  members: Member[]
  tickets: Record<string, Ticket>  // key: "eventId_memberId"
}

interface AllMember {
  id: string
  name: string
  nameKana: string | null
  team: string | null
}

// ── 单元格编辑浮层 ────────────────────────────────────────

function CellModal({
  member,
  event,
  ticket,
  onSave,
  onClose,
}: {
  member: Member
  event: GridEvent
  ticket: Ticket | undefined
  onSave: (count: number, note: string) => Promise<void>
  onClose: () => void
}) {
  const [count, setCount] = useState(ticket?.count ?? 0)
  const [note, setNote] = useState(ticket?.note ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(count, note)
    setSaving(false)
  }

  const dateStr = new Date(event.date).toLocaleDateString('ja-JP', {
    month: 'numeric', day: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full sm:w-[360px] bg-bg border border-ds-border rounded-t-lg sm:rounded-md px-5 py-6 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* タイトル */}
        <p className="font-ui text-[11px] text-ds-text-4 mb-0.5">
          {dateStr} · {event.name}
        </p>
        <h2 className="font-ui text-[15px] font-semibold text-ds-text mb-5">
          {member.name}
        </h2>

        {/* 枚数 +/- コントロール */}
        <div className="flex items-center justify-between mb-5">
          <span className="font-ui text-[13px] text-ds-text-2">枚数</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCount(c => Math.max(0, c - 1))}
              className="w-9 h-9 flex items-center justify-center bg-bg-2 border border-ds-border rounded-sm text-ds-text hover:bg-bg-3 text-xl font-light"
            >
              −
            </button>
            <span className="font-mono text-[22px] font-semibold text-ds-text w-10 text-center">
              {count}
            </span>
            <button
              onClick={() => setCount(c => c + 1)}
              className="w-9 h-9 flex items-center justify-center bg-bg-2 border border-ds-border rounded-sm text-ds-text hover:bg-bg-3 text-xl font-light"
            >
              ＋
            </button>
          </div>
        </div>

        {/* メモ入力 */}
        <textarea
          placeholder="メモ（話題など）"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          maxLength={200}
          className="w-full resize-none px-3 py-2 text-[13.5px] bg-bg-2 border border-ds-border rounded-sm text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3 font-jp"
        />

        {/* ボタン */}
        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="font-ui text-[13px] text-ds-text-3 border border-ds-border hover:bg-bg-2 rounded-sm px-4 h-9"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-ui text-[13px] font-medium text-white bg-ds-accent hover:bg-ds-accent-2 disabled:opacity-40 rounded-sm px-4 h-9"
          >
            {saving ? '…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 新建活动弹窗 ──────────────────────────────────────────

function NewEventModal({
  onSave,
  onClose,
}: {
  onSave: (name: string, date: string) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    await onSave(name.trim(), date)
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={handleSave}
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:w-[400px] bg-bg border border-ds-border rounded-t-lg sm:rounded-md px-5 py-6 shadow-lg"
      >
        <h2 className="font-ui text-[15px] font-semibold text-ds-text mb-4">日程を追加</h2>
        <div className="flex flex-col gap-3">
          <input
            ref={nameRef}
            type="text"
            placeholder="例: 56th シングル個握"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            required
            className="w-full h-[38px] px-3 text-[14px] bg-bg-2 border border-ds-border rounded-sm text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3"
          />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full h-[38px] px-3 text-[14px] bg-bg-2 border border-ds-border rounded-sm text-ds-text focus:outline-none focus:border-ds-text-3"
          />
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-ui text-[13px] text-ds-text-3 border border-ds-border hover:bg-bg-2 rounded-sm px-4 h-9"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="font-ui text-[13px] font-medium text-white bg-ds-accent hover:bg-ds-accent-2 disabled:opacity-40 rounded-sm px-4 h-9"
          >
            {saving ? '…' : '追加'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── 添加成员浮层 ──────────────────────────────────────────

function AddMemberModal({
  allMembers,
  watchedIds,
  onAdd,
  onRemove,
  onClose,
}: {
  allMembers: AllMember[]
  watchedIds: Set<string>
  onAdd: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
  onClose: () => void
}) {
  const teams = [...new Set(allMembers.map(m => m.team ?? ''))].filter(Boolean).sort()

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full sm:w-[420px] max-h-[70vh] bg-bg border border-ds-border rounded-t-lg sm:rounded-md shadow-lg flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ds-border-2 shrink-0">
          <h2 className="font-ui text-[15px] font-semibold text-ds-text">メンバーを選択</h2>
          <button onClick={onClose} className="text-ds-text-3 hover:text-ds-text">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-3 py-3">
          {teams.map(team => (
            <div key={team} className="mb-4">
              <p className="font-mono text-[10px] font-medium text-ds-text-4 tracking-widest uppercase px-2 mb-1">
                {team}
              </p>
              {allMembers.filter(m => (m.team ?? '') === team).map(m => {
                const watching = watchedIds.has(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => watching ? onRemove(m.id) : onAdd(m.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-left mb-0.5 ${
                      watching ? 'bg-ds-accent/10' : 'hover:bg-bg-2'
                    }`}
                  >
                    <span className={`font-ui text-[13.5px] ${watching ? 'text-ds-text font-medium' : 'text-ds-text-2'}`}>
                      {m.name}
                    </span>
                    {watching && (
                      <svg className="w-4 h-4 text-ds-accent shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── メイングリッド ─────────────────────────────────────────

const COL_W = 88   // 日期列宽度（px）
const ROW_H = 48   // 行高（px）
const FIXED_W = 80 // 冻结成员列宽度（px）

export function HandshakeGrid() {
  const [grid, setGrid] = useState<GridData | null>(null)
  const [allMembers, setAllMembers] = useState<AllMember[]>([])
  const [loading, setLoading] = useState(true)

  // 弹窗状态
  const [cellModal, setCellModal] = useState<{ member: Member; event: GridEvent } | null>(null)
  const [newEventOpen, setNewEventOpen] = useState(false)
  const [memberModalOpen, setMemberModalOpen] = useState(false)

  const load = async () => {
    const [gridRes, membersRes] = await Promise.all([
      fetch('/api/handshake/grid', { headers: authHeaders() }),
      fetch('/api/members'),
    ])
    const [gridData, membersData] = await Promise.all([gridRes.json(), membersRes.json()])
    setGrid(gridData)
    setAllMembers(membersData)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── 操作：新建活动 ────────────────────────────────────────
  async function handleCreateEvent(name: string, date: string) {
    await fetch('/api/handshake/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name, date }),
    })
    setNewEventOpen(false)
    await load()
  }

  // ── 操作：删除活动（长按列头）────────────────────────────
  async function handleDeleteEvent(eventId: string, eventName: string) {
    if (!confirm(`「${eventName}」を削除しますか？\n（枚数記録もすべて削除されます）`)) return
    await fetch(`/api/handshake/events/${eventId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    await load()
  }

  // ── 操作：添加/移除关注成员 ───────────────────────────────
  async function handleAddMember(memberId: string) {
    await fetch('/api/handshake/watched', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ memberId }),
    })
    await load()
  }

  async function handleRemoveMember(memberId: string) {
    await fetch(`/api/handshake/watched/${memberId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    await load()
  }

  // ── 操作：保存单元格 ─────────────────────────────────────
  async function handleSaveTicket(count: number, note: string) {
    if (!cellModal) return
    await fetch('/api/handshake/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        eventId: cellModal.event.id,
        memberId: cellModal.member.id,
        count,
        note: note || null,
      }),
    })
    setCellModal(null)
    await load()
  }

  if (loading) {
    return <p className="text-[13.5px] text-ds-text-3 py-8 px-5">読み込み中…</p>
  }

  if (!grid) return null

  const { events, members, tickets } = grid
  const watchedIds = new Set(members.map(m => m.id))

  // 全局总计（右下角）
  const grandTotal = events.reduce((s, e) => s + e.totalCount, 0)

  // 空状态
  if (members.length === 0 && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-[14px] text-ds-text-3 text-center">
          まずメンバーと日程を追加してください
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setMemberModalOpen(true)}
            className="font-ui text-[13px] font-medium text-white bg-ds-accent hover:bg-ds-accent-2 rounded-sm px-4 h-9"
          >
            ＋ メンバー
          </button>
          <button
            onClick={() => setNewEventOpen(true)}
            className="font-ui text-[13px] font-medium text-ds-text-2 border border-ds-border hover:bg-bg-2 rounded-sm px-4 h-9"
          >
            ＋ 日程
          </button>
        </div>
        {memberModalOpen && (
          <AddMemberModal
            allMembers={allMembers}
            watchedIds={watchedIds}
            onAdd={handleAddMember}
            onRemove={handleRemoveMember}
            onClose={() => setMemberModalOpen(false)}
          />
        )}
        {newEventOpen && (
          <NewEventModal onSave={handleCreateEvent} onClose={() => setNewEventOpen(false)} />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-ds-border-2 shrink-0">
        <button
          onClick={() => setMemberModalOpen(true)}
          className="font-ui text-[12px] font-medium text-ds-text-2 border border-ds-border hover:bg-bg-2 rounded-sm px-3 h-8 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          メンバー
        </button>
        <button
          onClick={() => setNewEventOpen(true)}
          className="font-ui text-[12px] font-medium text-ds-text-2 border border-ds-border hover:bg-bg-2 rounded-sm px-3 h-8 flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          日程
        </button>
        <span className="ml-auto font-mono text-[11px] text-ds-text-4">
          合計 {grandTotal} 枚
        </span>
      </div>

      {/* テーブル（横スクロール） */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse" style={{ minWidth: FIXED_W + events.length * COL_W + COL_W }}>
          {/* ヘッダー行（日付列） */}
          <thead>
            <tr>
              {/* 左上の固定セル（空） */}
              <th
                className="bg-bg border-b border-r border-ds-border-2 z-20 sticky left-0"
                style={{ width: FIXED_W, minWidth: FIXED_W, height: ROW_H }}
              />

              {/* 活动列头 */}
              {events.map(event => {
                const dateStr = new Date(event.date).toLocaleDateString('ja-JP', {
                  month: 'numeric', day: 'numeric',
                })
                return (
                  <th
                    key={event.id}
                    style={{ width: COL_W, minWidth: COL_W, height: ROW_H }}
                    className="border-b border-r border-ds-border-2 bg-bg px-2 text-center align-middle group"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-[11px] text-ds-text-4">{dateStr}</span>
                      <span className="font-ui text-[11px] text-ds-text-2 leading-tight line-clamp-1 max-w-full px-1">
                        {event.name}
                      </span>
                    </div>
                    {/* 长按/右键删除 — 用小按钮 */}
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.name)}
                      className="hidden group-hover:flex absolute top-1 right-1 w-4 h-4 items-center justify-center text-ds-text-4 hover:text-red-500"
                      title="削除"
                    >
                      ×
                    </button>
                  </th>
                )
              })}

              {/* 右端：合計列头 */}
              <th
                style={{ width: COL_W, minWidth: COL_W, height: ROW_H }}
                className="border-b border-ds-border-2 bg-bg px-2 text-center align-middle"
              >
                <span className="font-mono text-[11px] font-medium text-ds-text-3">合計</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {/* 成员行 */}
            {members.map(member => (
              <tr key={member.id} className="group/row">
                {/* 冻结：成员名（sticky left） */}
                <td
                  className="sticky left-0 z-10 bg-bg border-b border-r border-ds-border-2 px-2 align-middle"
                  style={{ width: FIXED_W, minWidth: FIXED_W, height: ROW_H }}
                >
                  <div className="flex flex-col">
                    <span className="font-ui text-[12.5px] font-medium text-ds-text leading-tight">
                      {member.name}
                    </span>
                    {member.team && (
                      <span className="font-mono text-[10px] text-ds-text-4">{member.team}</span>
                    )}
                  </div>
                </td>

                {/* 各活动单元格 */}
                {events.map(event => {
                  const key = `${event.id}_${member.id}`
                  const ticket = tickets[key]
                  const hasCount = ticket && ticket.count > 0
                  const hasNote = ticket && !!ticket.note

                  return (
                    <td
                      key={event.id}
                      onClick={() => setCellModal({ member, event })}
                      style={{ width: COL_W, minWidth: COL_W, height: ROW_H }}
                      className="border-b border-r border-ds-border-2 text-center align-middle cursor-pointer hover:bg-bg-2 active:bg-bg-3 select-none"
                    >
                      {hasCount ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono text-[14px] font-semibold text-ds-text">
                            {ticket.count}
                          </span>
                          <span className="font-ui text-[10px] text-ds-text-4">枚</span>
                          {hasNote && (
                            <span className="text-[10px]">📝</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-ds-border text-[18px] font-light select-none">—</span>
                      )}
                    </td>
                  )
                })}

                {/* 行合計 */}
                <td
                  style={{ width: COL_W, minWidth: COL_W, height: ROW_H }}
                  className="border-b border-ds-border-2 text-center align-middle bg-bg"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="font-mono text-[13px] font-semibold text-ds-text-2">
                      {member.totalCount}
                    </span>
                    <span className="font-ui text-[10px] text-ds-text-4">枚</span>
                  </div>
                </td>
              </tr>
            ))}

            {/* 合計行（列合计） */}
            <tr className="bg-bg-2">
              <td
                className="sticky left-0 z-10 bg-bg-2 border-t border-r border-ds-border px-2 align-middle"
                style={{ width: FIXED_W, minWidth: FIXED_W, height: ROW_H }}
              >
                <span className="font-mono text-[11px] font-medium text-ds-text-3">合計</span>
              </td>
              {events.map(event => (
                <td
                  key={event.id}
                  style={{ width: COL_W, minWidth: COL_W, height: ROW_H }}
                  className="border-t border-r border-ds-border text-center align-middle"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span className="font-mono text-[13px] font-semibold text-ds-text-2">
                      {event.totalCount}
                    </span>
                    <span className="font-ui text-[10px] text-ds-text-4">枚</span>
                  </div>
                </td>
              ))}
              {/* 右下角：全局合计 */}
              <td
                style={{ width: COL_W, minWidth: COL_W, height: ROW_H }}
                className="border-t border-ds-border text-center align-middle"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span className="font-mono text-[14px] font-bold text-ds-accent">
                    {grandTotal}
                  </span>
                  <span className="font-ui text-[10px] text-ds-text-3">枚</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 弹窗 */}
      {cellModal && (
        <CellModal
          member={cellModal.member}
          event={cellModal.event}
          ticket={tickets[`${cellModal.event.id}_${cellModal.member.id}`]}
          onSave={handleSaveTicket}
          onClose={() => setCellModal(null)}
        />
      )}
      {newEventOpen && (
        <NewEventModal onSave={handleCreateEvent} onClose={() => setNewEventOpen(false)} />
      )}
      {memberModalOpen && (
        <AddMemberModal
          allMembers={allMembers}
          watchedIds={watchedIds}
          onAdd={handleAddMember}
          onRemove={handleRemoveMember}
          onClose={() => setMemberModalOpen(false)}
        />
      )}
    </div>
  )
}
