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

  // ── 毎日深夜 2 時（JST）に自動同期 ──────────────────────────────────
  // CronExpression.EVERY_DAY_AT_2AM = '0 2 * * *'（UTC、JST は+9）
  @Cron('0 17 * * *')  // UTC 17:00 = JST 02:00
  async scheduledSync() {
    this.logger.log('Running scheduled AKB48 schedule sync...');
    const { total } = await this.syncUpcoming();
    this.logger.log(`Scheduled sync complete: ${total} events`);
  }
}
