import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'      // react-router-dom: 路由跳转
import { useAuth } from '../context/AuthContext'     // AuthContext: 全局登录状态
import { api } from '../services/api'               // api: 统一 HTTP 封装
import type { BookmarkedThread } from '../types'     // types: 共享类型

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
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<BookmarkedThread[]>([])
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const largeTitleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = largeTitleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get<BookmarkedThread[]>('/api/bookmarks')
      .then(data => { setBookmarks(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className={`shrink-0 sticky top-0 z-10 transition-all duration-200 ${scrolled ? 'bg-bg border-b border-ds-border-2' : 'bg-transparent'}`}>
        <div className="max-w-[1060px] mx-auto h-[52px] relative flex items-center px-5">
          <span className={`absolute left-1/2 -translate-x-1/2 font-ui text-[15px] font-semibold text-ds-text tracking-tight pointer-events-none transition-opacity duration-200 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            収藏したスレッド
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-[860px] mx-auto w-full px-5 pb-[52px] md:pb-0">
        {/* 大标题 */}
        <h1 ref={largeTitleRef} className="font-jp text-[28px] font-bold text-ds-text pt-5 pb-3 leading-tight">
          収藏したスレッド
        </h1>
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
