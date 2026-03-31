import { PrismaClient } from '@prisma/client'

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
  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
