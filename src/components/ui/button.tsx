/**
 * [INPUT]: variant, size, isLoading, leftIcon, rightIcon, asChild, className, style
 * [OUTPUT]: Button 组件、buttonVariants 工具函数
 * [POS]: components/ui 的核心交互原语，被全局所有 CTA 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'                       // @radix-ui/react-slot：让组件可以把样式转移给子元素
import { cva, type VariantProps } from 'class-variance-authority' // class-variance-authority：管理多种样式变体
import { Loader2 } from 'lucide-react'                           // lucide-react：loading 图标
import { cn } from '@/lib/utils'                                  // 本项目工具函数：合并 className

/* ============================================================
   渐变 + 3D 阴影配置表
   - 凸起元素：外投影 + 顶部高光 + 底部暗边
   - 所有颜色通过 CSS 变量 + color-mix 派生，禁止硬编码
   ============================================================ */
const BUTTON_STYLES: Record<string, {
  background: string
  boxShadow: string
  hoverBoxShadow: string
}> = {
  default: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  secondary: {
    background: 'linear-gradient(135deg, rgb(var(--secondary)) 0%, color-mix(in srgb, rgb(var(--secondary)) 85%, black) 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.06)',
    hoverBoxShadow: '0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.08)',
  },
  destructive: {
    background: 'linear-gradient(135deg, rgb(var(--destructive)) 0%, color-mix(in srgb, rgb(var(--destructive)) 80%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, rgb(var(--destructive)) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
    hoverBoxShadow: '0 6px 20px color-mix(in srgb, rgb(var(--destructive)) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)',
  },
  outline: {
    background: 'linear-gradient(135deg, rgb(var(--background)) 0%, color-mix(in srgb, rgb(var(--background)) 92%, black) 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.05)',
    hoverBoxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.07)',
  },
}

// ghost 和 link 不需要渐变阴影
const FLAT_VARIANTS = new Set(['ghost', 'link'])

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap text-sm font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:     'text-primary-foreground rounded-2xl',
        destructive: 'text-destructive-foreground rounded-2xl',
        outline:     'border border-input text-foreground rounded-2xl',
        secondary:   'text-secondary-foreground rounded-2xl',
        ghost:       'hover:bg-accent hover:text-accent-foreground rounded-2xl',
        link:        'underline-offset-4 hover:underline text-primary',
      },
      size: {
        sm:      'h-8 px-4 text-xs rounded-xl',
        default: 'h-9 px-5 py-2 rounded-2xl',
        md:      'h-10 px-6 py-2.5 rounded-2xl',
        lg:      'h-12 px-10 rounded-2xl',
        xl:      'h-14 px-12 py-4 text-lg rounded-3xl',
        icon:    'h-10 w-10 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, isLoading = false, leftIcon, rightIcon, children, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const [isHovered, setIsHovered] = React.useState(false)

    const styleConfig = BUTTON_STYLES[variant as string]
    const needsCustomStyle = !FLAT_VARIANTS.has(variant as string) && !!styleConfig

    const combinedStyle: React.CSSProperties = needsCustomStyle ? {
      background: styleConfig.background,
      boxShadow: isHovered ? styleConfig.hoverBoxShadow : styleConfig.boxShadow,
      ...style,
    } : { ...style }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        style={combinedStyle}
        onMouseEnter={(e) => { setIsHovered(true); props.onMouseEnter?.(e) }}
        onMouseLeave={(e) => { setIsHovered(false); props.onMouseLeave?.(e) }}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
