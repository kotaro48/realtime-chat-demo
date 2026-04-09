/**
 * [INPUT]: 依赖 PhotoCardBox 的 PhotoCardData、CardFace；framer-motion 的 AnimatePresence、useMotionValue、useSpring、useMotionTemplate
 * [OUTPUT]: 对外提供 PhotoCardLightbox 组件
 * [POS]: photo-card 的灯箱展示器，被 PhotoCardDemoPage 消费；点击卡片后全屏展示 + 3D 倾斜 + 光泽
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect } from 'react'
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useMotionTemplate,
} from 'framer-motion'  // framer-motion: 动画、弹簧、模板字符串 motion value
import type { PhotoCardData } from './PhotoCardBox'
import { CardFace } from './PhotoCardBox'  // PhotoCardBox: 卡片正面内容

interface Props {
  card: PhotoCardData | null
  onClose: () => void
}

// 灯箱卡片尺寸（比 grid 大一倍）
const CARD_W = 240
const CARD_H = 336

export function PhotoCardLightbox({ card, onClose }: Props) {
  // 倾斜 motion values，useSpring 提供弹簧阻尼
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const springX = useSpring(tiltX, { stiffness: 280, damping: 22 })
  const springY = useSpring(tiltY, { stiffness: 280, damping: 22 })

  // 光泽位置（鼠标跟随的高光圆心）
  const shineX = useMotionValue(50)
  const shineY = useMotionValue(50)
  const shineSpringX = useSpring(shineX, { stiffness: 200, damping: 20 })
  const shineSpringY = useSpring(shineY, { stiffness: 200, damping: 20 })
  // useMotionTemplate 将 motion values 插入 CSS 字符串
  const shineGradient = useMotionTemplate`radial-gradient(circle at ${shineSpringX}% ${shineSpringY}%, rgba(255,255,255,0.22) 0%, transparent 62%)`

  // Esc 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // 鼠标移动：计算归一化坐标 → 倾斜 + 光泽
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5   // -0.5 ~ 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5
    tiltX.set(ny * -36)   // rotateX 最大 ±18°
    tiltY.set(nx *  36)   // rotateY 最大 ±18°
    shineX.set((nx + 0.5) * 100)
    shineY.set((ny + 0.5) * 100)
  }

  const handleMouseLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
    shineX.set(50)
    shineY.set(50)
  }

  return (
    <AnimatePresence>
      {card && (
        // 全屏遮罩 — 点击背景关闭
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0 }}
          onClick={onClose}
        >
          {/* 背景遮罩：先去掉 backdrop-blur，避免移动端 Safari 在全屏模糊时闪屏重绘 */}
          <div className="absolute inset-0 bg-black/70" />

          {/* 卡片容器（perspective 在此层设置） */}
          <div
            className="relative z-10 flex flex-col items-center gap-4"
            style={{ perspective: '1000px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 3D 倾斜卡片 */}
            <motion.div
              className="relative overflow-hidden rounded-xl cursor-grab"
              initial={{ scale: 0.985 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: CARD_W,
                height: CARD_H,
                rotateX: springX,
                rotateY: springY,
                boxShadow: '0 32px 72px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.3)',
                transformStyle: 'preserve-3d',
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <CardFace card={card} hideNameBadge />

              {/* 光泽层 — radial-gradient 随鼠标移动 */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-xl"
                style={{ background: shineGradient }}
              />
            </motion.div>

            {/* 卡片信息 */}
            <div className="text-center">
              <p className="font-jp text-white font-semibold text-[15px]">{card.memberName}</p>
              <p className="font-mono text-white/50 text-[11px] tracking-widest mt-0.5">{card.romaji} · {card.edition}</p>
            </div>

            {/* 关闭提示 */}
            <p className="font-mono text-white/30 text-[10px] tracking-widest uppercase">
              ESC or click outside to close
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
