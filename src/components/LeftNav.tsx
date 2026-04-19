// 桌面端左侧导航栏（220px 固定宽度）
// 移动端由 BottomTabBar 承担同样的导航职责；本组件用 hidden md:flex 隐藏
// 设计参照 Instagram / X / note：Logo + 主要导航 + 二级入口 + 底部用户区

import { useNavigate, useLocation } from 'react-router-dom'  // react-router-dom: 路由跳转和当前路径
import {
  Compass, LayoutList, MessageCircle,
  Bookmark, User, Image, MapPin,
} from 'lucide-react'  // lucide-react: 各导航项图标
import { useAuth } from '../context/AuthContext'  // AuthContext: 读取登录状态

// 主导航（一级入口，放在顶部醒目位置）
const PRIMARY = [
  { path: '/',      match: (p: string) => p === '/',                 label: '見つける',   Icon: Compass },
  { path: '/board', match: (p: string) => p.startsWith('/board'),    label: '掲示板',     Icon: LayoutList },
  { path: '/chat',  match: (p: string) => p.startsWith('/chat'),     label: 'チャット',   Icon: MessageCircle },
]

// 二级入口（与 BottomTabBar 的「もっと」菜单一致）
const SECONDARY = [
  { path: '/bookmarks',  match: (p: string) => p.startsWith('/bookmarks'),  label: '収藏',             Icon: Bookmark },
  { path: '/mypage',     match: (p: string) => p.startsWith('/mypage'),     label: 'マイページ',       Icon: User },
  { path: '/photo-demo', match: (p: string) => p.startsWith('/photo-demo'), label: 'デジタル生写真',   Icon: Image },
  { path: '/venue',      match: (p: string) => p.startsWith('/venue'),      label: '握手会地図',       Icon: MapPin },
]

export function LeftNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  const renderItem = (item: typeof PRIMARY[number]) => {
    const active = item.match(pathname)
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-colors ${
          active ? 'bg-bg-2' : 'hover:bg-bg-2'
        }`}
      >
        <item.Icon
          className={`w-5 h-5 shrink-0 ${active ? 'text-ds-text' : 'text-ds-text-3'}`}
          strokeWidth={active ? 2 : 1.5}
        />
        <span className={`font-ui text-[14px] truncate ${
          active ? 'font-semibold text-ds-text' : 'font-medium text-ds-text-2'
        }`}>
          {item.label}
        </span>
      </button>
    )
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-dvh w-[220px] shrink-0 border-r border-ds-border-2 bg-bg flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5">
        <button
          onClick={() => navigate('/')}
          className="font-jp text-[20px] font-bold text-ds-text tracking-tight"
        >
          AKB48
        </button>
      </div>

      {/* 主导航 */}
      <nav className="flex flex-col gap-0.5 px-2">
        {PRIMARY.map(renderItem)}
      </nav>

      {/* 分割线 + 二级入口 */}
      <div className="mt-4 pt-4 border-t border-ds-border-2 mx-2" />
      <nav className="flex flex-col gap-0.5 px-2">
        {SECONDARY.map(renderItem)}
      </nav>

      {/* 底部用户区 */}
      <div className="mt-auto px-3 py-4 border-t border-ds-border-2">
        {user ? (
          <button
            onClick={() => navigate('/mypage')}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-sm hover:bg-bg-2"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-ui font-medium text-white text-[13px] shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.avatarUrl
                ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                : user.nickname.charAt(0).toUpperCase()
              }
            </div>
            <span className="font-ui text-[13px] font-medium text-ds-text truncate">
              {user.nickname}
            </span>
          </button>
        ) : (
          <p className="font-ui text-[12px] text-ds-text-4 px-2">
            未ログイン
          </p>
        )}
      </div>
    </aside>
  )
}
