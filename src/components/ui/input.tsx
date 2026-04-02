/**
 * [INPUT]: 标准 HTMLInputElement 属性（type, placeholder, value 等）
 * [OUTPUT]: Input 组件
 * [POS]: components/ui 的表单原语，凹陷内阴影效果，与 Button 凸起形成对比
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

/* ============================================================
   Input 凹陷效果
   - 内阴影模拟下沉感，与凸起的 Button 形成视觉对比
   - focus 时阴影加深 + ring 强调
   ============================================================ */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-2xl border border-input px-3 py-2',
          'bg-muted/40 text-base text-foreground',
          'placeholder:text-muted-foreground',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'md:text-sm',
          className
        )}
        style={{
          // 凹陷三层内阴影
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08), inset 0 1px 2px rgba(0,0,0,0.04)',
          ...style,
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
