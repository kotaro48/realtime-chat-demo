import { useState } from 'react'                                // react: state
import { Globe, Twitter, Instagram, Pencil, Trash2, Lock, Unlock } from 'lucide-react' // lucide-react: icons
import type { WallPin } from '../types'                           // types: shared types

interface Props {
  pin: WallPin
  onEdit: (pin: WallPin) => void
  onDelete: (id: string) => void
}

function PlatformIcon({ platform }: { platform: WallPin['platform'] }) {
  if (platform === 'twitter') return <Twitter className="w-3 h-3" />
  if (platform === 'instagram') return <Instagram className="w-3 h-3" />
  return <Globe className="w-3 h-3" />
}

function platformColor(platform: WallPin['platform']) {
  if (platform === 'twitter') return 'text-sky-500'
  if (platform === 'instagram') return 'text-pink-500'
  return 'text-ds-text-4'
}

export function PinCard({ pin, onEdit, onDelete }: Props) {
  const [imgError, setImgError] = useState(false)

  const displayTitle = pin.title ?? pin.url
  const domain = (() => {
    try { return new URL(pin.url).hostname.replace('www.', '') }
    catch { return pin.url }
  })()

  return (
    <div className="bg-bg border border-ds-border rounded-xl overflow-hidden mb-3 break-inside-avoid group">
      {/* thumbnail */}
      {pin.imageUrl && !imgError && (
        <a href={pin.url} target="_blank" rel="noopener noreferrer">
          <img
            src={pin.imageUrl}
            alt={pin.title ?? ''}
            onError={() => setImgError(true)}
            className="w-full object-cover max-h-[240px]"
          />
        </a>
      )}

      <div className="p-3 space-y-2">
        {/* source row */}
        <div className={`flex items-center gap-1.5 text-[11px] font-ui ${platformColor(pin.platform)}`}>
          <PlatformIcon platform={pin.platform} />
          <span>{pin.siteName ?? domain}</span>
          {pin.authorName && <span className="text-ds-text-4">· {pin.authorName}</span>}
          <span className="ml-auto">
            {pin.isPublic
              ? <Unlock className="w-3 h-3 text-ds-text-4" />
              : <Lock className="w-3 h-3 text-ds-text-4" />
            }
          </span>
        </div>

        {/* title */}
        <a
          href={pin.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-ui text-[13px] font-semibold text-ds-text leading-snug line-clamp-2 hover:underline"
        >
          {displayTitle}
        </a>

        {/* description */}
        {pin.description && (
          <p className="font-ui text-[12px] text-ds-text-3 leading-relaxed line-clamp-3">
            {pin.description}
          </p>
        )}

        {/* memo */}
        {pin.memo && (
          <div className="bg-bg-2 rounded-lg px-3 py-2">
            <p className="font-ui text-[12px] text-ds-text-2 whitespace-pre-wrap leading-relaxed">
              {pin.memo}
            </p>
          </div>
        )}

        {/* actions */}
        <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(pin)}
            className="flex items-center gap-1 text-[11px] font-ui text-ds-text-4 hover:text-ds-text transition-colors"
          >
            <Pencil className="w-3 h-3" />
            <span>編集</span>
          </button>
          <button
            onClick={() => onDelete(pin.id)}
            className="flex items-center gap-1 text-[11px] font-ui text-ds-text-4 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>削除</span>
          </button>
        </div>
      </div>
    </div>
  )
}
