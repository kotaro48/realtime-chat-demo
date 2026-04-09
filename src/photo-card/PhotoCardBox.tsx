import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'  // framer-motion：负责卡片抽出、倾斜和过渡动画

// ── 数据类型定义 ────────────────────────────────────────────────────────────

export interface PhotoCardData {
  id: string
  memberName: string    // 成员名，例如 "柏木 由紀"
  romaji: string        // 罗马字名，例如 "YUKI.K"
  edition: string       // 版本名，例如 "2026 Spring"
  gradientFrom: string  // 渐变起始色
  gradientTo: string    // 渐变结束色
  team: string          // 队伍名，例如 "Team B"
  imageUrl?: string     // 实拍照片地址；不传时退回到抽象渐变卡面
}

// ── 卡片正面内容 ────────────────────────────────────────────────────────────

export function CardFace({ card, hideNameBadge }: { card: PhotoCardData; hideNameBadge?: boolean }) {
  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{
        // 有实拍图时用纯黑底承接图片；否则渲染抽象渐变背景
        background: card.imageUrl
          ? '#000'
          : `
            linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.12) 100%),
            radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 50%),
            linear-gradient(160deg, ${card.gradientFrom} 0%, ${card.gradientTo} 100%)
          `,
      }}
    >
      {/* 实拍图模式：整张图片铺满卡片 */}
      {card.imageUrl && (
        <img
          src={card.imageUrl}
          alt={card.memberName}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      )}

      {/* 顶部版本信息：实拍图场景下通过文字阴影保证可读性 */}
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

      {/* 无实拍图时，用两个发光圆形叠出抽象卡面质感 */}
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

      {/* 实拍图模式下，中间留空，把姓名信息压到底部 */}
      {card.imageUrl && <div className="flex-1" />}

      {/* 底部姓名区：在 lightbox 里会隐藏，避免和外部标题重复 */}
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

// ── 卡背占位设计 ───────────────────────────────────────────────────────────

function CardBack({ card }: { card: PhotoCardData }) {
  return (
    <div
      className="w-full h-full"
      style={{
        // 只用低饱和渐变和描边表现“后面的卡”
        background: `linear-gradient(135deg, ${card.gradientFrom}33, ${card.gradientTo}33)`,
        border: '1px solid rgb(var(--border))',
        borderRadius: 8,
      }}
    />
  )
}

// ── 生写卡盒组件 ────────────────────────────────────────────────────────────
// 模拟“卡片插在卡套里”的实体感：
// 桌面端通过 hover 把最前面的卡抽出来，
// 移动端通过点击切换展开/收回。

interface Props {
  cards: PhotoCardData[]   // cards[0] 是正面的主卡，后面最多再展示两张卡背
  label?: string           // 卡盒底部的小标签
  onCardClick?: (card: PhotoCardData) => void  // 点击主卡后的回调，通常用于打开 lightbox
}

// 卡片和卡套的基础尺寸
const CARD_W = 140
const CARD_H = 196
const CONTAINER_W = 172   // 容器要额外给后排卡片的偏移留空间
const CONTAINER_H = 256   // 总高度 = 卡片高度 + 下方卡套露出的部分
const SLEEVE_H = 68       // 卡套本体可见高度

// 静止时，主卡底部有多少像素被“插”在卡套里
const SLEEVE_OVERLAP = 28

// 抽出时向上移动的距离
const PULL_DISTANCE = 72

export function PhotoCardBox({ cards, label, onCardClick }: Props) {
  // 组件挂载时检测一次设备是否没有 hover 能力。
  // 这里不是按屏幕宽度判断，而是按输入设备能力判断。
  const isMobile = useRef(
    typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  ).current

  // 第一张是主卡；后两张只作为堆叠背景展示
  const mainCard = cards[0]
  const backCards = cards.slice(1, 3)

  // 鼠标跟随倾斜：motion value 记录目标角度，spring 负责把变化做顺
  const cardRef = useRef<HTMLDivElement>(null)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(tiltX, { stiffness: 400, damping: 28 })
  const springY = useSpring(tiltY, { stiffness: 400, damping: 28 })

  // 桌面端鼠标移动时，按相对位置计算卡片 X/Y 轴倾斜
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5   // -0.5 ~ 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    tiltX.set(ny * -24)   // rotateX：鼠标下方时向前倾
    tiltY.set(nx * 24)    // rotateY：鼠标右侧时向右倾
  }

  // 鼠标离开后把倾斜角复位
  const handleMouseLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  // 后排卡片的错位参数：略微往右下偏，并带一点旋转角度
  const backOffsets = [
    { dx: 12, dy: 8, rotate: 3 },
    { dx: 6,  dy: 4, rotate: 1.5 },
  ]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 透视容器：给内部主卡的 rotateX / rotateY 提供 3D 视角 */}
      <div style={{ perspective: '700px' }}>
        {/*
          外层相对定位容器：
          所有卡片和卡套都以这里为定位基准，
          宽高也要把后排卡片的偏移量一起算进去。
        */}
        <div
          className="relative select-none"
          style={{ width: CONTAINER_W, height: CONTAINER_H }}
        >
          {/* ── 背景卡片：静态堆叠在主卡后面，制造“卡组”层次 ─────────── */}
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

          {/* ── 主卡：负责 hover / 点击展开，也是唯一可进入灯箱的卡 ───── */}
          {/*
            层级关系：
            主卡 z-index 10，高于后排卡片，低于前面的卡套挡板。
            transformOrigin 设为底部中心，让倾斜和抽出都像从卡套口翻起。
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
            // 桌面端用 hover 抽卡；移动端禁用 hover，避免触摸设备误触发
            whileHover={isMobile ? undefined : {
              y: -PULL_DISTANCE,
              scale: 1.03,
              boxShadow: '0 16px 40px rgba(0,0,0,0.28)',
            }}
            transition={{ type: 'tween', ease: [0.25, 0, 0, 1], duration: 0.30 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
              // 阻止点击主卡时冒泡到外层容器，避免重复触发 toggle
              e.stopPropagation()
              onCardClick?.(mainCard)
            }}
          >
            <CardFace card={mainCard} />
          </motion.div>

          {/* ── 卡套前挡板：盖住主卡下缘，制造“卡片插在里面”的错觉 ───── */}
          {/*
            这层位于最上方：
            静止时遮住主卡底部 SLEEVE_OVERLAP 对应的区域，
            抽出时卡片从这层后面往上滑出来。
          */}
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: SLEEVE_H,
              zIndex: 20,
              // 上缘稍亮、往下过渡到卡套本体，模拟纸套口部和面板
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
              // 内阴影让卡套看起来更有厚度和凹陷感
              boxShadow: `
                inset 0 4px 8px rgba(0,0,0,0.07),
                inset 0 1px 2px rgba(0,0,0,0.04)
              `,
            }}
          >
            {/* 开口高光线：弱化死板边界，让卡套上缘更像真实开口 */}
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

      {/* 底部辅助标签：通常显示 romaji 或系列标识 */}
      {label && (
        <p className="font-mono text-[10px] tracking-widest uppercase text-ds-text-4">
          {label}
        </p>
      )}
    </div>
  )
}
