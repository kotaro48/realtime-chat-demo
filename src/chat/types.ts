export interface ChatAuthor {
  id: string
  nickname: string
  avatarColor: string
}

export interface ReactionGroup {
  emoji: string
  count: number
  userIds: string[]  // 用于判断当前用户是否已点
}

export interface QuotedMessage {
  id: string
  content: string
  author: { nickname: string }
}

export interface ChatMessage {
  id: string
  content: string
  createdAt: string
  author: ChatAuthor
  replyTo: QuotedMessage | null
  reactions: ReactionGroup[]
}

export interface RoomInfo {
  id: string
  name: string
  onlineCount: number
}
