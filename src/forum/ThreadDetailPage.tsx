import { useEffect, useRef, useState, useCallback } from 'react'
import { ThumbsDown, Heart } from 'lucide-react'  // lucide-react: 倒喝彩图标、收藏心形图标
import { useParams, useNavigate } from 'react-router-dom'  // react-router-dom: URL参数和跳转
import { Sidebar } from '../components/Sidebar'  // Sidebar: 左滑侧边栏，含全局导航
import { getUser, authHeaders, type AuthUser } from '../lib/auth'  // auth: 读取登录态和 JWT
import { AuthModal } from '../components/AuthModal'  // AuthModal: 登录/注册弹窗
import { RightSidebar } from '../components/RightSidebar'  // RightSidebar: 桌面端右侧栏
import { PullToRefresh } from '../components/PullToRefresh'  // PullToRefresh: 移动端下拉刷新

interface Post {
  id: string
  content: string
  createdAt: string
  deletedAt: string | null
  author: { nickname: string; avatarUrl: string | null; avatarColor: string }
  replyTo: { id: string; author: { nickname: string }; content: string; deletedAt: string | null } | null
}

// 递归构建引用链：从最远祖先到直接父楼，返回有序数组
function buildQuoteChain(replyToId: string, allPosts: Post[]): Post[] {
  const parent = allPosts.find(p => p.id === replyToId)
  if (!parent) return []
  if (parent.replyTo) {
    return [...buildQuoteChain(parent.replyTo.id, allPosts), parent]
  }
  return [parent]
}

// 多层引用块：逐层缩进，超过 MAX_VISIBLE 层折叠
const MAX_VISIBLE = 2

function QuoteChain({ replyToId, allPosts }: { replyToId: string; allPosts: Post[] }) {
  const [expanded, setExpanded] = useState(false)
  const chain = buildQuoteChain(replyToId, allPosts)

  const hidden = chain.length > MAX_VISIBLE && !expanded ? chain.length - MAX_VISIBLE : 0
  const visible = hidden > 0 ? chain.slice(hidden) : chain

  return (
    <div className="mb-2 space-y-1">
      {hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="font-mono text-[10px] text-ds-text-4 hover:text-ds-text tracking-wide uppercase flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
          </svg>
          {hidden} 件の引用を展開
        </button>
      )}
      {visible.map((p, i) => {
        const indent = (chain.length - visible.length + i) * 12
        return (
          <div
            key={p.id}
            style={{ marginLeft: indent }}
            className="pl-3 border-l-2 border-ds-border text-[13px] text-ds-text-3 leading-snug"
          >
            <span className="font-medium text-ds-text-2">{p.author.nickname}：</span>
            {p.deletedAt ? '（削除済み）' : (p.content.length > 80 ? p.content.slice(0, 80) + '…' : p.content)}
          </div>
        )
      })}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="font-mono text-[10px] text-ds-text-4 hover:text-ds-text tracking-wide uppercase flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>
          </svg>
          折叠
        </button>
      )}
    </div>
  )
}

// 检测图片 URL
function isImageUrl(text: string): boolean {
  return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(text.trim())
}

// 帖子正文：逐行扫描，图片URL渲染为img
function PostContent({ content }: { content: string }) {
  return (
    <div className="text-[15px] leading-relaxed text-ds-text space-y-1">
      {content.split('\n').map((line, i) =>
        isImageUrl(line) ? (
          <img
            key={i}
            src={line.trim()}
            alt=""
            className="max-w-xs rounded-sm border border-ds-border-2"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <p key={i}>{line}</p>
        )
      )}
    </div>
  )
}

// Guest 名：初次访问自动生成，存 localStorage
function getGuestName(): string {
  const key = 'akb48_guest'
  let name = localStorage.getItem(key)
  if (!name) {
    name = 'ゲスト#' + Math.random().toString(36).slice(2, 6).toUpperCase()
    localStorage.setItem(key, name)
  }
  return name
}

interface Reactions { likes: string[]; dislikes: string[] }

