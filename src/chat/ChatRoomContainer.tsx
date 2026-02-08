import { useMemo, useState } from 'react';
import type { ChatMessage, RoomInfo, User } from './types';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';

// 下面这几段是本地 mock 数据，方便先把 UI/交互跑通
const mockMe: User = {
  id: 'me',
  nickname: '我推',
  avatarColor: '#f472b6'
};

const mockOther: User = {
  id: 'other',
  nickname: '48号应援团',
  avatarColor: '#38bdf8'
};

const mockRoom: RoomInfo = {
  id: 'akb48-lobby',
  name: 'AKB48 粉丝大厅',
  onlineCount: 128
};

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    roomId: mockRoom.id,
    sender: mockOther,
    content: '今晚的公演你看了吗？MC 太好笑了哈哈哈～',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: '2',
    roomId: mockRoom.id,
    sender: mockMe,
    content: '看了看了！那段即兴 rap 直接被圈粉！',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString()
  },
  {
    id: '3',
    roomId: mockRoom.id,
    sender: mockOther,
    content: '等聊天室打通 WebSocket 后，可以边看直播边弹幕聊天就完美了～',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  }
];

export function ChatRoomContainer() {
  // useState：在函数组件里声明状态
  // 这里的 room/currentUser 先固定不变，所以只取 getter，不需要 setter
  const [room] = useState<RoomInfo>(mockRoom);
  const [currentUser] = useState<User>(mockMe);
  // messages 会随着发送消息而变化，所以需要 setMessages
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // useMemo：基于依赖做“派生数据”缓存，依赖不变时复用上次结果
  // 这里把原始消息转换成带 isMine 的消息，供展示组件直接渲染
  const decoratedMessages = useMemo(
    () =>
      messages.map((m) => ({
        ...m,
        isMine: m.sender.id === currentUser.id
      })),
    [messages, currentUser.id]
  );

  // 子组件 ChatInput 通过 props 回调把输入文本“抬升”到容器组件处理
  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    const pending: ChatMessage = {
      id: `local-${Date.now()}`,
      roomId: room.id,
      sender: currentUser,
      content: text,
      createdAt: now,
      status: 'sent'
    };
    // 函数式更新：基于上一次 state 计算下一次 state，避免闭包拿到旧值
    setMessages((prev) => [...prev, pending]);
  };

  return (
    // 容器组件统一组织数据和行为，再通过 props 传给展示组件
    <div className="flex flex-col h-full">
      <ChatHeader room={room} />
      <div className="flex-1 flex flex-col border-y border-slate-800 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-slate-950 px-4">
        <MessageList messages={decoratedMessages} currentUser={currentUser} />
      </div>
      <div className="p-4 bg-slate-900/80">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
