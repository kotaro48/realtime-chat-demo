/**
 * [INPUT]: variant, className — 标准 HTMLDivElement 属性
 * [OUTPUT]: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 * [POS]: components/ui 的容器原语，提供 raised（凸起）和 inset（凹陷）两种变体
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority' // class-variance-authority：管理凸起/凹陷变体
import { cn } from '@/lib/utils'

/* ============================================================
   Card 变体阴影系统
   - raised：凸起卡片，外投影 + 顶部高光
   - inset：凹陷卡片，内阴影
   ============================================================ */
const cardVariants = cva(
  'rounded-2xl bg-card text-card-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        // 默认凸起：带渐变边框感 + 三层阴影
        raised: [
          'border border-border',
          '[box-shadow:0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.04)]',
          'hover:[box-shadow:0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.06)]',
        ].join(' '),
        // 凹陷：内阴影，用于表单区域或次级容器
        inset: [
          'border border-border/60',
          '[box-shadow:inset_0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(0,0,0,0.04)]',
          'bg-muted/50',
        ].join(' '),
        // 无装饰：纯边框，用于嵌套场景
        flat: 'border border-border',
      },
    },
    defaultVariants: {
      variant: 'raised',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
