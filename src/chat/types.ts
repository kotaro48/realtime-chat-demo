// 用户信息：用于显示昵称、头像等
export type User = {
  id: string;
  nickname: string;
  avatarColor: string;
};

// 单条聊天消息的数据结构
export type ChatMessage = {
  id: string;
  roomId: string;
  sender: User;
  content: string;
  createdAt: string;
  // 发送状态（目前前端本地演示用，后续可接服务端 ack）
  status?: 'pending' | 'sent' | 'failed';
  // 是否是当前用户发送的消息（通常在容器组件里计算）
  isMine?: boolean;
};

// 聊天房间信息
export type RoomInfo = {
  id: string;
  name: string;
  onlineCount: number;
};
