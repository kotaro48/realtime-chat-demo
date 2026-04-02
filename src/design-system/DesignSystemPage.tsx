/**
 * [INPUT]: 无外部依赖，纯展示页面
 * [OUTPUT]: DesignSystemPage 组件
 * [POS]: design-system 模块的入口，展示所有升级后的微拟物组件变体
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion } from 'framer-motion'              // framer-motion: 动效展示
import { Button } from '@/components/ui/button'    // 微拟物渐变按钮
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'  // 凸起/凹陷卡片
import { Input } from '@/components/ui/input'      // 凹陷输入框
import { Badge } from '@/components/ui/badge'      // 渐变徽章
import { PageWrapper } from '@/components/PageWrapper'  // 页面入场包装器
import { staggerContainer, staggerItem, hoverLift, tapPress, scaleIn, fadeInUp } from '@/lib/motion'  // Apple Spring 配置
import { Heart, Send, Star, Plus } from 'lucide-react'  // lucide-react：图标

/* ============================================================
   设计系统展示页
   - 每个 Section 展示一个组件的所有变体
   - 用于验证微拟物光影效果是否正确
   ============================================================ */
export function DesignSystemPage() {
  return (
    <PageWrapper>
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mx-auto max-w-2xl space-y-12">

        {/* 页面标题 */}
        <motion.div className="space-y-1" variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="text-2xl font-bold text-foreground">Design System</h1>
          <p className="text-sm text-muted-foreground">微拟物光影质感 — 渐变 + 3D阴影 + Apple Spring 动效</p>
        </motion.div>

        {/* ---- Motion ---- */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Motion — Apple Spring</h2>

          {/* 错开入场 */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">错开入场 stagger（刷新页面查看效果）</p>
            <motion.div
              className="grid grid-cols-3 gap-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {['Spring', 'Damping', 'Stiffness', 'Mass', 'Inertia', 'Bounce'].map(label => (
                <motion.div
                  key={label}
                  variants={staggerItem}
                  className="rounded-2xl bg-muted p-3 text-center text-sm font-medium text-foreground"
                >
                  {label}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* 悬停提升 + 点击回弹 */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">悬停提升 + 点击回弹（hover / tap）</p>
            <div className="flex gap-3 flex-wrap">
              <motion.div
                whileHover={hoverLift}
                whileTap={tapPress}
                className="rounded-2xl text-primary-foreground px-6 py-3 text-sm font-medium cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent)',
                }}
              >
                Hover me
              </motion.div>
              <motion.div
                whileHover={hoverLift}
                whileTap={tapPress}
                className="rounded-2xl border border-border bg-card px-6 py-3 text-sm font-medium cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)' }}
              >
                Tap me
              </motion.div>
            </div>
          </div>

          {/* 弹性缩放 whileInView */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">弹性缩放 scaleIn（whileInView 触发）</p>
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)' }}
            >
              滚动到此处触发弹性入场 — stiffness: 400, damping: 25
            </motion.div>
          </div>
        </section>

        {/* ---- Button ---- */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Button</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Heart className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button isLoading>Loading</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>左图标</Button>
            <Button rightIcon={<Send className="h-4 w-4" />}>右图标</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* ---- Card ---- */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Card</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card variant="raised">
              <CardHeader>
                <CardTitle>Raised Card</CardTitle>
                <CardDescription>凸起变体，外投影 + 顶部高光</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">默认变体，适用于内容卡片、列表项。</p>
              </CardContent>
            </Card>
            <Card variant="inset">
              <CardHeader>
                <CardTitle>Inset Card</CardTitle>
                <CardDescription>凹陷变体，内阴影</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">凹陷变体，适用于表单区域、次级容器。</p>
              </CardContent>
            </Card>
            <Card variant="flat">
              <CardHeader>
                <CardTitle>Flat Card</CardTitle>
                <CardDescription>无装饰变体，纯边框</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">嵌套场景使用，避免阴影叠加。</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ---- Input ---- */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Input</h2>
          <div className="space-y-3 max-w-sm">
            <Input placeholder="默认输入框（凹陷效果）" />
            <Input type="email" placeholder="邮箱地址" />
            <Input type="password" placeholder="密码" />
            <Input disabled placeholder="Disabled 状态" />
          </div>
        </section>

        {/* ---- Badge ---- */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Badge</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="oshi">KASUMI.K</Badge>
            <Badge variant="oshi">YUKI.O</Badge>
            <Badge variant="oshi">HARUKA.S</Badge>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="default"><Star className="h-3 w-3 mr-1" />未読 12</Badge>
            <Badge variant="default">NEW</Badge>
            <Badge variant="secondary">論文</Badge>
          </div>
        </section>

      </div>
    </div>
    </PageWrapper>
  )
}
