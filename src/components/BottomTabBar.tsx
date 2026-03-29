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
]

export function BottomTabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
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
              fill="none"
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
    </nav>
  )
}
