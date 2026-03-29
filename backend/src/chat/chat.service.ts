import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const HISTORY_LIMIT = 50;

// 消息查询 select（getHistory / saveMessage 共用）
const MESSAGE_SELECT = {
  id: true,
  content: true,
  createdAt: true,
  author: {
    select: { id: true, nickname: true, avatarColor: true },
  },
  replyTo: {
    select: {
      id: true,
      content: true,
      author: { select: { nickname: true } },
    },
  },
  reactions: {
    select: { emoji: true, userId: true },
  },
} as const;

// 将 Prisma 返回的 reactions 数组聚合为 { emoji, count, userIds } 格式
function groupReactions(
  reactions: { emoji: string; userId: string }[],
): { emoji: string; count: number; userIds: string[] }[] {
  const map = new Map<string, string[]>();
  for (const r of reactions) {
    if (!map.has(r.emoji)) map.set(r.emoji, []);
    map.get(r.emoji)!.push(r.userId);
  }
  return Array.from(map.entries()).map(([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
    userIds,
  }));
}

// 格式化单条消息（getHistory / saveMessage / toggleReaction 共用）
export function formatMessage(raw: {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; nickname: string; avatarColor: string };
  replyTo: { id: string; content: string; author: { nickname: string } } | null;
  reactions: { emoji: string; userId: string }[];
}) {
  return {
    id:        raw.id,
    content:   raw.content,
    createdAt: raw.createdAt,
    author:    raw.author,
    replyTo:   raw.replyTo ?? null,
    reactions: groupReactions(raw.reactions),
  };
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(roomId: string) {
    const rows = await this.prisma.chatMessage.findMany({
      where: { roomId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
      select: MESSAGE_SELECT,
    });
    return rows.reverse().map(formatMessage);
  }

  async saveMessage(
    roomId: string,
    authorId: string,
    content: string,
    replyToId?: string,
  ) {
    const raw = await this.prisma.chatMessage.create({
      data: { roomId, authorId, content, replyToId: replyToId ?? null },
      select: MESSAGE_SELECT,
    });
    return formatMessage(raw);
  }

  // emoji toggle：有则删除，无则新增；返回该消息最新的聚合 reactions
  async toggleReaction(userId: string, messageId: string, emoji: string) {
    const existing = await this.prisma.reaction.findUnique({
      where: { userId_chatMessageId_emoji: { userId, chatMessageId: messageId, emoji } },
    });

    if (existing) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.reaction.create({
        data: { userId, chatMessageId: messageId, emoji },
      });
    }

    // 返回该消息最新的所有 reactions
    const reactions = await this.prisma.reaction.findMany({
      where: { chatMessageId: messageId },
      select: { emoji: true, userId: true },
    });
    return { messageId, reactions: groupReactions(reactions) };
  }
}
