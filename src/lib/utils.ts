import { clsx, type ClassValue } from 'clsx' // clsx：将多个 className 合并成一个字符串
import { twMerge } from 'tailwind-merge'       // tailwind-merge：解决 Tailwind class 冲突（如同时有 p-2 和 p-4，保留后者）

// cn() 是 shadcn/ui 全项目通用的 className 合并工具函数
// 用法示例：cn('text-red-500', isActive && 'font-bold', 'p-4')
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
