// 认证工具函数 — 从 localStorage 读写 JWT 和用户信息
// AuthUser 类型统一定义在 src/types/index.ts，此处重新导出保持兼容

export type { AuthUser } from '../types'
import type { AuthUser } from '../types'

export function getToken(): string | null {
  return localStorage.getItem('akb48_token')
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('akb48_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// authHeaders 保留供 AuthModal 直接 fetch 使用
// 其他地方请改用 api.ts（自动附加 Authorization）
export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
