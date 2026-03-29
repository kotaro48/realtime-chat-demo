import { useState, type KeyboardEvent } from 'react'
import type { QuotedMessage } from '../types'

interface Props {
  onSend: (text: string, replyToId?: string) => void
  replyTo: QuotedMessage | null
  onCancelReply: () => void
  disabled?: boolean
}

export function ChatInput({ onSend, replyTo, onCancelReply, disabled }: Props) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    const text = input.trim()
    if (!text || disabled) return
    onSend(text, replyTo?.id)
    setInput('')
  }

  return (
    <div className="shrink-0 border-t border-ds-border-2 bg-bg">
      {/* 引用プレビュー */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 pt-2.5 pb-1">
          <div className="flex-1 min-w-0 border-l-2 border-ds-accent pl-2">
            <p className="font-ui text-[10px] text-ds-accent font-medium">{replyTo.author.nickname}</p>
            <p className="font-jp text-[11px] text-ds-text-3 truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="w-6 h-6 flex items-center justify-center text-ds-text-4 hover:text-ds-text rounded-sm shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力… (Enter で送信)"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none px-3 py-2 bg-bg-2 border border-ds-border rounded-sm text-[14px] font-jp text-ds-text placeholder:text-ds-text-4 focus:outline-none focus:border-ds-text-3 min-h-[40px] max-h-[120px] disabled:opacity-40"
        />
        <button
          onClick={submit}
          disabled={!input.trim() || disabled}
          className="w-10 h-10 flex items-center justify-center bg-ds-accent text-white rounded-sm hover:bg-ds-accent-2 disabled:opacity-30 transition-colors shrink-0 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
