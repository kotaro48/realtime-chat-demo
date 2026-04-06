import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'  // react-router-dom: 路由跳转
import { Sidebar } from '../components/Sidebar'  // Sidebar: 左滑侧边栏
import { getUser } from '../lib/auth'  // auth: 读取登录态
import { HandshakeGrid } from './HandshakeGrid'        // HandshakeGrid: 握手记录表格
import { OfficialCalendar } from './OfficialCalendar'  // OfficialCalendar: 官方活动日历

type Tab = 'calendar' | 'handshake'

export function MyPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('calendar')
  const [scrolled, setScrolled] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const user = getUser()

  // 未登录时跳转到首页
  if (!user) {
    navigate('/')
    return null
  }

  return (
    <div className="h-dvh flex flex-col bg-page-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header — 透明起始，滚动后显示背景；大标题随 max-h 折叠 */}
      <header className={`shrink-0 sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-bg border-b border-ds-border-2' : 'bg-bg'}`}>
        {/* Nav row */}
        <div className="max-w-[1060px] mx-auto h-[52px] relative flex items-center px-5">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* 中：小标题，仅滚动后可见 */}
          <span className={`absolute left-1/2 -translate-x-1/2 font-ui text-[15px] font-semibold text-ds-text tracking-tight pointer-events-none transition-opacity duration-200 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            マイページ
          </span>

          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm ml-auto shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5" />
            </svg>
          </button>
        </div>

        {/* 大标题 — max-h で折叠 */}
        <div className={`overflow-hidden transition-all duration-300 max-w-[1060px] mx-auto px-5 ${scrolled ? 'max-h-0 opacity-0 pb-0' : 'max-h-24 opacity-100 pb-3'}`}>
          <h1 className="font-jp text-[28px] font-bold text-ds-text leading-tight">マイページ</h1>
          <p className="font-ui text-[13px] text-ds-text-3 mt-0.5">{user.nickname}</p>
        </div>

        {/* Tab Bar */}
        <div className="max-w-[1060px] mx-auto px-5 flex gap-1 border-t border-ds-border-2">
          {([
            { key: 'calendar',  label: '公式日程' },
            { key: 'handshake', label: '握手記録' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`font-ui text-[13px] font-medium px-4 h-10 border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-ds-accent text-ds-accent'
                  : 'border-transparent text-ds-text-3 hover:text-ds-text-2'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* コンテンツ — onScroll でスクロール検知 */}
      <div
        ref={contentRef}
        className="flex-1 overflow-hidden"
        onScroll={e => setScrolled((e.currentTarget as HTMLDivElement).scrollTop > 10)}
      >
        {tab === 'calendar'  && <OfficialCalendar />}
        {tab === 'handshake' && <HandshakeGrid />}
      </div>
    </div>
  )
}
