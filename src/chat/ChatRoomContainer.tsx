import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'  // socket.io-client: WebSocket 客户端
import { useNavigate } from 'react-router-dom'       // react-router-dom: 路由跳转
import { getUser, getToken } from '../lib/auth'       // auth: 读取登录状态和 JWT
import type { ChatMessage, ChatAuthor, QuotedMessage, ReactionGroup, RoomInfo } from './types'
import { ChatHeader } from './components/ChatHeader'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'

const ROOM_ID   = 'akb48-lobby'
const ROOM_NAME = 'AKB48 チャット'
// 生产环境直连 Railway 后端（Vercel rewrites 不支持 WebSocket 升级）
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin

export function ChatRoomContainer() {
  const navigate = useNavigate()
  const [room,      setRoom]      = useState<RoomInfo>({ id: ROOM_ID, name: ROOM_NAME, onlineCount: 0 })
  const [messages,  setMessages]  = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const [replyTo,   setReplyTo]   = useState<QuotedMessage | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const authUser = getUser()
  const currentUser: ChatAuthor | null = authUser
    ? { id: authUser.id, nickname: authUser.nickname, avatarColor: authUser.avatarColor }
    : null

  useEffect(() => {
    if (!currentUser) return

    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ['websocket'],
      auth: { token: getToken() },
    })
    socketRef.current = socket

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('chat:history', (history: ChatMessage[]) => setMessages(history))

    socket.on('chat:message', (incoming: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === incoming.id)) return prev
        return [...prev, incoming]
      })
    })

    // reactions 更新：找到对应消息替换 reactions 字段
    socket.on('chat:reactions', ({ messageId, reactions }: { messageId: string; reactions: ReactionGroup[] }) => {
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, reactions } : m)
      )
    })

    socket.on('room:onlineCount', ({ roomId, onlineCount }: { roomId: string; onlineCount: number }) => {
      if (roomId === ROOM_ID) setRoom(prev => ({ ...prev, onlineCount }))
    })

    socket.emit('room:join', { roomId: ROOM_ID })

    return () => { socket.disconnect(); socketRef.current = null }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = (text: string, replyToId?: string) => {
    if (!socketRef.current || !connected) return
    socketRef.current.emit('chat:send', { roomId: ROOM_ID, content: text, replyToId })
    setReplyTo(null)
  }

  const handleReact = (messageId: string, emoji: string) => {
    if (!socketRef.current || !connected) return
    socketRef.current.emit('chat:react', { roomId: ROOM_ID, messageId, emoji })
  }

  const handleQuote = (message: ChatMessage) => {
    setReplyTo({
      id:      message.id,
      content: message.content,
      author:  { nickname: message.author.nickname },
    })
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader room={room} onBack={() => navigate('/')} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <p className="font-ui text-[14px] text-ds-text-2 text-center">
            チャットに参加するにはログインが必要です
          </p>
          <button
            onClick={() => navigate('/')}
            className="font-ui text-[13px] font-medium text-white bg-ds-accent hover:bg-ds-accent-2 rounded-sm px-4 h-9 transition-colors"
          >
            ログイン
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader room={room} onBack={() => navigate('/')} />
      <MessageList
        messages={messages}
        currentUser={currentUser}
        onQuote={handleQuote}
        onReact={handleReact}
      />
      <ChatInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        disabled={!connected}
      />
      {/* BottomTabBar 占位：防止输入框被固定底部导航遮挡 */}
      <div className="h-[52px] shrink-0" />
    </div>
  )
}
