// 论坛引用链业务逻辑
// 从组件中抽离，可在 Web 和移动端复用

import type { Post } from '../../types'

// 递归构建引用链：从最远祖先到直接父楼，返回有序数组
export function buildQuoteChain(replyToId: string, allPosts: Post[]): Post[] {
  const parent = allPosts.find(p => p.id === replyToId)
  if (!parent) return []
  if (parent.replyTo) {
    return [...buildQuoteChain(parent.replyTo.id, allPosts), parent]
  }
  return [parent]
}
