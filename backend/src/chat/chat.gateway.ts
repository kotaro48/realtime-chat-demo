import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface AuthPayload {
  sub: string;
  email: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly roomUsers  = new Map<string, Set<string>>();   // roomId → userId Set
  private readonly socketMeta = new Map<string, { userId: string; roomId: string }>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) { client.disconnect(); return; }
    try {
      const payload = this.jwtService.verify<AuthPayload>(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const meta = this.socketMeta.get(client.id);
    if (!meta) return;
    this.socketMeta.delete(client.id);
    const users = this.roomUsers.get(meta.roomId);
    if (users) {
      users.delete(meta.userId);
      this.broadcastOnlineCount(meta.roomId);
    }
  }

  @SubscribeMessage('room:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const userId = client.data.userId as string;
    const { roomId } = payload;

    client.join(roomId);
    this.socketMeta.set(client.id, { userId, roomId });

    if (!this.roomUsers.has(roomId)) this.roomUsers.set(roomId, new Set());
    this.roomUsers.get(roomId)!.add(userId);

    const history = await this.chatService.getHistory(roomId);
    client.emit('chat:history', history);
    this.broadcastOnlineCount(roomId);
  }

  @SubscribeMessage('chat:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; content: string; replyToId?: string },
  ) {
    const userId  = client.data.userId as string;
    const content = (payload.content ?? '').trim();
    if (!content) return;

    const message = await this.chatService.saveMessage(
      payload.roomId,
      userId,
      content,
      payload.replyToId,
    );
    this.server.to(payload.roomId).emit('chat:message', message);
  }

  @SubscribeMessage('chat:react')
  async handleReact(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; messageId: string; emoji: string },
  ) {
    const userId = client.data.userId as string;
    const result = await this.chatService.toggleReaction(userId, payload.messageId, payload.emoji);
    // 广播该消息最新 reactions 给房间所有人
    this.server.to(payload.roomId).emit('chat:reactions', result);
  }

  private broadcastOnlineCount(roomId: string) {
    const count = this.roomUsers.get(roomId)?.size ?? 0;
    this.server.to(roomId).emit('room:onlineCount', { roomId, onlineCount: count });
  }
}
