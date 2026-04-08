import { useState } from 'react'  // react: 状态管理
import { useNavigate, useLocation } from 'react-router-dom'  // react-router-dom: 路由跳转和当前路径
import { Compass, LayoutList, MessageCircle, Ellipsis } from 'lucide-react'  // lucide-react: tab 图标

const TABS = [
  {
    path: '/',
    match: (p: string) => p === '/',
    label: '見つける',
    Icon: Compass,
  },
  {
    path: '/board',
    match: (p: string) => p.startsWith('/board'),
    label: '掲示板',
    Icon: LayoutList,
  },
  {
    path: '/chat',
    match: (p: string) => p.startsWith('/chat'),
    label: 'チャット',
    Icon: MessageCircle,
  },
]

// 三点菜单里的额外页面入口（収藏移至此处）
const MORE_ITEMS = [
  { path: '/bookmarks',  label: '収藏' },
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
              <tab.Icon
                className={`w-5 h-5 transition-colors ${active ? 'text-ds-text' : 'text-ds-text-4'}`}
                strokeWidth={active ? 2 : 1.5}
                fill={active && tab.path === '/bookmarks' ? 'currentColor' : 'none'}
              />
              <span className={`font-ui text-[11px] transition-colors ${active ? 'font-semibold text-ds-text' : 'font-medium text-ds-text-4'}`}>
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
          <Ellipsis
            className={`w-5 h-5 transition-colors ${moreActive || moreOpen ? 'text-ds-text' : 'text-ds-text-4'}`}
            strokeWidth={moreActive || moreOpen ? 2 : 1.5}
          />
          <span className={`font-ui text-[11px] transition-colors ${moreActive || moreOpen ? 'font-semibold text-ds-text' : 'font-medium text-ds-text-4'}`}>
            もっと
          </span>
        </button>
      </nav>
    </>
  )
}
