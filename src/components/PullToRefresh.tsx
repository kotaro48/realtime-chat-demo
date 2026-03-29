import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'  // framer-motion: 动画

// ── 圆环几何常量 ──────────────────────────────────────────────────────────
// SVG viewBox="0 0 30 30"，圆心 (15,15)，半径 12
const RADIUS       = 12
const CIRCUMFERENCE = 2 * Math.PI * RADIUS   // ≈ 75.4 — 圆的一周笔画长度

// ── 交互常量 ──────────────────────────────────────────────────────────────
const THRESHOLD = 64   // 触发刷新所需的最小上拉距离（px）
const MAX_PULL  = 88   // 上拉的硬上限

// 判断滚动容器是否已到达底部（留 2px 误差容忍）
function isAtBottom(el: HTMLDivElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= 2
}

// ─────────────────────────────────────────────────────────────────────────
interface PullToRefreshProps {
  onRefresh: () => Promise<void>   // 触发刷新时调用，返回 Promise，完成后动画复位
  children: React.ReactNode
  className?: string               // 传给外层容器（通常是 flex-1）
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  // ── Refs ─────────────────────────────────────────────────────────────
  const scrollRef     = useRef<HTMLDivElement>(null)  // 指向内部可滚动容器
  const startYRef     = useRef(0)                      // 触摸起始 clientY
  const canPullRef    = useRef(false)                  // 当前是否处于"可上拉"状态
  const refreshingRef = useRef(false)                  // 刷新中标志（避免 closure 问题）
  const onRefreshRef  = useRef(onRefresh)              // 稳定引用，防止事件监听器频繁重绑

  // 每次 onRefresh prop 变化时同步到 ref
  useEffect(() => { onRefreshRef.current = onRefresh }, [onRefresh])

  const [refreshing, setRefreshing] = useState(false)

  // ── Motion 值 ────────────────────────────────────────────────────────
  // pullY: 当前上拉距离 (0 ~ MAX_PULL)，驱动所有动画
  const pullY = useMotionValue(0)

  // 进度 0→1，超过 THRESHOLD 后锁定（clamp:true）
  const progress = useTransform(pullY, [0, THRESHOLD], [0, 1], { clamp: true })

  // ── stroke-dashoffset ────────────────────────────────────────────────
  // CIRCUMFERENCE → 0：笔画从"全隐藏"逐渐显示为完整圆环
  const strokeDashoffset = useTransform(progress, [0, 1], [CIRCUMFERENCE, 0])

  // 指示器容器的 Y 偏移（相对于底部绝对定位）：
  // pullY=0   → y=+56（藏在底部下方，看不见）
  // pullY=64  → y=-8（正好露出来，距底部 8px）
  const indicatorY = useTransform(pullY, [0, THRESHOLD], [56, -8])

  // 透明度：上拉到 16px 才开始显现，40px 时完全不透明
  const indicatorOpacity = useTransform(pullY, [16, 40], [0, 1], { clamp: true })

  // ── 触摸处理 ──────────────────────────────────────────────────────────