function loadReactions(postId: string): Reactions {
  try {
    const raw = localStorage.getItem(`akb48_r_${postId}`)
    return raw ? JSON.parse(raw) : { likes: [], dislikes: [] }
  } catch { return { likes: [], dislikes: [] } }
}

function saveReactions(postId: string, r: Reactions) {
  localStorage.setItem(`akb48_r_${postId}`, JSON.stringify(r))
}

// 点赞 / 倒喝彩行
function ReactionBar({ postId, onReply, isOP }: { postId: string; onReply: () => void; isOP?: boolean }) {
  const guest = getGuestName()
  const [r, setR] = useState<Reactions>(() => loadReactions(postId))
  const [showLikers, setShowLikers] = useState(false)
  const [pop, setPop] = useState<'like' | 'dislike' | null>(null)

  const liked    = r.likes.includes(guest)
  const disliked = r.dislikes.includes(guest)

  const react = (type: 'like' | 'dislike') => {
    const next: Reactions = { likes: [...r.likes], dislikes: [...r.dislikes] }
    // 先从对面移除
    if (type === 'like')    next.dislikes = next.dislikes.filter(n => n !== guest)
    else                    next.likes    = next.likes.filter(n => n !== guest)
    // 切换自身
    const arr = type === 'like' ? next.likes : next.dislikes
    const idx = arr.indexOf(guest)
    if (idx === -1) { arr.push(guest); setPop(type); setTimeout(() => setPop(null), 400) }
    else            arr.splice(idx, 1)
    saveReactions(postId, next)
    setR(next)
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-0.5">
      {/* 引用 — OP（1レス目）には表示しない */}
      {!isOP && (
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-sm font-ui text-[12px] text-ds-text-4 hover:text-ds-text hover:bg-bg-2"
          onClick={onReply}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"/>
          </svg>
          引用
        </button>
      )}

      {/* 点赞 */}
      <button
        onClick={() => react('like')}
        className={`flex items-center gap-1 px-2 py-1 rounded-sm font-ui text-[12px] transition-colors ${liked ? 'text-ds-accent bg-ds-accent-bg' : 'text-ds-text-4 hover:bg-bg-2 hover:text-ds-text'} ${pop === 'like' ? 'reaction-pop' : ''}`}
      >
        <svg className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>
        </svg>
        {r.likes.length > 0 && <span>{r.likes.length}</span>}
      </button>

      {/* 倒喝彩 */}
      <button
        onClick={() => react('dislike')}
        className={`flex items-center gap-1 px-2 py-1 rounded-sm font-ui text-[12px] transition-colors ${disliked ? 'text-ds-text bg-bg-3' : 'text-ds-text-4 hover:bg-bg-2 hover:text-ds-text'} ${pop === 'dislike' ? 'reaction-pop' : ''}`}
      >
        <ThumbsDown className="w-3.5 h-3.5" strokeWidth={1.5} fill={disliked ? 'currentColor' : 'none'} />
        {r.dislikes.length > 0 && <span>{r.dislikes.length}</span>}
      </button>

      {/* 查看点赞用户 */}
      {r.likes.length > 0 && (
        <button
          onClick={() => setShowLikers(!showLikers)}
          className="flex items-center gap-0.5 px-1.5 py-1 font-mono text-[10px] text-ds-text-4 hover:text-ds-text"
        >
          <svg className={`w-2.5 h-2.5 transition-transform duration-150 ${showLikers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
          </svg>
          {r.likes.length}人
        </button>
      )}

      {/* 点赞用户名列表（折叠展开） */}
      {showLikers && (
        <div className="w-full flex flex-wrap gap-1 mt-1 pl-1">
          {r.likes.map(name => (
            <span key={name} className="font-mono text-[10px] text-ds-text-4 bg-bg-2 border border-ds-border-2 px-1.5 py-0.5 rounded-sm">
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// 时间戳：MM/DD HH:mm
function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// 头像首字
function avatarInitial(nickname: string): string {
  return nickname.charAt(0).toUpperCase()
}

export function ThreadDetailPage() {
  const { slug, threadId } = useParams<{ slug: string; threadId: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<Post | null>(null)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(getUser)
  const [authOpen, setAuthOpen] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // loadPosts：只刷新帖子列表，供下拉刷新复用
  const loadPosts = useCallback(async () => {
    const data = await fetch(`/api/threads/${threadId}/posts`).then(r => r.json())
    setPosts(data)
  }, [threadId])

  // 初始加载：同时拉取帖子、版块标题、收藏状态
  useEffect(() => {
    const requests: Promise<unknown>[] = [
      fetch(`/api/boards/${slug}/threads`).then(r => r.json()),
      fetch(`/api/threads/${threadId}/posts`).then(r => r.json()),
    ]
    // 已登录才拉收藏列表
    if (getUser()) {
      requests.push(fetch('/api/bookmarks', { headers: authHeaders() }).then(r => r.json()))
    }
    Promise.all(requests).then(([threads, postsData, bookmarks]) => {
      const thread = (threads as { id: string; title: string }[]).find(t => t.id === threadId)
      if (thread) setTitle(thread.title)
      setPosts(postsData as Post[])
      if (bookmarks) {
        const ids = new Set((bookmarks as { thread: { id: string } }[]).map(b => b.thread.id))
        setIsBookmarked(ids.has(threadId!))
      }
      setLoading(false)
    })
  }, [slug, threadId])

  const toggleBookmark = () => {
    if (!user) { setAuthOpen(true); return }
    const method = isBookmarked ? 'DELETE' : 'POST'
    setIsBookmarked(!isBookmarked)  // 乐观更新
    fetch(`/api/bookmarks/${threadId}`, { method, headers: authHeaders() })
      .catch(() => setIsBookmarked(isBookmarked))  // 失败回滚
  }

  const handleSubmit = () => {
    if (!input.trim() || submitting || !user) return
    setSubmitting(true)
    fetch(`/api/threads/${threadId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ content: input.trim(), replyToId: replyTo?.id }),
    })
      .then(r => r.json())
      .then(newPost => {
        setPosts(prev => [...prev, newPost])
        setInput('')
        setReplyTo(null)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })
      .finally(() => setSubmitting(false))
  }

  return (
    // h-screen + flex-col: header固定 + main滚动 + footer固定
    <div className="h-screen bg-page-bg flex flex-col">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header — 全宽 */}
      <header className="shrink-0 bg-bg border-b border-ds-border-2 z-50">
        <div className="max-w-[1060px] mx-auto h-[52px] flex items-center gap-3 px-5">
          <button
            onClick={() => navigate(`/board/${slug}`)}
            className="w-9 h-9 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
            </svg>
          </button>
          <h1 className="font-ui text-[14px] font-medium text-ds-text flex-1 truncate leading-tight">
            {title || '…'}
          </h1>
          <span className="font-mono text-[11px] text-ds-text-4 shrink-0">
            {posts.length} レス
          </span>
          {/* 収藏按钮：已收藏时 accent 填充，未收藏时灰色描边 */}
          <button
            onClick={toggleBookmark}
            className="w-9 h-9 flex items-center justify-center hover:bg-bg-2 rounded-sm shrink-0"
            aria-label={isBookmarked ? '収藏を解除' : '収藏する'}
          >
            <Heart
              className="w-5 h-5"
              strokeWidth={1.5}
              color={isBookmarked ? 'var(--color-ds-accent)' : 'var(--color-ds-text-4)'}
              fill={isBookmarked ? 'var(--color-ds-accent)' : 'none'}
            />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5"/>
            </svg>
          </button>
        </div>
      </header>

      {/* 内容区 + 右侧栏 */}
      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* PullToRefresh 替换原来的 <main>，内部自带可滚动容器 */}
        <PullToRefresh onRefresh={loadPosts} className="flex-1">
        <div className="max-w-[860px] mx-auto bg-bg min-h-full px-5 py-4 space-y-0">
          {loading ? (
            <p className="text-[13.5px] text-ds-text-3 py-8">読み込み中…</p>
          ) : (
            posts.map((post, index) => {
              const isOP = index === 0
              return (
                <div
                  key={post.id}
                  className={`flex gap-3 border-b border-ds-border-2 last:border-b-0 post-enter ${
                    isOP ? 'py-5 px-1 bg-bg-2 -mx-5 px-5' : 'py-4'
                  }`}
                >
                  {/* 头像 */}
                  <div
                    className={`rounded-full shrink-0 flex items-center justify-center font-ui font-medium text-white border border-ds-border-2 ${
                      isOP ? 'w-10 h-10 text-[15px]' : 'w-9 h-9 text-[14px]'
                    }`}
                    style={{ backgroundColor: post.author.avatarColor }}
                  >
                    {post.author.avatarUrl
                      ? <img src={post.author.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                      : avatarInitial(post.author.nickname)
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 作者行 */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`font-ui font-medium text-ds-text-2 ${isOP ? 'text-[14px]' : 'text-[13px]'}`}>
                        {post.author.nickname}
                      </span>
                      {isOP ? (
                        <span className="font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5 border border-ds-border rounded-sm text-ds-text-4">
                          スレ主
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-ds-text-4">
                          ＃{index + 1}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-ds-text-4 ml-auto">
                        {formatTime(post.createdAt)}
                      </span>
                    </div>

                    {/* 多层引用链 */}
                    {post.replyTo && (
                      <QuoteChain replyToId={post.replyTo.id} allPosts={posts} />
                    )}

                    {/* 正文 */}
                    <div className={isOP ? 'text-[15.5px] leading-relaxed' : ''}>
                      <PostContent content={post.content} />
                    </div>

                    {/* 操作栏 */}
                    <ReactionBar postId={post.id} onReply={() => setReplyTo(post)} isOP={isOP} />
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>
        </PullToRefresh>

        {/* 右侧栏 — 仅桌面端 */}
        <aside className="hidden lg:block w-[220px] shrink-0 border-l border-ds-border-2 overflow-y-auto">
          <RightSidebar />
        </aside>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={me => { setUser(me); setAuthOpen(false) }}
      />

      {/* 底部回复框 — 全宽 */}
      <footer className="shrink-0 bg-bg border-t border-ds-border-2">
        <div className="max-w-[1060px] mx-auto px-5 py-3">
          {/* 引用预览 */}
          {replyTo && (
            <div className="flex items-center gap-2 mb-2">
              <span className="flex-1 font-ui text-[12px] text-ds-text-3 pl-2 border-l-2 border-ds-border truncate">
                {replyTo.author.nickname}：{replyTo.content.slice(0, 40)}
              </span>
              <button
                className="font-ui text-[11px] text-ds-text-4 hover:text-ds-text px-1.5 py-0.5 hover:bg-bg-2 rounded-sm shrink-0"
                onClick={() => setReplyTo(null)}
              >
                取消
              </button>
            </div>
          )}

          {user ? (
            <div className="flex gap-2">
              <textarea
                className="flex-1 resize-none rounded-sm border border-ds-border bg-bg-2 px-3 py-2 text-[15px] text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3 font-jp"
                rows={2}
                placeholder="返信を書く…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
                }}
              />
              <button
                className="font-ui text-[13px] font-medium text-white bg-ds-accent hover:bg-ds-accent-2 disabled:opacity-40 rounded-sm px-4 self-end h-10 shrink-0 flex items-center gap-1.5"
                onClick={handleSubmit}
                disabled={!input.trim() || submitting}
              >
                {submitting && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {submitting ? '送信中…' : '返信する'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="font-ui text-[13px] text-ds-text-3">
                返信するにはログインが必要です
              </span>
              <button
                className="font-ui text-[13px] font-medium text-white bg-ds-accent hover:bg-ds-accent-2 rounded-sm px-4 h-9 shrink-0"
                onClick={() => setAuthOpen(true)}
              >
                ログイン
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
