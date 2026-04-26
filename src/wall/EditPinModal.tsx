import { useState } from 'react'                      // react: state
import { X } from 'lucide-react'                      // lucide-react: icons
import { api } from '../services/api'                 // api: HTTP client
import type { WallPin } from '../types'               // types: shared types

interface Props {
  pin: WallPin
  onClose: () => void
  onUpdated: (pin: WallPin) => void
}

export function EditPinModal({ pin, onClose, onUpdated }: Props) {
  const [memo, setMemo] = useState(pin.memo ?? '')
  const [isPublic, setIsPublic] = useState(pin.isPublic)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await api.patch<WallPin>(`/api/wall-pins/${pin.id}`, {
        memo: memo || undefined,
        isPublic,
      })
      onUpdated(updated)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-bg rounded-t-2xl sm:rounded-2xl shadow-xl p-5 space-y-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="font-ui text-[16px] font-semibold text-ds-text">ピンを編集</h2>
          <button onClick={onClose} className="text-ds-text-4 hover:text-ds-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="font-ui text-[12px] text-ds-text-4 truncate">{pin.url}</p>

        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="メモを追加（任意）"
          rows={3}
          className="w-full bg-bg-2 border border-ds-border rounded-xl px-3 py-2 font-ui text-[13px] text-ds-text placeholder:text-ds-text-4 outline-none resize-none"
          autoFocus
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIsPublic(v => !v)}
            className={`w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-ds-text' : 'bg-bg-3'} relative`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-bg rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="font-ui text-[13px] text-ds-text-2">公開する</span>
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-ds-text text-bg font-ui text-[14px] font-semibold rounded-xl disabled:opacity-40 transition-opacity"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
