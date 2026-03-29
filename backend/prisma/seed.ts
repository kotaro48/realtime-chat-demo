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
      title: '山下美月 卒業コンサート 感想スレ',
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
        '昨日のコンサート本当に最高だった。最後の「君は僕だ」で泣いてしまいました。\nセンターを務めた美月さん、本当にお疲れ様でした。7年間ありがとう。',
      threadId: thread1.id,
      authorId: tomo.id,
    },
  })

  const post2 = await prisma.post.upsert({
    where: { id: 'seed-post-2' },
    update: {},
    create: {
      id: 'seed-post-2',
      content:
        'わかりすぎる。アンコールの演出も素晴らしかったですよね。スタンドのペンライトがピンク一色になった瞬間、鳥肌が止まらなかった。',
      threadId: thread1.id,
      authorId: momoka.id,
      replyToId: post1.id,
    },
  })

  await prisma.post.upsert({
    where: { id: 'seed-post-3' },
    update: {},
    create: {
      id: 'seed-post-3',
      content:
        '運営のセトリ選びが今回は本当によかった。初期の曲から最新シングルまでバランスよく入ってたし、ファンへのメッセージを感じる構成でした。',
      threadId: thread1.id,
      authorId: karin.id,
    },
  })

  const thread2 = await prisma.thread.upsert({
    where: { id: 'seed-thread-2' },
    update: {},
    create: {
      id: 'seed-thread-2',
      title: '【速報】53rd シングル選抜発表まとめ',
      boardId: generalBoard.id,
      authorId: momoka.id,
    },
  })

  await prisma.post.upsert({
    where: { id: 'seed-post-4' },
    update: {},
    create: {
      id: 'seed-post-4',
      content:
        '選抜メンバー発表されましたね。今回の構成について皆さんどう思いますか？個人的には新センターの抜擢が意外でした。',
      threadId: thread2.id,
      authorId: momoka.id,
    },
  })

  // ── AKB48 成员种子数据 ────────────────────────────────────
  const memberData = [
    // Team A
    { id: 'member-yui',     name: '小栗有以',   nameKana: 'おぐりゆい',     team: 'Team A' },
    { id: 'member-yurina',  name: '行天優莉奈', nameKana: 'ぎょうてんゆりな', team: 'Team A' },
    { id: 'member-seina',   name: '福岡聖菜',   nameKana: 'ふくおかせいな', team: 'Team A' },
    { id: 'member-maho',    name: '大盛真歩',   nameKana: 'おおもりまほ',   team: 'Team A' },
    { id: 'member-ayami',   name: '長友彩海',   nameKana: 'ながともあやみ', team: 'Team A' },
    // Team K
    { id: 'member-kurumi',  name: '鈴木くるみ', nameKana: 'すずきくるみ',   team: 'Team K' },
    // Team B
    { id: 'member-kasumi',  name: '工藤華純',   nameKana: 'くどうかすみ',   team: 'Team B' },
    { id: 'member-saho',    name: '岩立沙穂',   nameKana: 'いわたてさほ',   team: 'Team B' },
    // Team 4
    { id: 'member-mizuki',  name: '山内瑞葵',   nameKana: 'やまうちみずき', team: 'Team 4' },
    { id: 'member-miu',     name: '下尾みう',   nameKana: 'しもおみう',     team: 'Team 4' },
    { id: 'member-haruka4', name: '坂川陽香',   nameKana: 'さかがわはるか', team: 'Team 4' },
  ]

  for (const m of memberData) {
    await prisma.member.upsert({
      where: { id: m.id },
      update: { name: m.name, nameKana: m.nameKana, team: m.team },
      create: m,
    })
  }

  console.log('Members created:', memberData.length)

  // thread の updatedAt を post に合わせて更新
  await prisma.thread.update({ where: { id: thread1.id }, data: { updatedAt: new Date() } })
  await prisma.thread.update({ where: { id: thread2.id }, data: { updatedAt: new Date() } })

  console.log('Threads & posts created.')
  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
