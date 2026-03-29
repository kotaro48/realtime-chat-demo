import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types'

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡']

interface Props {
  message: ChatMessage
  currentUserId: string
  position: { x: number; y: number }  // 屏幕坐标
  onReact: (emoji: string) => void
  onQuote: () => void
  onClose: () => void
}

export function MessageOptions({ message, currentUserId, position, onReact, onQuote, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // 点击浮层外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [onClose])

  // 计算面板位置：避免超出屏幕边缘
  const panelW = 240
  const panelH = 100
  const left = Math.min(position.x - panelW / 2, window.innerWidth - panelW - 12)
  const clamped = Math.max(left, 12)
  const top = position.y - panelH - 12 < 0
    ? position.y + 20
    : position.y - panelH - 12

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        ref={panelRef}
        className="absolute bg-bg border border-ds-border rounded-lg shadow-lg overflow-hidden"
        style={{ left: clamped, top, width: panelW }}
      >
        {/* 表情反応行 */}
        <div className="flex items-center justify-around px-3 py-2.5 border-b border-ds-border-2">
          {EMOJIS.map(emoji => {
            const group = message.reactions.find(r => r.emoji === emoji)
            const hasReacted = group?.userIds.includes(currentUserId) ?? false
            return (
              <button
                key={emoji}
                onClick={() => { onReact(emoji); onClose() }}
                className={`flex flex-col items-center gap-0.5 w-8 h-8 rounded-sm transition-colors text-[18px] leading-none
                  ${hasReacted ? 'bg-ds-accent-bg' : 'hover:bg-bg-2'}`}
              >
                {emoji}
              </button>
            )
          })}
        </div>

        {/* 引用ボタン */}
        <button
          onClick={() => { onQuote(); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-bg-2 transition-colors text-left"
        >
          <svg className="w-4 h-4 text-ds-text-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          <span className="font-ui text-[13px] text-ds-text-2">引用して返信</span>
        </button>
      </div>
    </div>
  )
}
