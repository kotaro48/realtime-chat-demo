import { useNavigate } from 'react-router-dom'  // react-router-dom: 路由跳转
import { getUser } from '../lib/auth'  // auth: 读取登录态

interface SidebarProps {
  open: boolean
  onClose: () => void
  onLogout?: () => void  // 可选：登出回调，让父组件同步 user 状态
}

export function Sidebar({ open, onClose, onLogout }: SidebarProps) {
  const navigate = useNavigate()
  const user = getUser()

  const nav = (path: string) => {
    navigate(path)
    onClose()
  }

  function handleLogout() {
    localStorage.removeItem('akb48_token')
    localStorage.removeItem('akb48_user')
    onLogout?.()
    onClose()
    navigate('/')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-[60] transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-bg border-r border-ds-border-2 z-[70] transition-transform duration-200 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-[52px] flex items-center justify-between px-5 border-b border-ds-border-2">
          <span className="font-ui text-[15px] font-semibold text-ds-text tracking-tight">
            Ota Kit
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="py-2">
          <button
            onClick={() => nav('/')}
            className="w-full flex items-center gap-3 px-5 py-3 font-ui text-[14px] font-medium text-ds-text hover:bg-bg-2 text-left"
          >
            <svg className="w-5 h-5 text-ds-text-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5"/>
            </svg>
            掲示板
          </button>

          <button
            disabled
            className="w-full flex items-center gap-3 px-5 py-3 font-ui text-[14px] font-medium text-ds-text-4 text-left opacity-60"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"/>
            </svg>
            チャット
            <span className="ml-auto font-mono text-[9px] text-ds-text-4 tracking-widest uppercase">近日公開</span>
          </button>

          <div className="my-2 mx-5 border-t border-ds-border-2" />

          <button
            onClick={() => nav('/mypage')}
            className="w-full flex items-center gap-3 px-5 py-3 font-ui text-[14px] font-medium text-ds-text hover:bg-bg-2 text-left"
          >
            <svg className="w-5 h-5 text-ds-text-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
            </svg>
            マイページ
          </button>
        </nav>

        {/* 底部用户区 */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-ds-border-2">
          {user ? (
            <div className="px-5 py-4 flex items-center gap-3">
              {/* 头像 */}
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-ui text-[13px] font-medium text-white"
                style={{ backgroundColor: user.avatarColor ?? '#94a3b8' }}
              >
                {user.nickname.charAt(0).toUpperCase()}
              </div>
              {/* 昵称 + 邮箱 */}
              <div className="flex-1 min-w-0">
                <p className="font-ui text-[13px] font-medium text-ds-text truncate">{user.nickname}</p>
                <p className="font-ui text-[11px] text-ds-text-4 truncate">{user.email}</p>
              </div>
              {/* 登出按钮 */}
              <button
                onClick={handleLogout}
                className="w-8 h-8 flex items-center justify-center text-ds-text-4 hover:text-ds-text hover:bg-bg-2 rounded-sm shrink-0"
                title="ログアウト"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="px-5 py-4">
              <p className="font-ui text-[12px] text-ds-text-4 mb-2">ログインしていません</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