  // touchstart：仅在内容滚动到底部时才激活上拉
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!scrollRef.current || !isAtBottom(scrollRef.current)) return
    startYRef.current = e.touches[0].clientY
    canPullRef.current = true
  }, [])

  // touchmove：计算上拉距离并更新 pullY
  // 注意：必须用原生 addEventListener + { passive: false } 才能调用 preventDefault
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canPullRef.current || refreshingRef.current) return

    // 上划 = 手指向上移动 = currentY < startY = delta 为负数
    const delta = startYRef.current - e.touches[0].clientY
    if (delta <= 0) {
      // 向下滑动：退出上拉模式，交还给浏览器滚动
      canPullRef.current = false
      return
    }

    // 阻止浏览器默认的页面滚动 / iOS 弹性回弹
    e.preventDefault()

    // 平方根阻尼：拉得越多阻力越大，手感"越来越重"
    const damped = Math.min(MAX_PULL, Math.sqrt(delta) * 7.5)
    pullY.set(damped)
  }, [pullY])

  // touchend：判断是否超过阈值，执行刷新或弹回
  const handleTouchEnd = useCallback(async () => {
    if (!canPullRef.current) return
    canPullRef.current = false

    if (pullY.get() >= THRESHOLD) {
      // 达到阈值：进入刷新状态，保持指示器可见，等待 onRefresh 完成
      refreshingRef.current = true
      setRefreshing(true)
      try {
        await onRefreshRef.current()
      } finally {
        refreshingRef.current = false
        setRefreshing(false)
        // 刷新完成后，弹簧动画将指示器弹回底部
        animate(pullY, 0, { type: 'spring', stiffness: 280, damping: 28 })
      }
    } else {
      // 未达到阈值：直接弹回，不触发刷新
      animate(pullY, 0, { type: 'spring', stiffness: 280, damping: 28 })
    }
  }, [pullY])

  // ── 事件绑定 ──────────────────────────────────────────────────────────
  // React 合成事件的 touchmove 默认是 passive 的，无法 preventDefault。
  // 必须用原生 addEventListener + { passive: false } 绑到 DOM 元素上。
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('touchstart', handleTouchStart, { passive: true  })
    el.addEventListener('touchmove',  handleTouchMove,  { passive: false })  // passive:false 允许 preventDefault
    el.addEventListener('touchend',   handleTouchEnd,   { passive: true  })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove',  handleTouchMove)
      el.removeEventListener('touchend',   handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // ── 渲染 ──────────────────────────────────────────────────────────────
  return (
    // 外层：relative + overflow-hidden，让指示器在容器范围外消失
    <div className={`relative overflow-hidden ${className}`}>

      {/* ── 可滚动内容区 ─────────────────────────────────────────── */}
      {/* ref 挂在这里，touchmove 从这里捕获 */}
      <div ref={scrollRef} className="h-full overflow-y-auto">
        {children}
      </div>

      {/* ── 圆环指示器（底部） ───────────────────────────────────── */}
      {/* absolute 定位到底部，随 pullY 从下方滑入 */}
      <motion.div
        style={{ y: indicatorY, opacity: indicatorOpacity }}
        className="absolute bottom-0 left-0 right-0 flex justify-center z-20 pointer-events-none"
      >
        {/* 圆形底盘 */}
        <div className="w-10 h-10 rounded-full bg-bg border border-ds-border shadow-sm flex items-center justify-center">

          {refreshing ? (
            // ── 刷新中：3/4 弧持续旋转 ────────────────────────────
            <motion.svg
              width="24" height="24" viewBox="0 0 30 30"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
            >
              {/* rotate(-90)：让弧从 12 点方向开始，而非默认的 3 点 */}
              <g transform="rotate(-90 15 15)">
                {/* 轨道（淡色底圈） */}
                <circle cx="15" cy="15" r={RADIUS} fill="none"
                  stroke="rgb(var(--border-2))" strokeWidth="2.5" />
                {/* 旋转弧：留 1/4 缺口（dashoffset = 圆周 × 0.25） */}
                <circle cx="15" cy="15" r={RADIUS} fill="none"
                  stroke="rgb(var(--accent))" strokeWidth="2.5"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * 0.25}
                  strokeLinecap="round" />
              </g>
            </motion.svg>

          ) : (
            // ── 上拉中：圆弧跟随进度从 0 填满到 100% ─────────────
            <svg width="24" height="24" viewBox="0 0 30 30">
              <g transform="rotate(-90 15 15)">
                {/* 轨道 */}
                <circle cx="15" cy="15" r={RADIUS} fill="none"
                  stroke="rgb(var(--border-2))" strokeWidth="2.5" />
                {/* 进度弧：strokeDashoffset 由 useTransform 驱动 */}
                <motion.circle cx="15" cy="15" r={RADIUS} fill="none"
                  stroke="rgb(var(--accent))" strokeWidth="2.5"
                  strokeDasharray={CIRCUMFERENCE}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round" />
              </g>
            </svg>
          )}

        </div>
      </motion.div>

    </div>
  )
}
