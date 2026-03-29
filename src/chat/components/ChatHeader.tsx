import type { RoomInfo } from '../types'

interface Props {
  room: RoomInfo
  onBack?: () => void
}

export function ChatHeader({ room, onBack }: Props) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-4 h-[52px] border-b border-ds-border-2 bg-bg">
      {onBack && (
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center text-ds-text-3 hover:bg-bg-2 rounded-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-ui text-[14.5px] font-medium text-ds-text truncate leading-tight">
          {room.name}
        </p>
      </div>

      {/* オンライン人数 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[11px] text-ds-text-3">
          {room.onlineCount}人
        </span>
      </div>
    </div>
  )
}
