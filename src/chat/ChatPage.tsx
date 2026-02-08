import { ChatRoomContainer } from './ChatRoomContainer';

export function ChatPage() {
  return (
    // 页面组件：只负责聊天室外层卡片样式，具体功能交给 ChatRoomContainer
    <div className="w-full max-w-4xl h-[720px] rounded-3xl shadow-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl overflow-hidden flex flex-col">
      <ChatRoomContainer />
    </div>
  );
}
