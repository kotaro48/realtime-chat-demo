import { useEffect, useRef, useState } from 'react'
import type { AuthUser } from '../lib/auth'  // auth: 用户类型

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (user: AuthUser) => void
  defaultTab?: 'login' | 'register'
}

async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export function AuthModal({ open, onClose, onSuccess, defaultTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const firstRef = useRef<HTMLInputElement>(null)

  // 打开时重置状态并聚焦
  useEffect(() => {
    if (open) {
      setTab(defaultTab)
      setEmail('')
      setPassword('')
      setNickname('')
      setError('')
      setTimeout(() => firstRef.current?.focus(), 50)
    }
  }, [open, defaultTab])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register'
      const body = tab === 'login'
        ? { email, password }
        : { email, password, nickname }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message ?? 'エラーが発生しました')
        return
      }
      localStorage.setItem('akb48_token', data.accessToken)
      const me = await fetchMe(data.accessToken)
      localStorage.setItem('akb48_user', JSON.stringify(me))
      onSuccess(me)
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />

      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="relative w-[320px] bg-bg border border-ds-border rounded-md shadow-lg post-enter"
      >
        {/* Tab 切换 */}
        <div className="flex border-b border-ds-border-2">
          <button
            type="button"
            onClick={() => { setTab('login'); setError('') }}
            className={`flex-1 py-3 font-ui text-[13.5px] font-medium ${
              tab === 'login'
                ? 'text-ds-text border-b-2 border-ds-accent -mb-px'
                : 'text-ds-text-4 hover:text-ds-text-2'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError('') }}
            className={`flex-1 py-3 font-ui text-[13.5px] font-medium ${
              tab === 'register'
                ? 'text-ds-text border-b-2 border-ds-accent -mb-px'
                : 'text-ds-text-4 hover:text-ds-text-2'
            }`}
          >
            新規登録
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3">
          {tab === 'register' && (
            <input
              ref={tab === 'register' ? firstRef : undefined}
              type="text"
              placeholder="ニックネーム"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              required
              maxLength={30}
              className="w-full h-[38px] px-3 text-[14px] bg-bg-2 border border-ds-border rounded-sm text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3"
            />
          )}
          <input
            ref={tab === 'login' ? firstRef : undefined}
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full h-[38px] px-3 text-[14px] bg-bg-2 border border-ds-border rounded-sm text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3"
          />
          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-[38px] px-3 text-[14px] bg-bg-2 border border-ds-border rounded-sm text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3"
          />

          {error && <p className="text-[12.5px] text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[38px] font-ui text-[13.5px] font-medium text-white bg-ds-accent hover:bg-ds-accent-2 rounded-sm disabled:opacity-50 mt-1"
          >
            {loading ? '…' : tab === 'login' ? 'ログイン' : '登録する'}
          </button>

          {tab === 'login' && (
            <p className="font-ui text-[11px] text-ds-text-4 text-center">
              テスト: test@akb48.com / test1234
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
