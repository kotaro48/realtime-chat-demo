import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, User } from '../types';
import { MessageBubble } from './MessageBubble';

type Props = {
  messages: ChatMessage[];
  currentUser: User;
};

export function MessageList({ messages, currentUser }: Props) {
  // useRef：保存 DOM 引用；不会触发重新渲染
  const listRef = useRef<HTMLDivElement>(null);
  const [showNewMessageTip, setShowNewMessageTip] = useState(false);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(messages.length);

  const scrollToBottom = () => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
    isNearBottomRef.current = true;
    setShowNewMessageTip(false);
  };

  const updateNearBottom = () => {
    if (!listRef.current) return;
    // 对 DOM 元素做“对象解构赋值”：从 listRef.current 上一次性取出常用滚动字段
    // scrollTop：当前已向下滚动的距离（顶部被卷走的像素）
    // scrollHeight：可滚动内容总高度（包含不可见部分）
    // clientHeight：可视区域高度（当前容器能看到的高度）
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const nearBottom = scrollHeight - (scrollTop + clientHeight) <= 80;
    isNearBottomRef.current = nearBottom;
    if (nearBottom) setShowNewMessageTip(false);
  };

  // useEffect：处理“副作用”（这里是操作真实 DOM 滚动条）
  // 依赖 messages：每次消息数组变化后触发
  // 仅在“确实新增消息”时处理；若用户在底部则自动滚动，否则显示“有新消息”提示
  useEffect(() => {
    const hasNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;
    if (!hasNewMessage) return;
    if (isNearBottomRef.current) {
      scrollToBottom();
    } else {
      setShowNewMessageTip(true);
    }
  }, [messages]);

  // useEffect：仅在首次挂载后执行一次
  // 用于初始化“是否接近底部”的状态，并注册/清理滚动监听
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    updateNearBottom();
    el.addEventListener('scroll', updateNearBottom);
    return () => el.removeEventListener('scroll', updateNearBottom);
  }, []);

  // useEffect：仅在首次挂载后执行一次
  // 首屏进入聊天时先滚到底部，保证看到最新消息
  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="relative flex-1 min-h-0">
      <div ref={listRef} className="h-full overflow-y-auto py-4 space-y-1">
        {/* 列表渲染：map + key。key 要稳定，帮助 React 做高效 diff */}
        {/* TODO: 当前为全量渲染；当消息很多时可能产生内存和渲染压力。后续可改为虚拟列表（react-window/react-virtualized）+ 分页加载历史消息。 */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} currentUser={currentUser} />
        ))}
      </div>
      {showNewMessageTip && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 rounded-full bg-blue-600 px-3 py-1.5 text-sm text-white shadow hover:bg-blue-700"
        >
          有新消息
        </button>
      )}
    </div>
  );
}
