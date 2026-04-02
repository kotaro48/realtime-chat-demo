/**
 * [INPUT]: 无依赖
 * [OUTPUT]: Spring 配置常量、Variants 动画模式、工具函数
 * [POS]: lib 的动画配置中枢，所有 Framer Motion 动效从此派生，禁止在组件内硬编码 Spring 参数
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { Transition, Variants } from 'framer-motion'

/* ============================================================
   Apple 风格 Spring 配置
   - 物理引擎：stiffness（弹力）+ damping（阻尼）+ mass（质量）
   - 规则：入场用 Spring，退场用短时长 ease
   ============================================================ */

// 标准交互：按钮、卡片悬停（~200ms）
export const snappy: Transition = { type: 'spring', stiffness: 400, damping: 30 }

// 温和过渡：面板展开、模态框（~350ms）
export const gentle: Transition = { type: 'spring', stiffness: 300, damping: 35 }

// 弹性强调：成功反馈、关键元素（~300ms）
export const bouncy: Transition = { type: 'spring', stiffness: 500, damping: 25, mass: 0.8 }

// 优雅稳定：页面过渡、大元素（~500ms）
export const smooth: Transition = { type: 'spring', stiffness: 200, damping: 40, mass: 1.2 }

// 惯性滑动：列表、轮播（轻盈）
export const inertia: Transition = { type: 'spring', stiffness: 150, damping: 20, mass: 0.5 }

/* ============================================================
   Apple 缓动曲线（非 Spring 场景专用）
   ============================================================ */
export const appleEase      = [0.25, 0.1, 0.25, 1.0] as const
export const appleEaseOut   = [0.22, 1,   0.36, 1.0] as const
export const appleDecelerate = [0,   0,   0.2,  1.0] as const

/* ============================================================
   动画 Variants 模式库
   ============================================================ */

// 淡入上移 — 通用入场
export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
}

// 弹性缩放 — 模态框、弹出卡片
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1,   transition: { type: 'spring', stiffness: 400, damping: 25 } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: appleEase } },
}

// 页面路由过渡 — 右进左出
export const pageTransition: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0,  transition: { type: 'spring', stiffness: 260, damping: 40 } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.18, ease: appleEase } },
}

// 模态框遮罩
export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2,  ease: appleEase } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: appleEase } },
}

// 模态框内容
export const modalVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: gentle },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

// 错开入场：父容器（只编排时序，子项各自处理 opacity）
export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

// 错开入场：子项（只做 y 位移，不做 opacity，避免移动端闪烁）
export const staggerItem: Variants = {
  hidden:  { y: 20 },
  visible: { y: 0, transition: { type: 'spring', stiffness: 350, damping: 30 } },
}

// 悬停提升 — Apple Card 效果（配合 whileHover 使用）
export const hoverLift = {
  scale: 1.015,
  y: -3,
  transition: snappy,
}

// 点击回弹（配合 whileTap 使用）
export const tapPress = {
  scale: 0.97,
  transition: { type: 'spring', stiffness: 500, damping: 30 },
}
