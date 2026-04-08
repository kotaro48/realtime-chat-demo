import { useState } from 'react'
import { PhotoCardBox, PhotoCardData } from './PhotoCardBox'
import { PhotoCardLightbox } from './PhotoCardLightbox'  // PhotoCardLightbox: 点击卡片后的灯箱展示

// ── Demo card data (AKB48 members with image color palettes) ──────────────

const DEMO_CARDS: PhotoCardData[][] = [
  // 柏木由紀 (実写真)
  [
    { id: 'yuki-k', memberName: '柏木 由紀', romaji: 'YUKI.K', edition: '2026 Spring', team: 'Team B', gradientFrom: '#FDA4AF', gradientTo: '#9D174D', imageUrl: '/cards/card-01.jpg' },
  ],
]

// ── Page ──────────────────────────────────────────────────────────────────

export function PhotoCardDemoPage() {
  const [selectedCard, setSelectedCard] = useState<PhotoCardData | null>(null)

  return (
    <>
    <div className="min-h-dvh bg-bg pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg border-b border-ds-border">
        <div className="max-w-[860px] mx-auto px-5 h-12 flex items-center gap-3">
          <a href="/" className="text-ds-text-3 hover:text-ds-text transition-colors text-sm">
            ←
          </a>
          <span className="font-ui text-[13px] font-semibold text-ds-text tracking-wide">
            デジタル生写真
          </span>
          <span className="font-mono text-[10px] text-ds-text-4 ml-auto">
            DIGITAL BROMIDE
          </span>
        </div>
      </div>


      {/* Card grid */}
      <div className="max-w-[860px] mx-auto px-5 pt-2">
        {/* Section label */}
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ds-text-4 mb-8">
          2026 Spring Collection
        </p>

        <div className="flex flex-wrap gap-10 justify-center sm:justify-start">
          {DEMO_CARDS.map((stack) => (
            <PhotoCardBox
              key={stack[0].id}
              cards={stack}
              label={stack[0].romaji}
              onCardClick={setSelectedCard}
            />
          ))}
        </div>

      </div>
    </div>

    {/* 灯箱 — 点击卡片后展示，fixed 定位不影响文档流 */}
    <PhotoCardLightbox card={selectedCard} onClose={() => setSelectedCard(null)} />
    </>
  )
}
