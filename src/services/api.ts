// 统一 HTTP 请求封装
// 功能：自动附加 JWT、统一处理 401 过期、统一错误格式

import { API_BASE } from '../config'
import { getToken } from '../lib/auth'

// token 过期时派发此事件，AuthContext 监听后自动登出
const AUTH_EXPIRED_EVENT = 'auth:expired'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // token 过期：清除本地登录态，通知全局 AuthContext 登出
    localStorage.removeItem('akb48_token')
    localStorage.removeItem('akb48_user')
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    throw new Error('LOGIN_REQUIRED')
  }

  if (!res.ok) {
    throw new Error(`API_ERROR_${res.status}`)
  }

  // 204 No Content 不解析 JSON
  if (res.status === 204) return undefined as T

  return res.json()
}

export const api = {
  get: <T>(path: string) =>
    request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
