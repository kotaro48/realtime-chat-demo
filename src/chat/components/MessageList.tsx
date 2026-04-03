import { useEffect, useRef, useState } from 'react'
import type { ChatMessage, ChatAuthor } from '../types'
import { MessageBubble } from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  currentUser: ChatAuthor
  onQuote: (message: ChatMessage) => void
  onReact: (messageId: string, emoji: string) => void
}

export function MessageList({ messages, currentUser, onQuote, onReact }: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const [showNewTip, setShowNewTip] = useState(false)
  const isNearBottomRef = useRef(true)
  const prevLastIdRef = useRef<string | undefined>(messages[messages.length - 1]?.id)

  const scrollToBottom = () => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
    isNearBottomRef.current = true
    setShowNewTip(false)
  }

  const updateNearBottom = () => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    const near = scrollHeight - (scrollTop + clientHeight) <= 80
    isNearBottomRef.current = near
    if (near) setShowNewTip(false)
  }

  useEffect(() => {
    const lastId = messages[messages.length - 1]?.id
    const isNew = Boolean(lastId) && lastId !== prevLastIdRef.current
    prevLastIdRef.current = lastId
    if (!isNew || !listRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    const near = scrollHeight - (scrollTop + clientHeight) <= 80
    isNearBottomRef.current = near
    if (near) scrollToBottom()
    else setShowNewTip(true)
  }, [messages])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    updateNearBottom()
    el.addEventListener('scroll', updateNearBottom)
    return () => el.removeEventListener('scroll', updateNearBottom)
  }, [])

  useEffect(() => { scrollToBottom() }, [])

  return (
    <div className="relative flex-1 min-h-0">
      <div ref={listRef} className="h-full min-h-0 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-center font-ui text-[13px] text-ds-text-4 py-8">
            まだメッセージがありません
          </p>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUser={currentUser}
            onQuote={onQuote}
            onReact={onReact}
          />
        ))}
      </div>

      {showNewTip && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 h-7 bg-primary text-primary-foreground font-ui text-[12px] font-medium rounded-full shadow-sm hover:bg-primary/90 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
          新着
        </button>
      )}
    </div>
  )
}
