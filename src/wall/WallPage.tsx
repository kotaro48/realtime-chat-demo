import { useEffect, useRef, useState } from 'react'               // react: state & effects
import { Plus } from 'lucide-react'                                // lucide-react: FAB icon
import { useAuth } from '../context/AuthContext'                   // AuthContext: login state
import { api } from '../services/api'                             // api: HTTP client
import { PageWrapper } from '../components/PageWrapper'           // PageWrapper: page animation wrapper
import { PinCard } from './PinCard'                               // PinCard: individual pin card
import { AddPinModal } from './AddPinModal'                       // AddPinModal: add new pin
import { EditPinModal } from './EditPinModal'                     // EditPinModal: edit existing pin
import type { WallPin } from '../types'                           // types: shared types

export function WallPage() {
  const { user } = useAuth()
  const [pins, setPins] = useState<WallPin[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editingPin, setEditingPin] = useState<WallPin | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const largeTitleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = largeTitleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get<WallPin[]>('/api/wall-pins')
      .then(setPins)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [user])

  function handleCreated(pin: WallPin) {
    setPins(prev => [pin, ...prev])
  }

  function handleUpdated(pin: WallPin) {
    setPins(prev => prev.map(p => p.id === pin.id ? pin : p))
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
  }

  async function confirmDelete() {
    if (!deletingId) return
    try {
      await api.delete(`/api/wall-pins/${deletingId}`)
      setPins(prev => prev.filter(p => p.id !== deletingId))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <PageWrapper>
      {/* sticky nav title */}
      <div className={`sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b transition-colors ${scrolled ? 'border-ds-border-2' : 'border-transparent'}`}>
        <div className="max-w-2xl mx-auto px-4 h-11 flex items-center">
          <span className={`font-ui text-[15px] font-semibold text-ds-text transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            笔记墙
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24">
        {/* large title */}
        <h1
          ref={largeTitleRef}
          className="font-ui text-[28px] font-bold text-ds-text pt-4 pb-6"
        >
          笔记墙
        </h1>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-2 rounded-xl h-[180px] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && fetchError && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
            <p className="font-ui text-[14px] text-ds-text-3">読み込みに失敗しました</p>
            <button
              onClick={() => { setFetchError(false); setLoading(true); api.get<WallPin[]>('/api/wall-pins').then(setPins).catch(() => setFetchError(true)).finally(() => setLoading(false)) }}
              className="font-ui text-[13px] text-ds-text underline"
            >
              再試行
            </button>
          </div>
        )}

        {!loading && !fetchError && pins.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <p className="font-ui text-[15px] text-ds-text-3">まだピンがありません</p>
            <p className="font-ui text-[13px] text-ds-text-4">
              X や Instagram の投稿 URL を追加してみましょう
            </p>
          </div>
        )}

        {/* masonry grid */}
        {!loading && !fetchError && pins.length > 0 && (
          <div className="columns-1 sm:columns-2 gap-3">
            {pins.map(pin => (
              <PinCard
                key={pin.id}
                pin={pin}
                onEdit={setEditingPin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-[72px] right-4 z-40 w-12 h-12 bg-ds-text text-bg rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAdd && (
        <AddPinModal
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
        />
      )}

      {editingPin && (
        <EditPinModal
          pin={editingPin}
          onClose={() => setEditingPin(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeletingId(null)} />
          <div className="relative bg-bg rounded-2xl shadow-xl p-5 w-full max-w-xs space-y-4 z-10">
            <p className="font-ui text-[15px] font-semibold text-ds-text text-center">このピンを削除しますか？</p>
            <p className="font-ui text-[13px] text-ds-text-3 text-center">この操作は取り消せません</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-bg-2 rounded-xl font-ui text-[14px] text-ds-text"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 rounded-xl font-ui text-[14px] font-semibold text-white"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
