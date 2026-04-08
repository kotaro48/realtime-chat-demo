import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'  // framer-motion: 3D card pull + tilt animation

// ── Types ─────────────────────────────────────────────────────────────────

export interface PhotoCardData {
  id: string
  memberName: string    // e.g. "柏木 由紀"
  romaji: string        // e.g. "YUKI.K"
  edition: string       // e.g. "2026 Spring"
  gradientFrom: string  // CSS color for gradient start
  gradientTo: string    // CSS color for gradient end
  team: string          // e.g. "Team B"
  imageUrl?: string     // 実写真 URL（省略時は抽象グラデーション）
}

// ── Card face content ──────────────────────────────────────────────────────

export function CardFace({ card, hideNameBadge }: { card: PhotoCardData; hideNameBadge?: boolean }) {
  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{
        background: card.imageUrl
          ? '#000'
          : `
            linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.12) 100%),
            radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 50%),
            linear-gradient(160deg, ${card.gradientFrom} 0%, ${card.gradientTo} 100%)
          `,
      }}
    >
      {/* 実写真モード */}
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.memberName}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      )}

      {/* Edition label — 実写真時は上部オーバーレイ */}
      <div className="relative z-10 px-2.5 pt-2.5 flex items-center justify-between">
        <span
          className="font-mono text-[8px] tracking-[0.15em] uppercase"
          style={{ color: 'rgba(255,255,255,0.65)', textShadow: card.imageUrl ? '0 1px 3px rgba(0,0,0,0.6)' : 'none' }}
        >
          {card.edition}
        </span>
        <span
          className="font-mono text-[8px] tracking-wider"
          style={{ color: 'rgba(255,255,255,0.5)', textShadow: card.imageUrl ? '0 1px 3px rgba(0,0,0,0.6)' : 'none' }}
        >
          Ota Kit
        </span>
      </div>

      {/* 抽象グラデーション（実写真なしのとき） */}
      {!card.imageUrl && (
        <div className="flex-1 flex items-center justify-center relative">
          <div
            className="absolute rounded-full"
            style={{
              width: 80, height: 80,
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            }}
          />
          <div
            className="rounded-full"
            style={{
              width: 52, height: 64,
              background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 60%, transparent 100%)',
              boxShadow: '0 0 20px rgba(255,255,255,0.15)',
            }}
          />
        </div>
      )}

      {/* 実写真のとき：中央スペーサー */}
      {card.imageUrl && <div className="flex-1" />}

      {/* Name area — Lightbox 时隐藏（名字已在卡片下方单独显示） */}
      {!hideNameBadge && <div
        className="relative z-10 px-3 py-2"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
      >
        <p className="font-jp text-white font-bold text-[13px] leading-tight tracking-wide">
          {card.memberName}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {card.romaji}
          </span>
          <span className="font-ui text-[9px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {card.team}
          </span>
        </div>
      </div>}
    </div>
  )
}

// ── Card back design ───────────────────────────────────────────────────────

function CardBack({ card }: { card: PhotoCardData }) {
  return (
    <div
      className="w-full h-full"
      style={{
        background: `linear-gradient(135deg, ${card.gradientFrom}33, ${card.gradientTo}33)`,
        border: '1px solid rgb(var(--border))',
        borderRadius: 8,
      }}
    />
  )
}

// ── PhotoCardBox ──────────────────────────────────────────────────────────
// Shows a stack of cards in a physical sleeve holder.
// Desktop: hover to pull the front card up from the sleeve.
// Mobile:  tap to toggle.

interface Props {
  cards: PhotoCardData[]   // [0] = front card, [1..] = back cards (max 3 shown)
  label?: string           // optional label below the sleeve
  onCardClick?: (card: PhotoCardData) => void  // lightbox callback
}

// Sleeve dimensions (the physical holder)
const CARD_W = 140
const CARD_H = 196
const CONTAINER_W = 172   // extra space for back card offset
const CONTAINER_H = 256   // card + sleeve bottom
const SLEEVE_H = 68       // how much of the sleeve is visible below the card opening

// How many px of the card are inside the sleeve at rest
const SLEEVE_OVERLAP = 28  // card bottom is 28px inside sleeve

// How far the card pulls out on hover
const PULL_DISTANCE = 72

