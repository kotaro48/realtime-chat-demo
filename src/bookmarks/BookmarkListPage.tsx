import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'  // react-router-dom: 路由跳转
import { getUser, authHeaders } from '../lib/auth'  // auth: 登录状态和 JWT

interface BookmarkedThread {
  bookmarkedAt: string
  thread: {
    id: string
    title: string
    updatedAt: string
    board: { slug: string; name: string }
    author: { nickname: string; avatarColor: string }
    postCount: number
  }
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今日'
  if (days === 1) return '昨日'
  if (days < 7) return `${days}日前`
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
}

export function BookmarkListPage() {
  const navigate = useNavigate()
  const user = getUser()
  const [bookmarks, setBookmarks] = useState<BookmarkedThread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetch('/api/bookmarks', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setBookmarks(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="shrink-0 bg-bg border-b border-ds-border-2 z-10">
        <div className="max-w-[1060px] mx-auto h-[52px] flex items-center px-5">
          <h1 className="font-ui text-[15px] font-semibold text-ds-text">収藏したスレッド</h1>
        </div>
      </header>

      <main className="flex-1 max-w-[860px] mx-auto w-full px-5 pb-[52px]">
        {!user ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <p className="font-ui text-[14px] text-ds-text-3 text-center">
              ログインしてスレッドを収藏しよう
            </p>
            <button
              onClick={() => navigate('/')}
              className="font-ui text-[13px] font-medium text-white bg-primary hover:bg-primary/90 rounded-sm px-4 h-9"
            >
              ログインページへ
            </button>
          </div>
        ) : loading ? (
          <p className="font-ui text-[13px] text-ds-text-3 py-8">読み込み中…</p>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="font-ui text-[14px] text-ds-text-3 text-center">
              まだ収藏したスレッドはありません
            </p>
            <p className="font-ui text-[12px] text-ds-text-4 mt-1 text-center">
              スレッドを開いてヘッダーの ♡ をタップしよう
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ds-border-2">
            {bookmarks.map(({ bookmarkedAt, thread }) => (
              <li key={thread.id}>
                <button
                  className="w-full text-left py-4 hover:bg-bg-2 -mx-5 px-5 transition-colors"
                  onClick={() => navigate(`/board/${thread.board.slug}/thread/${thread.id}`)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-[14px] font-medium text-ds-text leading-snug truncate">
                        {thread.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-ui text-[11px] text-ds-text-4">
                          {thread.board.name}
                        </span>
                        <span className="font-mono text-[11px] text-ds-text-4">
                          {thread.postCount} レス
                        </span>
                        <span className="font-mono text-[11px] text-ds-text-4 ml-auto">
                          収藏 {relativeDate(bookmarkedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
