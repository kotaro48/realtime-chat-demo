// 全局共享类型定义
// 所有组件从这里 import，不得在组件内重复定义

// ── 用户 ────────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  nickname: string
  avatarColor: string
  avatarUrl?: string | null
}

// ── 板块 ────────────────────────────────────────────────
export interface Board {
  id: string
  slug: string
  name: string
  description: string | null
  _count: { threads: number }
}

// ── 帖子列表中的 Thread ──────────────────────────────────
export interface Thread {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  board: { slug: string; name: string }
  author: { nickname: string; avatarUrl: string | null; avatarColor: string }
  _count: { posts: number }
  score?: number
}

// ── 帖子详情中的 Post ────────────────────────────────────
export interface Post {
  id: string
  content: string
  createdAt: string
  deletedAt: string | null
  author: { nickname: string; avatarUrl: string | null; avatarColor: string }
  replyTo: {
    id: string
    author: { nickname: string }
    content: string
    deletedAt: string | null
  } | null
}

// ── 书签 ─────────────────────────────────────────────────
export interface BookmarkedThread {
  bookmarkedAt: string
  thread: {
    id: string
    title: string
    updatedAt: string
    board: { slug: string; name: string }
    author: { nickname: string; avatarColor: string }
    postCount: number
  }
}

// ── 官方日历事件 ──────────────────────────────────────────
export interface OfficialEvent {
  id: string
  title: string
  date: string
  endDate: string | null
  category: string
  parentCategory: string | null
  cssClass: string | null
  articleImage: string | null
}

// ── 聊天室 ───────────────────────────────────────────────
export interface ChatAuthor {
  id: string
  nickname: string
  avatarColor: string
}

export interface ReactionGroup {
  emoji: string
  count: number
  userIds: string[]
}

export interface QuotedMessage {
  id: string
  content: string
  author: ChatAuthor
}

export interface ChatMessage {
  id: string
  content: string
  createdAt: string
  author: ChatAuthor
  quotedMessage: QuotedMessage | null
  reactions: ReactionGroup[]
}

export interface RoomInfo {
  id: string
  name: string
  onlineCount: number
}

// ── 笔记墙 ────────────────────────────────────────────────
export interface WallPin {
  id: string
  url: string
  platform: 'twitter' | 'instagram' | 'other'
  title: string | null
  description: string | null
  imageUrl: string | null
  authorName: string | null
  authorAvatar: string | null
  siteName: string | null
  memo: string | null
  isPublic: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface WallPinPreview {
  title: string | null
  description: string | null
  imageUrl: string | null
  authorName: string | null
  authorAvatar: string | null
  siteName: string | null
}
