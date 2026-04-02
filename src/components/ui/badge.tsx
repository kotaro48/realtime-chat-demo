/**
 * [INPUT]: variant, className — 标准 HTMLDivElement 属性
 * [OUTPUT]: Badge 组件、badgeVariants 工具函数
 * [POS]: components/ui 的标签原语，渐变背景 + 大圆角，用于通知数、推し标签等
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority' // class-variance-authority：管理多种变体
import { cn } from '@/lib/utils'

/* ============================================================
   Badge 渐变系统
   - default：accent 渐变，用于 CTA 数量、推し标签
   - secondary：中性渐变，用于普通标签
   - oshi：专用推し Badge（JetBrains Mono 等宽字体）
   ============================================================ */
const badgeVariants = cva(
  [
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'border-transparent text-primary-foreground',
        secondary: 'border border-border text-secondary-foreground',
        destructive: 'border-transparent text-destructive-foreground',
        outline: 'border border-border text-foreground',
        // 推し Badge — 粉玫瑰 accent + 等宽字体
        oshi: 'border font-mono text-[10px] tracking-[.04em]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// 各变体的 inline style（渐变和阴影无法通过 Tailwind 完整表达）
const BADGE_STYLES: Record<string, React.CSSProperties> = {
  default: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 75%, black) 100%)',
    boxShadow: '0 2px 6px color-mix(in srgb, var(--primary) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  secondary: {
    background: 'linear-gradient(135deg, rgb(var(--secondary)) 0%, color-mix(in srgb, rgb(var(--secondary)) 88%, black) 100%)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
  },
  destructive: {
    background: 'linear-gradient(135deg, rgb(var(--destructive)) 0%, color-mix(in srgb, rgb(var(--destructive)) 75%, black) 100%)',
    boxShadow: '0 2px 6px color-mix(in srgb, rgb(var(--destructive)) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2)',
  },
  oshi: {
    color: 'rgb(var(--accent))',
    background: 'rgb(var(--accent-bg))',
    border: '1px solid color-mix(in srgb, rgb(var(--accent)) 30%, transparent)',
  },
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant = 'default', style, ...props }: BadgeProps) {
  const badgeStyle = BADGE_STYLES[variant as string] ?? {}
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...badgeStyle, ...style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
