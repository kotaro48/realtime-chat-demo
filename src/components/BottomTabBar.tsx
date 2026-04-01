import { useState } from 'react'  // react: 状态管理
import { useNavigate, useLocation } from 'react-router-dom'  // react-router-dom: 路由跳转和当前路径

const TABS = [
  {
    path: '/',
    match: (p: string) => p === '/' || p.startsWith('/board'),
    label: '掲示板',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5" />
    ),
  },
  {
    path: '/chat',
    match: (p: string) => p.startsWith('/chat'),
    label: 'チャット',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    ),
  },
  {
    path: '/bookmarks',
    match: (p: string) => p.startsWith('/bookmarks'),
    label: '収藏',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    ),
  },
]

// 三点菜单里的额外页面入口
const MORE_ITEMS = [
  { path: '/mypage',     label: 'マイページ' },
  { path: '/photo-demo', label: 'デジタル生写真' },
  { path: '/venue',      label: '握手会地図' },
]

export function BottomTabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreActive = MORE_ITEMS.some(item => pathname.startsWith(item.path))

  function handleMoreItem(path: string) {
    setMoreOpen(false)
    navigate(path)
  }

  return (
    <>
      {/* 点击遮罩关闭菜单 */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* 三点菜单弹出层 */}
      {moreOpen && (
        <div className="fixed bottom-[60px] right-2 z-50 bg-bg border border-ds-border rounded-lg shadow-sm overflow-hidden min-w-[148px]">
          {MORE_ITEMS.map(item => (
            <button
              key={item.path}
              onClick={() => handleMoreItem(item.path)}
              className="w-full text-left px-4 py-3 font-ui text-[14px] text-ds-text hover:bg-bg-2 active:bg-bg-3 transition-colors duration-150 border-b border-ds-border-2 last:border-b-0"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-[52px] bg-bg border-t border-ds-border-2 flex z-50">
        {TABS.map(tab => {
          const active = tab.match(pathname)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              <svg
                className={`w-5 h-5 ${active ? 'text-ds-accent' : 'text-ds-text-4'}`}
                fill={active && tab.path === '/bookmarks' ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                {tab.icon}
              </svg>
              <span className={`font-ui text-[11px] font-medium ${active ? 'text-ds-accent' : 'text-ds-text-4'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}

        {/* 三点线 More 按钮 */}
        <button
          onClick={() => setMoreOpen(v => !v)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5"
        >
          <svg
            className={`w-5 h-5 ${moreActive || moreOpen ? 'text-ds-accent' : 'text-ds-text-4'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm6.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm6.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <span className={`font-ui text-[11px] font-medium ${moreActive || moreOpen ? 'text-ds-accent' : 'text-ds-text-4'}`}>
            もっと
          </span>
        </button>
      </nav>
    </>
  )
}
