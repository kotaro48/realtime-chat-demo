/**
 * [INPUT]: 依赖 /api/boards、/api/trending、/api/threads/recent
 * [OUTPUT]: 对外提供 DiscoverPage 组件
 * [POS]: discover 模块的核心页面，底部导航首位入口，新用户探索起点
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'  // react-router-dom: 帖子跳转
import { AuthModal } from '../components/AuthModal'  // AuthModal：登录/注册弹窗
import { getUser, type AuthUser } from '../lib/auth'  // auth：读取当前登录用户

// 版块名映射（slug → 日文显示名）
const SLUG_TO_NAME: Record<string, string> = {
  general:   '総合',
  stage48:   'Stage48',
  handshake: '握手会',
  photo:     '写真',
}

const DEPLOY_STAMP = 'Updated 2026-04-12 15:08 JST'

interface Board {
  slug: string
  name: string
}

interface Thread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  board: { slug: string; name: string }
  _count: { posts: number }
  score?: number
}

// 相对时间：N分前 / N時間前 / N日前
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

// 回复数格式化：1200 → 1.2k
function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export function DiscoverPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(() => getUser())
  const [boards, setBoards] = useState<Board[]>([])
  const [trending, setTrending] = useState<Thread[]>([])
  const [recent, setRecent] = useState<Thread[]>([])
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [recentOffset, setRecentOffset] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const largeTitleRef = useRef<HTMLHeadingElement>(null)
  const RECENT_LIMIT = 15

  // 大标题离开视口时 header 收缩
  useEffect(() => {
    const el = largeTitleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // API 返回值守卫：非数组时回退到 []
  const safeArray = (data: unknown): Thread[] =>
    Array.isArray(data) ? data : []

  // 初次加载版块列表
  useEffect(() => {
    fetch('/api/boards')
      .then(r => r.json())
      .then(d => setBoards(Array.isArray(d) ? d : []))
  }, [])

  // 切换版块 / 初始时加载 trending & recent
  useEffect(() => {
    const q = selectedBoard ? `&board=${selectedBoard}` : ''
    fetch(`/api/trending?limit=6${q}`)
      .then(r => r.json())
      .then(d => setTrending(safeArray(d)))
    fetch(`/api/threads/recent?limit=${RECENT_LIMIT}&offset=0${q}`)
      .then(r => r.json())
      .then(d => { setRecent(safeArray(d)); setRecentOffset(RECENT_LIMIT) })
  }, [selectedBoard])

  // 加载更多最新话题
  function loadMoreRecent() {
    const q = selectedBoard ? `&board=${selectedBoard}` : ''
    fetch(`/api/threads/recent?limit=${RECENT_LIMIT}&offset=${recentOffset}${q}`)
      .then(r => r.json())
      .then(d => {
        setRecent(prev => [...prev, ...safeArray(d)])
        setRecentOffset(prev => prev + RECENT_LIMIT)
      })
  }

  function goThread(t: Thread) {
    navigate(`/board/${t.board.slug}/thread/${t.id}`)
  }

  const pickup = trending[0] ?? null
  const hotList = trending.slice(0, 5)   // top 5 ranking（含 pickup）

  return (
    <div className="min-h-dvh bg-bg">
      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-bg' : 'bg-transparent'}`}>
        <div className="h-[52px] flex items-center px-4 gap-3">
          <span className={`font-jp text-[15px] font-semibold text-ds-text transition-opacity duration-200 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            見つける
          </span>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {user ? (
              <button
                onClick={() => navigate('/mypage')}
                className="h-9 px-3 rounded-xl font-ui text-[13px] font-medium text-ds-text-2 bg-bg-2"
              >
                {user.nickname}
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setAuthTab('login'); setAuthOpen(true) }}
                  className="h-9 px-2 font-ui text-[13px] font-semibold text-ds-text-2"
                >
                  ログイン
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setAuthOpen(true) }}
                  className="h-9 px-4 rounded-xl font-ui text-[13px] font-semibold text-white bg-ds-text"
                >
                  新規登録
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 pb-24">
        {/* 大标题 */}
        <h1 ref={largeTitleRef} className="font-jp text-[28px] font-bold text-ds-text pt-2 pb-4 leading-tight">
          見つける
        </h1>
        <p className="font-mono text-[10px] text-ds-text-4 pb-4">
          {DEPLOY_STAMP}
        </p>

        {/* 版块 Filter Chips — 横向滚动 */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4">
          {/* すべて chip */}
          <button
            onClick={() => setSelectedBoard(null)}
            className={`shrink-0 px-4 h-[34px] rounded-full font-ui text-[13px] font-medium transition-colors ${
              selectedBoard === null
                ? 'bg-ds-accent text-white'
                : 'border border-ds-border text-ds-text-2 bg-bg hover:bg-bg-2'
            }`}
          >
            すべて
          </button>
          {boards.map(b => (
            <button
              key={b.slug}
              onClick={() => setSelectedBoard(b.slug)}
              className={`shrink-0 px-4 h-[34px] rounded-full font-ui text-[13px] font-medium transition-colors ${
                selectedBoard === b.slug
                  ? 'bg-ds-accent text-white'
                  : 'border border-ds-border text-ds-text-2 bg-bg hover:bg-bg-2'
              }`}
            >
              {SLUG_TO_NAME[b.slug] ?? b.name}
            </button>
          ))}
        </div>

        {/* ===== 注目ピックアップ ===== */}
        <section className="mb-6">
          <p className="font-ui text-[12px] font-medium text-ds-text-3 mb-3">注目ピックアップ</p>
          {pickup ? (
            <div
              onClick={() => goThread(pickup)}
              className="flex gap-0 bg-bg-2 rounded-lg overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
            >
              {/* 左边粉/accent 色竖条 */}
              <div className="w-1 shrink-0 bg-ds-accent rounded-l-lg" />
              <div className="flex-1 px-4 py-4">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-ui text-[11px] font-semibold text-ds-accent">
                    {SLUG_TO_NAME[pickup.board.slug] ?? pickup.board.name}
                  </span>
                  <span className="font-ui text-[11px] text-ds-text-3">注目</span>
                </div>
                {/* 标题 */}
                <p className="font-jp text-[15px] font-bold text-ds-text leading-snug line-clamp-2 mb-3">
                  {pickup.title}
                </p>
                {/* Stats */}
                <div className="flex items-center gap-2 font-ui text-[12px] text-ds-text-3">
                  <span>{fmt(pickup._count.posts)} レス</span>
                  <span>·</span>
                  <span>最終: {relativeTime(pickup.updatedAt)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[100px] bg-bg-2 rounded-lg animate-pulse" />
          )}
        </section>

        {/* ===== 今日のホット ===== */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-ui text-[13px] font-semibold text-ds-text">今日のホット</p>
            <button
              onClick={() => navigate('/')}
              className="font-ui text-[12px] font-medium text-ds-accent"
            >
              もっと見る
            </button>
          </div>

          <div className="divide-y divide-ds-border-2">
            {hotList.length > 0 ? hotList.map((t, i) => (
              <div
                key={t.id}
                onClick={() => goThread(t)}
                className="flex items-start gap-4 py-3 cursor-pointer active:opacity-70 transition-opacity"
              >
                {/* 排名数字 */}
                <span className={`shrink-0 w-6 font-jp text-[16px] font-bold leading-tight pt-[1px] ${i < 3 ? 'text-ds-accent' : 'text-ds-text-4'}`}>
                  {i + 1}
                </span>
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <p className="font-jp text-[14px] font-medium text-ds-text leading-snug line-clamp-1">
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 font-ui text-[12px] text-ds-text-3">
                    <span>{SLUG_TO_NAME[t.board.slug] ?? t.board.name}</span>
                    <span>{fmt(t._count.posts)} レス</span>
                  </div>
                </div>
              </div>
            )) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-3">
                  <div className="w-6 h-4 bg-bg-2 rounded animate-pulse shrink-0" />
                  <div className="flex-1 h-4 bg-bg-2 rounded animate-pulse" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* ===== 最新の話題 ===== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="font-ui text-[13px] font-semibold text-ds-text">最新の話題</p>
            <button
              onClick={loadMoreRecent}
              className="font-ui text-[12px] font-medium text-ds-accent"
            >
              もっと見る
            </button>
          </div>

          <div className="divide-y divide-ds-border-2">
            {recent.length > 0 ? recent.map(t => (
              <div
                key={t.id}
                onClick={() => goThread(t)}
                className="flex items-start gap-3 py-3 cursor-pointer active:opacity-70 transition-opacity"
              >
                {/* 红点 */}
                <span className="shrink-0 w-2 h-2 rounded-full bg-ds-accent mt-[6px]" />
                <div className="flex-1 min-w-0">
                  <p className="font-jp text-[14px] font-medium text-ds-text leading-snug line-clamp-1">
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 font-ui text-[12px] text-ds-text-3">
                    <span>{SLUG_TO_NAME[t.board.slug] ?? t.board.name}</span>
                    <span>{relativeTime(t.createdAt)}</span>
                  </div>
                </div>
              </div>
            )) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <div className="w-2 h-2 rounded-full bg-bg-2 animate-pulse mt-[6px] shrink-0" />
                  <div className="flex-1 h-4 bg-bg-2 rounded animate-pulse" />
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
        onSuccess={me => {
          localStorage.setItem('akb48_user', JSON.stringify(me))
          setUser(me)
          setAuthOpen(false)
        }}
      />
    </div>
  )
}
