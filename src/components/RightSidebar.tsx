import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'      // react-router-dom: 路由跳转
import { api } from '../services/api'               // api: 统一 HTTP 封装
import type { Board, Thread } from '../types'        // types: 共享类型

interface ActivityThread extends Thread {
  author: { nickname: string; avatarColor: string; avatarUrl: string | null }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 60)  return `${mins}分前`
  if (hours < 24)  return `${hours}時間前`
  if (days  < 7)   return `${days}日前`
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
}

export function RightSidebar({ activeSlug }: { activeSlug?: string }) {
  const navigate = useNavigate()
  const [boards, setBoards] = useState<Board[]>([])
  const [activity, setActivity] = useState<ActivityThread[]>([])

  useEffect(() => {
    Promise.all([
      api.get<Board[]>('/api/boards'),
      api.get<ActivityThread[]>('/api/boards/activity'),
    ]).then(([b, a]) => {
      setBoards(b)
      setActivity(a)
    }).catch(() => {})
  }, [])

  return (
    <div className="py-5 flex flex-col gap-6">

      {/* 版块一覧 */}
      <section>
        <p className="font-mono text-[10px] font-medium text-ds-text-4 tracking-widest uppercase mb-2 px-1">
          掲示板
        </p>
        <div className="flex flex-col">
          {boards.map(board => (
            <button
              key={board.id}
              onClick={() => navigate(`/board/${board.slug}`)}
              className={`flex items-center justify-between px-3 py-2 rounded-sm text-left hover:bg-bg-2 ${
                activeSlug === board.slug ? 'bg-bg-2' : ''
              }`}
            >
              <span className={`font-ui text-[13px] truncate ${
                activeSlug === board.slug ? 'font-medium text-ds-text' : 'text-ds-text-2'
              }`}>
                {board.name}
              </span>
              <span className="font-mono text-[10px] text-ds-text-4 shrink-0 ml-2">
                {board._count.threads}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 最新活動 */}
      {activity.length > 0 && (
        <section>
          <p className="font-mono text-[10px] font-medium text-ds-text-4 tracking-widest uppercase mb-2 px-1">
            最新活動
          </p>
          <div className="flex flex-col gap-px">
            {activity.map(thread => (
              <button
                key={thread.id}
                onClick={() => navigate(`/board/${thread.board.slug}/thread/${thread.id}`)}
                className="flex flex-col gap-0.5 px-3 py-2.5 rounded-sm text-left hover:bg-bg-2"
              >
                <p className="font-ui text-[12.5px] text-ds-text leading-snug line-clamp-2">
                  {thread.title}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[10px] text-ds-text-4">{thread.board.name}</span>
                  <span className="text-ds-border-2">·</span>
                  <span className="font-mono text-[10px] text-ds-text-4">{thread._count.posts} レス</span>
                  <span className="font-mono text-[10px] text-ds-text-4 ml-auto">
                    {relativeTime(thread.updatedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
