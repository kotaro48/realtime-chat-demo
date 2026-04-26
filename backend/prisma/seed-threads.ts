import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const boards = await prisma.board.findMany()
  const boardMap = Object.fromEntries(boards.map(b => [b.slug, b.id]))

  let user = await prisma.user.findFirst({ where: { email: 'test@test.com' } })
  if (!user) {
    user = await prisma.user.create({
      data: { email: 'test@test.com', nickname: 'テストユーザー', passwordHash: 'x', avatarColor: '#6D28D9' }
    })
  }

  const threads = [
    { boardSlug: 'general',   title: '【速報】新シングル選抜メンバー発表！！！！今すぐチェック',            posts: 120 },
    { boardSlug: 'stage48',   title: '柏木由紀 卒業公演セットリスト完全版まとめ',                       posts: 63 },
    { boardSlug: 'handshake', title: '握手会 幕張メッセ 整理番号配布方法まとめ',                       posts: 42 },
    { boardSlug: 'photo',     title: '推しの生写真が当たった！神引きセット見せて',                       posts: 38 },
    { boardSlug: 'general',   title: '【AKB48】46th ドラフト候補生 予想スレ #7',                       posts: 27 },
    { boardSlug: 'general',   title: '向井地美音センター曲のパフォーマンスが神がかってる件について語るスレ Part.3', posts: 84 },
    { boardSlug: 'stage48',   title: '山内瑞葵 ソロコン 2026 セトリ情報収集スレ',                       posts: 15 },
    { boardSlug: 'photo',     title: '最新グラビア写真感想スレ',                                       posts: 12 },
  ]

  for (const t of threads) {
    const thread = await prisma.thread.create({
      data: { title: t.title, boardId: boardMap[t.boardSlug], authorId: user.id }
    })
    const postData = Array.from({ length: t.posts }, (_, i) => ({
      content: `レス${i + 1}`,
      threadId: thread.id,
      authorId: user.id,
    }))
    await prisma.post.createMany({ data: postData })
    process.stdout.write(`✓ ${t.title.slice(0, 20)}… (${t.posts})\n`)
  }
  console.log('Done!')
}
main().finally(() => prisma.$disconnect())
