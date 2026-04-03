import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'  // react-router-dom: URL参数和跳转
import { Sidebar } from '../components/Sidebar'  // Sidebar: 左滑侧边栏，含全局导航
import { getUser, authHeaders } from '../lib/auth'  // auth: 读取登录态和 JWT
import { AuthModal } from '../components/AuthModal'  // AuthModal: 登录/注册弹窗
import { RightSidebar } from '../components/RightSidebar'  // RightSidebar: 桌面端右侧栏

interface Thread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  author: { nickname: string; avatarUrl: string | null; avatarColor: string }
  _count: { posts: number }
}

interface Board {
  slug: string
  name: string
  description: string | null
}

// 相对时间：今日/昨日/N日前
function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今日'
  if (days === 1) return '昨日'
  if (days < 7)  return `${days}日前`
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
}

export function ThreadListPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [board, setBoard] = useState<Board | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 发帖弹窗状态
  const [newThreadOpen, setNewThreadOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newSubmitting, setNewSubmitting] = useState(false)
  const [newError, setNewError] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  const user = getUser()

  useEffect(() => {
    Promise.all([
      fetch(`/api/boards/${slug}`).then(r => r.json()),
      fetch(`/api/boards/${slug}/threads`).then(r => r.json()),
    ]).then(([boardData, threadsData]) => {
      setBoard(boardData)
      setThreads(threadsData)
      setLoading(false)
    })
  }, [slug])

  // 打开弹窗时聚焦标题输入框
  useEffect(() => {
    if (newThreadOpen) setTimeout(() => titleRef.current?.focus(), 50)
  }, [newThreadOpen])

  function handleNewThread(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim() || newSubmitting) return
    setNewError('')
    setNewSubmitting(true)
    fetch(`/api/boards/${slug}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json()
          setNewError(data.message ?? 'エラーが発生しました')
          return
        }
        const thread = await res.json()
        setNewThreadOpen(false)
        setNewTitle('')
        setNewContent('')
        navigate(`/board/${slug}/thread/${thread.id}`)
      })
      .finally(() => setNewSubmitting(false))
  }

  function handleNewThreadClick() {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setNewThreadOpen(true)
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header — 全宽 */}
      <header className="sticky top-0 z-50 bg-bg border-b border-ds-border-2">
        <div className="max-w-[1060px] mx-auto h-[52px] flex items-center gap-3 px-5">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <p className="font-ui text-[14.5px] font-medium text-ds-text truncate leading-tight">
              {board?.name ?? '…'}
            </p>
            {board?.description && (
              <p className="font-ui text-[11px] text-ds-text-4 truncate leading-tight">{board.description}</p>
            )}
          </div>

          <button
            onClick={handleNewThreadClick}
            className="font-ui text-[13px] font-medium text-white bg-ds-text hover:bg-ds-text-2 rounded-sm px-3 h-[30px] shrink-0"
          >
            スレを立てる
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* 内容列 + 右侧栏 */}
      <div className="max-w-[1060px] mx-auto px-5 pb-[52px] flex gap-6 items-start">
        <main className="flex-1 min-w-0 bg-bg">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 py-4 font-ui text-[12px] text-ds-text-4">
            <span className="hover:text-ds-text cursor-pointer" onClick={() => navigate('/')}>掲示板</span>
            <span>›</span>
            <span className="text-ds-text-2">{board?.name}</span>
          </div>

          {loading ? (
            <p className="text-[13.5px] text-ds-text-3 py-8">読み込み中…</p>
          ) : threads.length === 0 ? (
            <p className="text-[13.5px] text-ds-text-3 py-8">まだスレッドがありません。</p>
          ) : (
            <div className="border border-ds-border-2 rounded-md overflow-hidden">
              {threads.map((thread, i) => (
                <div
                  key={thread.id}
                  className="flex items-start gap-3 px-4 py-[14px] border-b border-ds-border-2 last:border-b-0 hover:bg-bg-2 active:bg-bg-3 cursor-pointer"
                  onClick={() => navigate(`/board/${slug}/thread/${thread.id}`)}
                >
                  <span className="font-mono text-[11px] text-ds-text-4 pt-0.5 min-w-[20px] shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold text-ds-text leading-snug line-clamp-2">
                      {thread.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-ui text-[12px] text-ds-text-4">{thread._count.posts} レス</span>
                      <span className="text-ds-border">·</span>
                      <span className="font-ui text-[12px] text-ds-text-4">{relativeDate(thread.updatedAt)}</span>
                      <span className="font-ui text-[12px] text-ds-text-4">{thread.author.nickname}</span>
                    </div>
                  </div>
                  {thread._count.posts > 1 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-ds-accent shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {/* 右侧栏 — 仅桌面端 */}
        <aside className="hidden lg:block w-[220px] shrink-0 sticky top-[52px]">
          <RightSidebar activeSlug={slug} />
        </aside>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={me => {
          localStorage.setItem('akb48_user', JSON.stringify(me))
          setAuthOpen(false)
          setNewThreadOpen(true)  // 登录成功后直接打开发帖弹窗
        }}
      />

      {/* 新建帖子弹窗 */}
      {newThreadOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
          onClick={() => setNewThreadOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />

          <form
            onSubmit={handleNewThread}
            onClick={e => e.stopPropagation()}
            className="relative w-full sm:w-[480px] bg-bg border border-ds-border rounded-t-lg sm:rounded-md px-5 py-6 shadow-lg post-enter"
          >
            <h2 className="font-ui text-[15px] font-semibold text-ds-text mb-4">スレを立てる</h2>

            <div className="flex flex-col gap-3">
              <input
                ref={titleRef}
                type="text"
                placeholder="スレタイトル"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                maxLength={100}
                required
                className="w-full h-[38px] px-3 text-[14px] bg-bg-2 border border-ds-border rounded-sm text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3"
              />
              <textarea
                placeholder="本文（1レス目）"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                maxLength={5000}
                required
                rows={5}
                className="w-full resize-none px-3 py-2 text-[14px] bg-bg-2 border border-ds-border rounded-sm text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3 font-jp"
              />
            </div>

            {newError && (
              <p className="mt-2 text-[12.5px] text-red-600">{newError}</p>
            )}

            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setNewThreadOpen(false)}
                className="font-ui text-[13px] font-medium text-ds-text-3 border border-ds-border hover:bg-bg-2 rounded-sm px-4 h-9"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={newSubmitting || !newTitle.trim() || !newContent.trim()}
                className="font-ui text-[13px] font-medium text-white bg-ds-accent hover:bg-ds-accent-2 disabled:opacity-40 rounded-sm px-4 h-9 flex items-center gap-1.5"
              >
                {newSubmitting && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {newSubmitting ? '投稿中…' : '投稿する'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
