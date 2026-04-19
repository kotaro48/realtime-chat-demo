// 全局登录状态 Context
// 解决各页面各自读 localStorage 不同步的问题
// 监听 auth:expired 事件（api.ts 触发），自动登出用户

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getUser } from '../lib/auth'
import type { AuthUser } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  isLoggedIn: boolean
  // AuthModal 保存 token/user 到 localStorage 后，调用此函数同步 React 状态
  login: (me: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getUser())

  const logout = useCallback(() => {
    localStorage.removeItem('akb48_token')
    localStorage.removeItem('akb48_user')
    setUser(null)
  }, [])

  const login = useCallback((me: AuthUser) => {
    setUser(me)
  }, [])

  // 监听 token 过期事件（由 api.ts 的 401 处理器触发）
  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
