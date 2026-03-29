import { useRef } from 'react'
import type { ChatMessage, ChatAuthor } from '../types'
import { MessageOptions } from './MessageOptions'
import { useState } from 'react'

interface Props {
  message: ChatMessage
  currentUser: ChatAuthor
  onQuote: (message: ChatMessage) => void
  onReact: (messageId: string, emoji: string) => void
}

function timeStr(iso: string) {
  return new Date(iso).toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo',
  })
}

function Avatar({ user, size = 28 }: { user: ChatAuthor; size?: number }) {
  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center font-ui font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: user.avatarColor, fontSize: size * 0.36 }}
    >
      {user.nickname.slice(0, 2)}
    </div>
  )
}

// 引用ブロック（気泡の上に表示）
function QuoteBlock({ content, nickname, isMine }: { content: string; nickname: string; isMine: boolean }) {
  return (
    <div className={`flex items-start gap-1.5 mb-1 px-2 py-1.5 rounded-sm border-l-2 ${
      isMine ? 'border-bg/40 bg-bg/10' : 'border-ds-accent/40 bg-bg-3'
    }`}>
      <div className="min-w-0">
        <p className={`font-ui text-[10px] font-medium mb-0.5 ${isMine ? 'text-bg/70' : 'text-ds-accent'}`}>
          {nickname}
        </p>
        <p className={`font-jp text-[11px] line-clamp-1 ${isMine ? 'text-bg/60' : 'text-ds-text-3'}`}>
          {content}
        </p>
      </div>
    </div>
  )
}

// リアクション集計表示
function ReactionBar({ reactions, currentUserId, onReact }: {
  reactions: ChatMessage['reactions']
  currentUserId: string
  onReact: (emoji: string) => void
}) {
  if (reactions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map(r => {
        const mine = r.userIds.includes(currentUserId)
        return (
          <button
            key={r.emoji}
            onClick={() => onReact(r.emoji)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[11px] transition-colors ${
              mine
                ? 'bg-ds-accent-bg border-ds-accent/30 text-ds-accent'
                : 'bg-bg-2 border-ds-border text-ds-text-3 hover:bg-bg-3'
            }`}
          >
            <span>{r.emoji}</span>
            <span className="font-mono">{r.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export function MessageBubble({ message, currentUser, onQuote, onReact }: Props) {
  const isMine = message.author.id === currentUser.id
  const [optionsPos, setOptionsPos] = useState<{ x: number; y: number } | null>(null)

  const touchTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const showOptions = (x: number, y: number) => setOptionsPos({ x, y })

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartPos.current = { x: t.clientX, y: t.clientY }
    touchTimer.current = setTimeout(() => showOptions(t.clientX, t.clientY), 500)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0]
    const dx = Math.abs(t.clientX - touchStartPos.current.x)
    const dy = Math.abs(t.clientY - touchStartPos.current.y)
    if (dx > 10 || dy > 10) {
      if (touchTimer.current) clearTimeout(touchTimer.current)
    }
  }

  const onTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
  }

  // デスクトップ：右クリックで表示
  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    showOptions(e.clientX, e.clientY)
  }

  if (isMine) {
    return (
      <>
        <div
          className="flex justify-end items-end gap-2 mb-3 chat-message-enter select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onContextMenu={onContextMenu}
        >
          <div className="flex flex-col items-end max-w-[72%]">
            <div className="bg-ds-text text-bg px-3 py-2 rounded-sm rounded-br-none">
              {message.replyTo && (
                <QuoteBlock
                  content={message.replyTo.content}
                  nickname={message.replyTo.author.nickname}
                  isMine
                />
              )}
              <p className="text-[14px] font-jp leading-relaxed break-words">{message.content}</p>
            </div>
            <ReactionBar
              reactions={message.reactions}
              currentUserId={currentUser.id}
              onReact={emoji => onReact(message.id, emoji)}
            />
            <span className="font-mono text-[10px] text-ds-text-4 mt-0.5">{timeStr(message.createdAt)}</span>
          </div>
          <Avatar user={currentUser} />
        </div>

        {optionsPos && (
          <MessageOptions
            message={message}
            currentUserId={currentUser.id}
            position={optionsPos}
            onReact={emoji => onReact(message.id, emoji)}
            onQuote={() => onQuote(message)}
            onClose={() => setOptionsPos(null)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div
        className="flex items-end gap-2 mb-3 chat-message-enter select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onContextMenu={onContextMenu}
      >
        <Avatar user={message.author} />
        <div className="flex flex-col items-start max-w-[72%]">
          <span className="font-ui text-[11px] text-ds-text-3 mb-0.5 px-0.5">{message.author.nickname}</span>
          <div className="bg-bg-2 text-ds-text px-3 py-2 rounded-sm rounded-bl-none border border-ds-border-2">
            {message.replyTo && (
              <QuoteBlock
                content={message.replyTo.content}
                nickname={message.replyTo.author.nickname}
                isMine={false}
              />
            )}
            <p className="text-[14px] font-jp leading-relaxed break-words">{message.content}</p>
          </div>
          <ReactionBar
            reactions={message.reactions}
            currentUserId={currentUser.id}
            onReact={emoji => onReact(message.id, emoji)}
          />
          <span className="font-mono text-[10px] text-ds-text-4 mt-0.5">{timeStr(message.createdAt)}</span>
        </div>
      </div>

      {optionsPos && (
        <MessageOptions
          message={message}
          currentUserId={currentUser.id}
          position={optionsPos}
          onReact={emoji => onReact(message.id, emoji)}
          onQuote={() => onQuote(message)}
          onClose={() => setOptionsPos(null)}
        />
      )}
    </>
  )
}
