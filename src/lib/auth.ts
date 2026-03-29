// 认证工具函数 — 从 localStorage 读写 JWT 和用户信息

export interface AuthUser {
  id: string
  email: string
  nickname: string
  avatarColor: string
}

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

export function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
