import { useEffect, useRef, useState, useCallback } from 'react'
import { useKeyboard } from './useKeyboard'
import { AKB48_VENUE, MAP_W, MAP_H, PLAYER_SIZE } from './mapData'
import { Booth } from './types'

// ── Player movement speed (world px per frame @ ~60fps) ──────────────
const PLAYER_SPEED = 3.0

// ── Floor tile pattern via CSS repeating gradients ───────────────────
const FLOOR_STYLE: React.CSSProperties = {
  background: `
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 39px,
      rgba(0,0,0,0.025) 39px,
      rgba(0,0,0,0.025) 40px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 39px,
      rgba(0,0,0,0.025) 39px,
      rgba(0,0,0,0.025) 40px
    ),
    rgb(var(--bg-2))
  `,
}

// ── BoothCard — rendered at absolute position on map ─────────────────
function BoothCard({ booth, isActive }: { booth: Booth; isActive: boolean }) {
  const { rect, member, label } = booth
  return (
    <div
      className="absolute select-none"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: 8,
        background: `linear-gradient(135deg, ${member.gradientFrom}DD, ${member.gradientTo}EE)`,
        border: isActive
          ? '2px solid rgb(var(--accent))'
          : '1px solid rgba(255,255,255,0.25)',
        boxShadow: isActive
          ? `0 0 0 3px rgb(var(--accent) / 0.2), 0 4px 16px ${member.gradientTo}55`
          : `0 2px 8px ${member.gradientTo}33`,
        overflow: 'hidden',
        // Only transition shadow/border, not transform (avoids RAF interference)
        transition: 'box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Lane label */}
      <div
        className="absolute top-1.5 left-1.5 font-mono text-[9px] tracking-wider px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.8)' }}
      >
        {label}
      </div>

      {/* Active pulse dot */}
      {isActive && (
        <div
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: 'rgb(var(--accent))', boxShadow: '0 0 6px rgb(var(--accent))' }}
        />
      )}

      {/* Member name strip */}
      <div
        className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <p className="font-jp text-white text-[11px] font-bold leading-tight">{member.name}</p>
        <p className="font-mono text-[8px] tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {member.romaji}
        </p>
      </div>
    </div>
  )
}

// ── BoothOverlay — bottom sheet when player enters a booth ────────────
function BoothOverlay({ booth, onClose }: { booth: Booth; onClose: () => void }) {
  const { member } = booth
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[480px] pointer-events-auto">
        <div
          className="bg-bg border-t border-l border-r border-ds-border rounded-t-lg px-5 py-4 post-enter"
          style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.12)' }}
        >
          <div className="flex items-center gap-4 mb-3">
            {/* Color swatch */}
            <div
              className="w-14 h-14 rounded-md flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${member.gradientFrom}, ${member.gradientTo})`,
                boxShadow: `0 4px 12px ${member.gradientTo}55`,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-jp text-ds-text text-[15px] font-bold leading-tight">{member.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    color: 'rgb(var(--accent))',
                    background: 'rgb(var(--accent-bg))',
                    border: '1px solid rgb(var(--accent) / 0.25)',
                  }}
                >
                  {member.romaji}
                </span>
                <span className="font-ui text-[11px] text-ds-text-3">{member.team}</span>
              </div>
            </div>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md text-ds-text-3 hover:text-ds-text hover:bg-bg-2 text-lg leading-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-ds-border-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center font-mono text-white font-bold"
              style={{
                fontSize: 9,
                background: `linear-gradient(135deg, ${member.gradientFrom}, ${member.gradientTo})`,
              }}
            >
              {member.laneNum}
            </div>
            <p className="font-ui text-[11px] text-ds-text-3">
              レーン {member.laneNum} — {booth.label}
            </p>
            <p className="font-mono text-[10px] text-ds-accent ml-auto tracking-wider">NEARBY</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DPad — virtual directional pad for touch devices ─────────────────
