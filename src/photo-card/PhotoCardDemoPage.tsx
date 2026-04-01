import { PhotoCardBox, PhotoCardData } from './PhotoCardBox'

// ── Demo card data (AKB48 members with image color palettes) ──────────────

const DEMO_CARDS: PhotoCardData[][] = [
  // Stack 1: 柏木由紀 (pink rose)
  [
    { id: 'yuki-k', memberName: '柏木 由紀', romaji: 'YUKI.K', edition: '2026 Spring', team: 'Team B', gradientFrom: '#FDA4AF', gradientTo: '#9D174D' },
    { id: 'yuki-k-b1', memberName: '岡田 奈々', romaji: 'NANA.O', edition: '2026 Spring', team: 'Team 4', gradientFrom: '#BBF7D0', gradientTo: '#065F46' },
    { id: 'yuki-k-b2', memberName: '横山 由依', romaji: 'YUI.Y', edition: '2026 Spring', team: 'Team K', gradientFrom: '#BAE6FD', gradientTo: '#075985' },
  ],

  // Stack 2: 横山由依 (sky blue)
  [
    { id: 'yui-y', memberName: '横山 由依', romaji: 'YUI.Y', edition: '2026 Spring', team: 'Team K', gradientFrom: '#BAE6FD', gradientTo: '#0369A1' },
    { id: 'yui-y-b1', memberName: '村山 彩希', romaji: 'YUIRI.M', edition: '2026 Spring', team: 'Team 4', gradientFrom: '#C7D2FE', gradientTo: '#3730A3' },
    { id: 'yui-y-b2', memberName: '込山 榛香', romaji: 'HARUKA.K', edition: '2026 Spring', team: 'Team K', gradientFrom: '#99F6E4', gradientTo: '#0F766E' },
  ],

  // Stack 3: 向井地美音 (purple)
  [
    { id: 'mion-m', memberName: '向井地 美音', romaji: 'MION.M', edition: '2026 Spring', team: 'Team A', gradientFrom: '#DDD6FE', gradientTo: '#6D28D9' },
    { id: 'mion-m-b1', memberName: '本田 仁美', romaji: 'HITOMI.H', edition: '2026 Spring', team: 'Team B', gradientFrom: '#FBCFE8', gradientTo: '#9D174D' },
    { id: 'mion-m-b2', memberName: '小栗 有以', romaji: 'YUI.O', edition: '2026 Spring', team: 'Team 8', gradientFrom: '#FDE68A', gradientTo: '#92400E' },
  ],

  // Stack 4: 岡田奈々 (emerald)
  [
    { id: 'nana-o', memberName: '岡田 奈々', romaji: 'NANA.O', edition: '2026 Spring', team: 'Team 4', gradientFrom: '#6EE7B7', gradientTo: '#065F46' },
    { id: 'nana-o-b1', memberName: '久保 怜音', romaji: 'REON.K', edition: '2026 Spring', team: 'Team B', gradientFrom: '#FED7AA', gradientTo: '#9A3412' },
    { id: 'nana-o-b2', memberName: '柏木 由紀', romaji: 'YUKI.K', edition: '2026 Spring', team: 'Team B', gradientFrom: '#FDA4AF', gradientTo: '#9D174D' },
  ],

  // Stack 5: 小栗有以 (amber gold)
  [
    { id: 'yui-o', memberName: '小栗 有以', romaji: 'YUI.O', edition: '2026 Spring', team: 'Team 8', gradientFrom: '#FDE68A', gradientTo: '#B45309' },
    { id: 'yui-o-b1', memberName: '向井地 美音', romaji: 'MION.M', edition: '2026 Spring', team: 'Team A', gradientFrom: '#DDD6FE', gradientTo: '#6D28D9' },
    { id: 'yui-o-b2', memberName: '岡田 奈々', romaji: 'NANA.O', edition: '2026 Spring', team: 'Team 4', gradientFrom: '#6EE7B7', gradientTo: '#065F46' },
  ],
]

// ── Page ──────────────────────────────────────────────────────────────────

export function PhotoCardDemoPage() {
  return (
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

      {/* Instruction banner */}
      <div className="max-w-[860px] mx-auto px-5 pt-6 pb-4">
        <div className="bg-ds-accent-bg border border-ds-accent/20 rounded-md px-4 py-3 flex items-start gap-3">
          <div
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style={{ background: 'rgb(var(--accent))' }}
          />
          <div>
            <p className="font-ui text-[12px] font-medium text-ds-accent mb-0.5">
              PC: ホバーで生写真を引き出す
            </p>
            <p className="font-ui text-[11px] text-ds-text-3">
              スマートフォン: タップで切り替え
            </p>
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="max-w-[860px] mx-auto px-5 pt-2">
        {/* Section label */}
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ds-text-4 mb-8">
          2026 Spring Collection
        </p>

        <div className="flex flex-wrap gap-10 justify-center sm:justify-start">
          {DEMO_CARDS.map((stack, i) => (
            <PhotoCardBox
              key={stack[0].id}
              cards={stack}
              label={stack[0].romaji}
            />
          ))}
        </div>

        {/* Mechanics explanation */}
        <div className="mt-16 border-t border-ds-border-2 pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ds-text-4 mb-4">
            Animation Notes
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: '3D Perspective', desc: 'CSS perspective(700px) + Framer Motion rotateX で奥行きを表現' },
              { title: 'Sleeve Trick', desc: 'z-index 20 のスリーブ前面がカード底部を隠し、引き出す幻想を作る' },
              { title: 'Interrupt Safe', desc: 'Framer Motion がアニメーション途中のマウスアウトを安全に処理' },
            ].map(item => (
              <div key={item.title} className="bg-bg-2 rounded-md p-4">
                <p className="font-ui text-[12px] font-semibold text-ds-text mb-1">{item.title}</p>
                <p className="font-ui text-[11px] text-ds-text-3 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
