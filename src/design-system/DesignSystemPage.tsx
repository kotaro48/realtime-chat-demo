/**
 * [INPUT]: 无外部依赖，纯展示页面
 * [OUTPUT]: DesignSystemPage 组件
 * [POS]: design-system 模块的入口，展示所有升级后的微拟物组件变体
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'  // framer-motion: 动效展示
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageWrapper } from '@/components/PageWrapper'
import { staggerContainer, staggerItem, hoverLift, tapPress, scaleIn, fadeInUp, gentle } from '@/lib/motion'
import { Heart, Send, Star, Plus, RotateCcw } from 'lucide-react'

/* ============================================================
   stagger 演示子组件：支持重播
   - 用 key 强制重新挂载，动画从头播放
   ============================================================ */
function StaggerDemo() {
  const [key, setKey] = useState(0)
  const labels = ['Spring', 'Damping', 'Stiffness', 'Mass', 'Inertia', 'Bounce']

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">错开入场 — 每项延迟 60ms 依次弹出</p>
        <button
          onClick={() => setKey(k => k + 1)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          重播
        </button>
      </div>
      <motion.div
        key={key}
        className="grid grid-cols-3 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {labels.map(label => (
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
  )
}

/* ============================================================
   scaleIn 演示子组件：支持重播
   ============================================================ */
function ScaleInDemo() {
  const controls = useAnimation()
  const [playing, setPlaying] = useState(false)

  async function replay() {
    if (playing) return
    setPlaying(true)
    await controls.start('hidden')
    await controls.start('visible')
    setPlaying(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">弹性缩放 — 从 0.92 弹到 1.0</p>
        <button
          onClick={replay}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          重播
        </button>
      </div>
      <motion.div
        animate={controls}
        variants={scaleIn}
        initial="visible"
        className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground font-medium"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)' }}
      >
        scale: 0.92 → 1.0 &nbsp;·&nbsp; opacity: 0 → 1 &nbsp;·&nbsp; spring stiffness: 400
      </motion.div>
    </div>
  )
}

/* ============================================================
   fadeInUp 演示子组件：支持重播
   ============================================================ */
function FadeInUpDemo() {
  const [key, setKey] = useState(0)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">淡入上移 — y: 24px → 0，同时 opacity: 0 → 1</p>
        <button
          onClick={() => setKey(k => k + 1)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          重播
        </button>
      </div>
      <motion.div
        key={key}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground font-medium"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)' }}
      >
        从下方 24px 处弹入 &nbsp;·&nbsp; spring stiffness: 300, damping: 30
      </motion.div>
    </div>
  )
}

/* ============================================================
   模态框演示子组件
   ============================================================ */
function ModalDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">模态框 — 背景淡入 + 内容弹性展开</p>
      <Button size="sm" onClick={() => setOpen(true)}>打开模态框</Button>

      <AnimatePresence>
        {open && (
          <>
            {/* 遮罩 */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setOpen(false)}
            />
            {/* 内容 */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: gentle }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 rounded-2xl bg-card p-6 max-w-sm mx-auto"
              style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.8)' }}
            >
              <h3 className="font-semibold text-foreground mb-2">模态框弹性展开</h3>
              <p className="text-sm text-muted-foreground mb-4">
                scale: 0.92 → 1.0 &nbsp;·&nbsp; y: 24 → 0<br />
                spring stiffness: 300, damping: 35
              </p>
              <Button size="sm" onClick={() => setOpen(false)}>关闭</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================================================
   主页面
   ============================================================ */
export function DesignSystemPage() {
  return (
    <PageWrapper>
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mx-auto max-w-2xl space-y-12">

        <motion.div className="space-y-1" variants={fadeInUp} initial="hidden" animate="visible">
          <h1 className="text-2xl font-bold text-foreground">Design System</h1>
          <p className="text-sm text-muted-foreground">微拟物光影质感 — 渐变 + 3D阴影 + Apple Spring 动效</p>
        </motion.div>

        {/* ---- Motion ---- */}
        <section className="space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Motion — Apple Spring</h2>
          <StaggerDemo />
          <FadeInUpDemo />
          <ScaleInDemo />
          <ModalDemo />
          {/* 悬停提升 + 点击回弹 */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">悬停提升 + 点击回弹 — hover: y -3px / scale 1.015，tap: scale 0.97</p>
            <div className="flex gap-3 flex-wrap">
              <motion.div
                whileHover={hoverLift}
                whileTap={tapPress}
                className="rounded-2xl text-primary-foreground px-6 py-3 text-sm font-medium cursor-pointer select-none"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent)',
                }}
              >
                Hover / Tap me
              </motion.div>
              <motion.div
                whileHover={hoverLift}
                whileTap={tapPress}
                className="rounded-2xl border border-border bg-card px-6 py-3 text-sm font-medium cursor-pointer select-none"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)' }}
              >
                Hover / Tap me
              </motion.div>
            </div>
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
