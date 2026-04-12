import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'  // react-router-dom: 路由跳转
import { motion } from 'framer-motion'          // framer-motion: 列表错开入场动画
import { MessageSquare, Globe, Handshake, Camera, LayoutGrid } from 'lucide-react'  // lucide-react: 版块图标
import { Sidebar } from '../components/Sidebar'  // Sidebar: 左滑侧边栏，含全局导航
import { AuthModal } from '../components/AuthModal'  // AuthModal: 登录/注册弹窗
import { RightSidebar } from '../components/RightSidebar'  // RightSidebar: 桌面端右侧栏
import { PageWrapper } from '../components/PageWrapper'  // PageWrapper: 页面入场动画包装器
import { staggerContainer, staggerItem, hoverLift, tapPress } from '../lib/motion'  // motion: Apple Spring 配置
import type { AuthUser } from '../lib/auth'  // auth: 用户类型

interface Board {
  id: string
  slug: string
  name: string
  description: string | null
  _count: { threads: number }
}

// 版块图标 — 用 Lucide 线条图标，颜色跟随 text-ds-text-3
function BoardIcon({ slug }: { slug: string }) {
  const cls = 'w-[18px] h-[18px]'
  if (slug === 'general')   return <MessageSquare className={cls} strokeWidth={1.5} />
  if (slug === 'stage48')   return <Globe         className={cls} strokeWidth={1.5} />
  if (slug === 'handshake') return <Handshake     className={cls} strokeWidth={1.5} />
  if (slug === 'photo')     return <Camera        className={cls} strokeWidth={1.5} />
  return                           <LayoutGrid    className={cls} strokeWidth={1.5} />
}

export function BoardListPage() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('akb48_user') ?? 'null') } catch { return null }
  })
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [scrolled, setScrolled] = useState(false)
  const largeTitleRef = useRef<HTMLHeadingElement>(null)

  // 大标题离开视口时 header 显示小标题 + 背景
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
    fetch('/api/boards')
      .then(r => r.json())
      .then(data => { setBoards(data); setLoading(false) })
  }, [])


  return (
    <div className="min-h-screen bg-page-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={() => setUser(null)} />

      {/* Header — 透明起始，滚动后显示背景+边框 */}
      <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-bg border-b border-ds-border-2' : 'bg-transparent'}`}>
        <div className="max-w-[1060px] mx-auto h-[52px] relative flex items-center px-5">
          {/* 左：汉堡菜单 */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5"/>
            </svg>
          </button>

          {/* 中：小标题，仅滚动后可见 */}
          <span className={`absolute left-1/2 -translate-x-1/2 font-ui text-[15px] font-semibold text-ds-text tracking-tight pointer-events-none transition-opacity duration-200 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            Ota Kit
          </span>

          {/* 右：用户/登录 */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {user ? (
              <span className="h-9 px-3 rounded-xl font-ui text-[13px] font-medium text-ds-text-2 bg-bg-2 flex items-center">
                {user.nickname}
              </span>
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

      {/* 内容列 + 右侧栏 */}
      <div className="max-w-[1060px] mx-auto px-5 pb-24 flex gap-6 items-start">
        <main className="flex-1 min-w-0 bg-bg">
          {/* 大标题 — 滚出视口后 header 小标题接管 */}
          <h1 ref={largeTitleRef} className="font-jp text-[28px] font-bold text-ds-text pt-5 pb-2 leading-tight">
            Ota Kit
          </h1>

          {/* Section label */}
          <div className="pt-1 pb-3">
            <span className="font-mono text-[10px] font-medium text-ds-text-4 tracking-widest uppercase">
              掲示板
            </span>
          </div>

          {loading ? (
            <p className="text-[13.5px] text-ds-text-3 py-8">読み込み中…</p>
          ) : boards.length === 0 ? (
            <p className="text-[13.5px] text-ds-text-3 py-8">版块暂无内容。</p>
          ) : (
            <motion.div
              className="border border-ds-border-2 rounded-md overflow-hidden"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {boards.map(board => (
                <motion.div
                  key={board.id}
                  variants={staggerItem}
                  whileHover={hoverLift}
                  whileTap={tapPress}
                  className="flex items-center gap-4 px-4 py-[14px] border-b border-ds-border-2 last:border-b-0 hover:bg-bg-2 cursor-pointer"
                  onClick={() => navigate(`/board/${board.slug}`)}
                >
                  <div className="shrink-0 text-ds-text-3">
                    <BoardIcon slug={board.slug} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-ui text-[14.5px] font-medium text-ds-text leading-snug">
                      {board.name}
                    </p>
                    {board.description && (
                      <p className="font-ui text-[12px] text-ds-text-4 mt-0.5 leading-tight truncate">
                        {board.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] text-ds-text-4">
                      {board._count.threads}
                    </span>
                    <svg className="w-4 h-4 text-ds-text-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                    </svg>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>

        {/* 右侧栏 — 仅桌面端 */}
        <aside className="hidden lg:block w-[220px] shrink-0 sticky top-[52px]">
          <RightSidebar />
        </aside>
      </div>


      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
        onSuccess={me => { setUser(me); setAuthOpen(false) }}
      />
    </div>
  )
}