export function PhotoCardBox({ cards, label, onCardClick }: Props) {
  const [mobileRevealed, setMobileRevealed] = useState(false)
  // 在 mount 时检测一次：触屏设备 hover:none → isMobile=true
  // 避免每次 render 调用 matchMedia，也防止 whileHover 在触摸时误触发
  const isMobile = useRef(
    typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  ).current

  const mainCard = cards[0]
  const backCards = cards.slice(1, 3)

  // 鼠标跟随倾斜：±12 度，useSpring 使动画丝滑
  const cardRef = useRef<HTMLDivElement>(null)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(tiltX, { stiffness: 400, damping: 28 })
  const springY = useSpring(tiltY, { stiffness: 400, damping: 28 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5   // -0.5 ~ 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    tiltX.set(ny * -24)   // rotateX：鼠标下方时向前倾
    tiltY.set(nx * 24)    // rotateY：鼠标右侧时向右倾
  }

  const handleMouseLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  // Back card offsets: each card sticks out slightly to the right/down
  const backOffsets = [
    { dx: 12, dy: 8, rotate: 3 },
    { dx: 6,  dy: 4, rotate: 1.5 },
  ]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Perspective wrapper — enables 3D transform on child */}
      <div style={{ perspective: '700px' }}>
        {/*
          Container: relative positioning anchor.
          Width/height accommodate the back card offsets.
        */}
        <div
          className="relative select-none"
          style={{ width: CONTAINER_W, height: CONTAINER_H }}
          // 手机：点容器空白区切换抽出/缩回
          onClick={() => { if (isMobile) setMobileRevealed(v => !v) }}
        >
          {/* ── Back cards (static, behind main card) ─────────────── */}
          {backCards.map((card, i) => {
            const offset = backOffsets[i]
            return (
              <div
                key={card.id}
                className="absolute overflow-hidden rounded-md"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  top: offset.dy,
                  left: offset.dx,
                  zIndex: i + 1,
                  transform: `rotate(${offset.rotate}deg)`,
                  opacity: 0.55,
                }}
              >
                <CardBack card={card} />
              </div>
            )
          })}

          {/* ── Main card (animated) ──────────────────────────────── */}
          {/*
            z-index 10: above back cards (z 1,2), below sleeve front face (z 20).
            transformOrigin: 'bottom center' — rotation pivots at sleeve opening edge.
            The card starts with SLEEVE_OVERLAP px hidden behind sleeve front face.
          */}
          <motion.div
            ref={cardRef}
            className="absolute overflow-hidden rounded-md cursor-pointer"
            style={{
              width: CARD_W,
              height: CARD_H,
              top: 0,
              left: 0,
              zIndex: 10,
              transformOrigin: 'bottom center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              rotateX: springX,
              rotateY: springY,
            }}
            // 电脑：whileHover 触发抽出；手机：禁用 whileHover 防止触摸时误触发闪屏
            whileHover={isMobile ? undefined : {
              y: -PULL_DISTANCE,
              scale: 1.03,
              boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
            }}
            animate={isMobile
              ? { y: mobileRevealed ? -PULL_DISTANCE : 0, scale: mobileRevealed ? 1.03 : 1 }
              : undefined
            }
            transition={{ type: 'tween', ease: [0.25, 0, 0, 1], duration: 0.30 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
              e.stopPropagation()          // 阻止冒泡到容器的 mobileRevealed toggle
              setMobileRevealed(false)     // 打开 lightbox 前先把卡片缩回去
              onCardClick?.(mainCard)
            }}
          >
            <CardFace card={mainCard} />
          </motion.div>

          {/* ── Sleeve front face ─────────────────────────────────── */}
          {/*
            z-index 20: renders OVER the card.
            Covers the bottom SLEEVE_OVERLAP px of the card at rest,
            creating the illusion that the card is inside the sleeve.
            The card slides upward from behind this element on hover.
          */}
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: SLEEVE_H,
              zIndex: 20,
              // Two-layer look: the sleeve opening shadow at top, then the sleeve body
              background: `
                linear-gradient(to bottom,
                  rgb(var(--bg-2)) 0%,
                  rgb(var(--bg)) 100%
                )
              `,
              borderTop: '2px solid rgb(var(--border))',
              borderLeft: '1px solid rgb(var(--border))',
              borderRight: '1px solid rgb(var(--border))',
              borderBottom: '1px solid rgb(var(--border))',
              borderRadius: '0 0 10px 10px',
              // Inset shadow: suggests depth inside the sleeve
              boxShadow: `
                inset 0 4px 8px rgba(0,0,0,0.07),
                inset 0 1px 2px rgba(0,0,0,0.04)
              `,
            }}
          >
            {/* Slot opening highlight line */}
            <div
              className="absolute top-0 left-4 right-4"
              style={{
                height: 1,
                background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.06), transparent)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Optional label below the box */}
      {label && (
        <p className="font-mono text-[10px] tracking-widest uppercase text-ds-text-4">
          {label}
        </p>
      )}
    </div>
  )
}