function DPad({ virtualKeys }: { virtualKeys: React.RefObject<Set<string>> }) {
  function press(key: string)   { virtualKeys.current.add(key) }
  function release(key: string) { virtualKeys.current.delete(key) }

  const btnStyle: React.CSSProperties = {
    width: 48, height: 48,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
    background: 'rgb(var(--bg))',
    border: '1px solid rgb(var(--border))',
    color: 'rgb(var(--text-2))',
    fontSize: 20,
    userSelect: 'none',
    cursor: 'pointer',
    WebkitUserSelect: 'none',
  }

  function mkBtn(key: string, label: string) {
    return (
      <div
        style={btnStyle}
        onPointerDown={(e) => { (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId); press(key) }}
        onPointerUp={() => release(key)}
        onPointerLeave={() => release(key)}
      >
        {label}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {mkBtn('ArrowUp', '↑')}
      <div style={{ display: 'flex', gap: 4 }}>
        {mkBtn('ArrowLeft', '←')}
        {mkBtn('ArrowDown', '↓')}
        {mkBtn('ArrowRight', '→')}
      </div>
    </div>
  )
}

// ── VenueMapPage ──────────────────────────────────────────────────────

export function VenueMapPage() {
  const venue = AKB48_VENUE
  const keysRef     = useKeyboard()
  const virtualKeys = useRef<Set<string>>(new Set())

  // Player DOM element — position written directly to avoid React re-renders at 60fps
  const playerRef       = useRef<HTMLDivElement>(null)
  const posRef          = useRef({ x: venue.spawnPoint.x, y: venue.spawnPoint.y })
  const currentBoothRef = useRef<string | null>(null)

  const [activeBooth, setActiveBooth] = useState<Booth | null>(null)

  // Responsive scale: shrink map to fit container
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / MAP_W))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Check if player center is inside any booth trigger zone
  const checkBooth = useCallback((px: number, py: number) => {
    let entered: string | null = null
    for (const booth of venue.booths) {
      const z = booth.triggerZone
      if (px > z.x && px < z.x + z.w && py > z.y && py < z.y + z.h) {
        entered = booth.id
        break
      }
    }
    if (entered !== currentBoothRef.current) {
      currentBoothRef.current = entered
      const booth = entered ? venue.booths.find(b => b.id === entered) ?? null : null
      setActiveBooth(booth)
    }
  }, [venue.booths])

  // RAF game loop — drives player DOM element directly
  useEffect(() => {
    let rafId: number

    function loop() {
      const k  = keysRef.current
      const vk = virtualKeys.current
      let { x, y } = posRef.current

      const goLeft  = k.has('ArrowLeft')  || k.has('a') || k.has('A') || vk.has('ArrowLeft')
      const goRight = k.has('ArrowRight') || k.has('d') || k.has('D') || vk.has('ArrowRight')
      const goUp    = k.has('ArrowUp')    || k.has('w') || k.has('W') || vk.has('ArrowUp')
      const goDown  = k.has('ArrowDown')  || k.has('s') || k.has('S') || vk.has('ArrowDown')

      // Normalize diagonal speed to avoid moving faster diagonally
      const diagonal = (goLeft || goRight) && (goUp || goDown)
      const spd = diagonal ? PLAYER_SPEED * 0.707 : PLAYER_SPEED

      if (goLeft)  x -= spd
      if (goRight) x += spd
      if (goUp)    y -= spd
      if (goDown)  y += spd

      // Clamp player center to map bounds
      const half = PLAYER_SIZE / 2
      x = Math.max(half, Math.min(MAP_W - half, x))
      y = Math.max(half, Math.min(MAP_H - half, y))

      posRef.current = { x, y }

      // Write to DOM directly — no React reconcile
      if (playerRef.current) {
        playerRef.current.style.transform = `translate(${x - half}px, ${y - half}px)`
      }

      checkBooth(x, y)
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [checkBooth, keysRef])

  const half = PLAYER_SIZE / 2

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-bg border-b border-ds-border flex-shrink-0">
        <div className="max-w-[860px] mx-auto px-5 h-12 flex items-center gap-3">
          <a href="/" className="text-ds-text-3 hover:text-ds-text text-sm">←</a>
          <span className="font-ui text-[13px] font-semibold text-ds-text">握手会 仮想会場</span>
          <span className="font-mono text-[9px] text-ds-text-4 tracking-wider">幕張メッセ</span>
          <span className="font-mono text-[9px] text-ds-accent ml-auto tracking-wider hidden sm:inline">
            WASD / ARROW KEYS
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-5 gap-4">
        {/* Map outer container — measures available width for scaling */}
        <div ref={containerRef} className="w-full max-w-[760px]">
          <div
            style={{
              width: MAP_W * scale,
              height: MAP_H * scale,
              borderRadius: 12,
              border: '1px solid rgb(var(--border))',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* World space at natural size, scaled via CSS transform */}
            <div
              className="relative"
              style={{
                width: MAP_W,
                height: MAP_H,
                transformOrigin: 'top left',
                transform: `scale(${scale})`,
                ...FLOOR_STYLE,
              }}
            >
              {/* Entrance label */}
              <div
                className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
                style={{ top: MAP_H - 60, height: 60 }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ds-text-4">
                  ▲ ENTRANCE
                </span>
              </div>

              {/* Corridor dividers */}
              {[
                { y: 148, label: 'CORRIDOR  A' },
                { y: 308, label: 'CORRIDOR  B' },
              ].map(c => (
                <div
                  key={c.label}
                  className="absolute left-0 right-0 flex items-center px-6 pointer-events-none"
                  style={{ top: c.y, height: 52 }}
                >
                  <div className="flex-1 h-px" style={{ background: 'rgb(var(--border))' }} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ds-text-4 px-4">
                    {c.label}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'rgb(var(--border))' }} />
                </div>
              ))}

              {/* Booths */}
              {venue.booths.map(booth => (
                <BoothCard
                  key={booth.id}
                  booth={booth}
                  isActive={activeBooth?.id === booth.id}
                />
              ))}

              {/* Player character */}
              <div
                ref={playerRef}
                className="absolute pointer-events-none"
                style={{
                  width: PLAYER_SIZE,
                  height: PLAYER_SIZE,
                  zIndex: 30,
                  transform: `translate(${venue.spawnPoint.x - half}px, ${venue.spawnPoint.y - half}px)`,
                }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgb(var(--accent))',
                    border: '2px solid white',
                    boxShadow: '0 2px 10px rgb(var(--accent) / 0.55)',
                  }}
                >
                  <span className="font-mono text-white font-bold" style={{ fontSize: 7, lineHeight: 1 }}>
                    YOU
                  </span>
                </div>
                {/* Shadow under player */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{ bottom: -3, width: 10, height: 4, background: 'rgba(0,0,0,0.18)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile D-pad */}
        <div className="sm:hidden">
          <DPad virtualKeys={virtualKeys} />
        </div>

        {/* Desktop controls hint */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          {['W / ↑', 'S / ↓', 'A / ←', 'D / →'].map(key => (
            <kbd
              key={key}
              className="font-mono text-[10px] px-2 py-1 bg-bg-2 border border-ds-border rounded-sm text-ds-text-3"
            >
              {key}
            </kbd>
          ))}
          <span className="font-ui text-[11px] text-ds-text-3 ml-1">で移動</span>
          <span className="font-ui text-[11px] text-ds-text-4 ml-3">
            ブースに近づくと情報が表示されます
          </span>
        </div>
      </div>

      {/* Booth overlay */}
      {activeBooth && (
        <BoothOverlay
          booth={activeBooth}
          onClose={() => {
            setActiveBooth(null)
            currentBoothRef.current = null
          }}
        />
      )}
    </div>
  )
}
