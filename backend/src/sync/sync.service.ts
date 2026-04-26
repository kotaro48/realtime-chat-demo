import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

// 日期字符串转 Date，空字符串或无效值返回 null
function toDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// AKB48 API の 1 イベント
interface AkbEvent {
  schedule_id: string;
  title: string;
  body?: string;
  category: string;
  parent_category?: string;
  date: string;           // "2026-03-01 13:00:00"
  end_date?: string;
  open_date?: string;
  member?: string;        // "152,153,..." AKB48 内部成员 ID
  css_class?: string;
  article_image?: string;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  // ── 单月同步 ──────────────────────────────────────────────────────────
  // 流程：先 GET 官网取 PHPSESSID → 用 cookie POST calendar API → upsert DB
  async syncMonth(year: number, month: number): Promise<number> {
    // 1. 访问日程页面，获取 PHPSESSID（官网需要会话 cookie）
    let sessionCookie = '';
    try {
      const pageRes = await fetch('https://www.akb48.co.jp/about/schedule', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
          'Accept-Language': 'ja,en;q=0.9',
        },
      });
      const setCookie = pageRes.headers.get('set-cookie') ?? '';
      const match = setCookie.match(/PHPSESSID=([^;]+)/);
      if (match) sessionCookie = `PHPSESSID=${match[1]}`;
    } catch (e) {
      this.logger.warn(`Failed to get session cookie: ${e}`);
    }

    // 2. POST to calendar API with multipart/form-data
    // category=null は全カテゴリ取得を意味する
    const form = new FormData();
    form.append('year', String(year));
    form.append('month', String(month));
    form.append('category', 'null');

    const res = await fetch('https://www.akb48.co.jp/public/api/schedule/calendar/', {
      method: 'POST',
      headers: {
        'Referer': 'https://www.akb48.co.jp/about/schedule',
        'Origin':  'https://www.akb48.co.jp',
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      },
      body: form,
    });

    if (!res.ok) {
      this.logger.warn(`AKB48 API returned ${res.status} for ${year}/${month}`);
      return 0;
    }

    const json = await res.json() as { result: string; data?: Record<string, Record<string, AkbEvent[]>> };
    if (json.result !== 'ok' || !json.data) return 0;

    // 3. レスポンス構造：data.thismonth["2026_3_1"] = [events...]
    // thismonth / nextmonth 両方を平坦化して収集
    const events: AkbEvent[] = Object.values(json.data)          // thismonth, nextmonth...
      .flatMap(monthGroup => Object.values(monthGroup))           // "2026_3_1" のグループ
      .flat();                                                    // 各グループ内の配列

    if (events.length === 0) return 0;

    // 4. DB に upsert（schedule_id をキーに重複排除）
    for (const e of events) {
      await this.prisma.officialEvent.upsert({
        where: { id: e.schedule_id },
        create: {
          id:             e.schedule_id,
          title:          e.title,
          body:           e.body           ?? null,
          category:       e.category,
          parentCategory: e.parent_category ?? null,
          date:           toDate(e.date) ?? new Date(),
          endDate:        toDate(e.end_date),
          openDate:       toDate(e.open_date),
          memberCodes:    e.member         ?? null,
          cssClass:       e.css_class      ?? null,
          articleImage:   e.article_image  ?? null,
        },
        update: {
          title:          e.title,
          body:           e.body           ?? null,
          category:       e.category,
          parentCategory: e.parent_category ?? null,
          date:           toDate(e.date) ?? new Date(),
          endDate:        toDate(e.end_date),
          openDate:       toDate(e.open_date),
          memberCodes:    e.member         ?? null,
          cssClass:       e.css_class      ?? null,
          articleImage:   e.article_image  ?? null,
        },
      });
    }

    this.logger.log(`Synced ${events.length} events for ${year}/${month}`);
    return events.length;
  }

  // ── 指定月份查询（前端日历用）────────────────────────────────────────
  async getMonthEvents(year: number, month: number, cssClass?: string) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 1);     // 下月1日（不含）
    return this.prisma.officialEvent.findMany({
      where: {
        date: { gte: start, lt: end },
        ...(cssClass ? { cssClass } : {}),
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        date: true,
        endDate: true,
        cssClass: true,
        category: true,
        parentCategory: true,
        articleImage: true,
      },
    });
  }

  // ── 当月 + 来月 + 再来月 をまとめて同期 ──────────────────────────────
  async syncUpcoming(): Promise<{ total: number }> {
    const now = new Date();
    let total = 0;
    for (let offset = 0; offset < 3; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      total += await this.syncMonth(d.getFullYear(), d.getMonth() + 1);
    }
    return { total };
  }

  // ── 成员数据同步：抓取 AKB48 官网成员列表 HTML，解析后 upsert ────────
  async syncMembers(): Promise<{ count: number }> {
    // 分别抓正规成员和研究生两个页面
    const urls = [
      { url: 'https://www.akb48.co.jp/about/members/?class=0', team: null },
      { url: 'https://www.akb48.co.jp/about/members/?class=1', team: '研究生' },
    ];

    let count = 0;

    for (const { url, team: defaultTeam } of urls) {
      let html = '';
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
            'Accept-Language': 'ja,en;q=0.9',
          },
        });
        html = await res.text();
      } catch (e) {
        this.logger.warn(`Failed to fetch member list from ${url}: ${e}`);
        continue;
      }

      // 按 <li class="memberList gridMem"> 切分，逐个解析成员块
      const blocks = html.split('<li class="memberList gridMem">').slice(1);

      for (const block of blocks) {
        // mid: /about/members/detail?mid=110
        const midMatch = block.match(/\?mid=(\d+)/);
        if (!midMatch) continue;
        const memberId = midMatch[1];

        // 日文名：<p class="name clrPink SubTitle fwBold">岩立 沙穂</p>
        const nameMatch = block.match(/class="name clrPink SubTitle fwBold">([^<]+)<\/p>/);
        if (!nameMatch) continue;
        const name = nameMatch[1].trim();

        // 英文名：<p class="enName enGothic clrPink MTxt">Saho Iwatate</p>
        const nameEnMatch = block.match(/class="enName enGothic clrPink MTxt">([^<]+)<\/p>/);
        const nameEn = nameEnMatch ? nameEnMatch[1].trim() : null;

        // 期生 / 研究生：<span class="teamName">13期生</span>
        const teamMatch = block.match(/<span class="teamName">([^<]+)<\/span>/);
        const team = teamMatch ? teamMatch[1].trim() : defaultTeam;

        // 头像：<figure class="ShapeR2 memberImg"><img src="https://...jpg" alt="...">
        const imgMatch = block.match(/class="ShapeR2 memberImg"><img\s+src="([^"]+)"/);
        const imageUrl = imgMatch ? imgMatch[1].trim() : null;

        await this.prisma.member.upsert({
          where: { memberId },
          create: { memberId, name, nameEn, team, imageUrl, isActive: true },
          update: { name, nameEn, team, imageUrl },
        });
        count++;
      }
    }

    this.logger.log(`Synced ${count} members`);
    return { count };
  }

  // ── 毎日深夜 2 時（JST）に自動同期 ──────────────────────────────────
  // CronExpression.EVERY_DAY_AT_2AM = '0 2 * * *'（UTC、JST は+9）
  @Cron('0 17 * * *')  // UTC 17:00 = JST 02:00
  async scheduledSync() {
    this.logger.log('Running scheduled AKB48 schedule sync...');
    const { total } = await this.syncUpcoming();
    this.logger.log(`Scheduled sync complete: ${total} events`);
  }
}
