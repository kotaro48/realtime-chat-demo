/**
 * [INPUT]: children — 页面内容
 * [OUTPUT]: PageWrapper 组件
 * [POS]: components 的页面动画包装器，所有路由页面套此组件实现统一入场过渡
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion } from 'framer-motion'  // framer-motion: 动画库
import { pageTransition } from '@/lib/motion'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

// 所有页面的统一入场包装器
// 配合 App.tsx 的 AnimatePresence 实现路由切换动画
export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}
