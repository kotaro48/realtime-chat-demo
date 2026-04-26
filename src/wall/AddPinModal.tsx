import { useEffect, useRef, useState } from 'react'                // react: state & effects
import { X, Link, Loader2, AlertCircle } from 'lucide-react'       // lucide-react: icons
import { api } from '../services/api'                               // api: HTTP client
import type { WallPin, WallPinPreview } from '../types'             // types: shared types

interface Props {
  onClose: () => void
  onCreated: (pin: WallPin) => void
}

function isValidUrl(s: string) {
  try { new URL(s); return true } catch { return false }
}

export function AddPinModal({ onClose, onCreated }: Props) {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<WallPinPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [memo, setMemo] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // auto-preview when URL changes and is valid
  useEffect(() => {
    const trimmed = url.trim()
    if (!isValidUrl(trimmed)) {
      setPreview(null)
      setPreviewError('')
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchPreview(trimmed), 600)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [url])

  async function fetchPreview(trimmed: string) {
    setPreviewLoading(true)
    setPreviewError('')
    setPreview(null)
    try {
      const data = await api.get<WallPinPreview>(`/api/wall-pins/preview?url=${encodeURIComponent(trimmed)}`)
      setPreview(data)
    } catch {
      setPreviewError('プレビューを取得できませんでした（そのまま保存は可能です）')
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleSave() {
    const trimmed = url.trim()
    if (!trimmed || !isValidUrl(trimmed)) return
    setSaving(true)
    setSaveError('')
    try {
      const pin = await api.post<WallPin>('/api/wall-pins', {
        url: trimmed,
        memo: memo.trim() || undefined,
        isPublic,
      })
      onCreated(pin)
      onClose()
    } catch {
      setSaveError('保存に失敗しました。もう一度お試しください。')
    } finally {
      setSaving(false)
    }
  }

  const canSave = isValidUrl(url.trim()) && !saving

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-bg rounded-t-2xl sm:rounded-2xl shadow-xl p-5 space-y-4 z-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <h2 className="font-ui text-[16px] font-semibold text-ds-text">ピンを追加</h2>
          <button onClick={onClose} className="text-ds-text-4 hover:text-ds-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* url input */}
        <div className="flex items-center gap-2 bg-bg-2 border border-ds-border rounded-xl px-3 py-2">
          {previewLoading
            ? <Loader2 className="w-4 h-4 text-ds-text-4 shrink-0 animate-spin" />
            : <Link className="w-4 h-4 text-ds-text-4 shrink-0" />
          }
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="X または Instagram の URL を貼り付け"
            className="flex-1 bg-transparent font-ui text-[13px] text-ds-text placeholder:text-ds-text-4 outline-none"
            autoFocus
          />
          {url && (
            <button
              onClick={() => { setUrl(''); setPreview(null); setPreviewError('') }}
              className="text-ds-text-4 hover:text-ds-text transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {previewError && (
          <div className="flex items-start gap-2 text-ds-text-4">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p className="font-ui text-[12px]">{previewError}</p>
          </div>
        )}

        {/* preview card */}
        {preview && (
          <div className="border border-ds-border rounded-xl overflow-hidden">
            {preview.imageUrl && (
              <img src={preview.imageUrl} alt="" className="w-full max-h-[180px] object-cover" />
            )}
            <div className="p-3 space-y-1">
              {preview.title && (
                <p className="font-ui text-[13px] font-semibold text-ds-text line-clamp-2">{preview.title}</p>
              )}
              {preview.description && (
                <p className="font-ui text-[12px] text-ds-text-3 line-clamp-2">{preview.description}</p>
              )}
              {(preview.siteName || preview.authorName) && (
                <p className="font-ui text-[11px] text-ds-text-4">
                  {preview.siteName ?? ''}{preview.authorName ? ` · ${preview.authorName}` : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* memo */}
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="メモを追加（任意）"
          rows={2}
          className="w-full bg-bg-2 border border-ds-border rounded-xl px-3 py-2 font-ui text-[13px] text-ds-text placeholder:text-ds-text-4 outline-none resize-none"
        />

        {/* public toggle */}
        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic(v => !v)}
            className={`w-10 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-ds-text' : 'bg-bg-3'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-bg rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
          <span className="font-ui text-[13px] text-ds-text-2">公開する</span>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <p className="font-ui text-[12px]">{saveError}</p>
          </div>
        )}

        {/* save button */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-3 bg-ds-text text-bg font-ui text-[14px] font-semibold rounded-xl disabled:opacity-40 transition-opacity"
        >
          {saving ? '保存中...' : '壁に追加'}
        </button>
      </div>
    </div>
  )
}
