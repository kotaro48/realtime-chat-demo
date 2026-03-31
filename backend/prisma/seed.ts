import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // ── 版块 ──────────────────────────────────────────────────
  const boards = await Promise.all([
    prisma.board.upsert({
      where: { slug: 'general' },
      update: {},
      create: { slug: 'general', name: '総合', description: 'AKB48 全般の話題' },
    }),
    prisma.board.upsert({
      where: { slug: 'stage48' },
      update: {},
      create: { slug: 'stage48', name: 'Stage48', description: '劇場公演・セットリスト' },
    }),
    prisma.board.upsert({
      where: { slug: 'handshake' },
      update: {},
      create: { slug: 'handshake', name: '握手会', description: '握手・ミート情報' },
    }),
    prisma.board.upsert({
      where: { slug: 'photo' },
      update: {},
      create: { slug: 'photo', name: '写真', description: '生写真・グラビア情報' },
    }),
  ])

  console.log('Boards created:', boards.map(b => b.slug))

  // ── 测试用户 ──────────────────────────────────────────────
  const testPasswordHash = await bcrypt.hash('test1234', 10)

  const users = await Promise.all([
    // 可用邮箱+密码登录的测试账号
    prisma.user.upsert({
      where: { email: 'test@akb48.com' },
      update: {},
      create: {
        email: 'test@akb48.com',
        nickname: 'テストユーザー',
        passwordHash: testPasswordHash,
        avatarColor: '#0F0F0F',
      },
    }),
    prisma.user.upsert({
      where: { googleId: 'seed-user-1' },
      update: {},
      create: {
        googleId: 'seed-user-1',
        email: 'tomo@example.com',
        nickname: 'tomo_fan',
        avatarColor: '#8C1F1F',
      },
    }),
    prisma.user.upsert({
      where: { googleId: 'seed-user-2' },
      update: {},
      create: {
        googleId: 'seed-user-2',
        email: 'momoka@example.com',
        nickname: 'momoka_48',
        avatarColor: '#3E3F46',
      },
    }),
    prisma.user.upsert({
      where: { googleId: 'seed-user-3' },
      update: {},
      create: {
        googleId: 'seed-user-3',
        email: 'karin@example.com',
        nickname: 'karin_stg',
        avatarColor: '#6E6F78',
      },
    }),
  ])

  console.log('Users created:', users.map(u => u.nickname))

  // ── 総合版块的帖子 ────────────────────────────────────────
  const generalBoard = boards[0]
  const [, tomo, momoka, karin] = users

  const thread1 = await prisma.thread.upsert({
    where: { id: 'seed-thread-1' },
    update: {},
    create: {
      id: 'seed-thread-1',
      title: 'ジャニア　鈴木　田口 感想スレ',
      boardId: generalBoard.id,
      authorId: tomo.id,
    },
  })

  // 第一楼
  const post1 = await prisma.post.upsert({
    where: { id: 'seed-post-1' },
    update: {},
    create: {
      id: 'seed-post-1',
      content:
        '卒業お願い',
      threadId: thread1.id,
      authorId: tomo.id,
    },
  })

  await prisma.post.upsert({
    where: { id: 'seed-post-2' },
    update: {},
    create: {
      id: 'seed-post-2',
      content:
        '裏山しい',
      threadId: thread1.id,
      authorId: momoka.id,
      replyToId: post1.id,
    },
  })

  



  // thread の updatedAt を post に合わせて更新
  await prisma.thread.update({ where: { id: thread1.id }, data: { updatedAt: new Date() } })
  console.log('Threads & posts created.')
  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
