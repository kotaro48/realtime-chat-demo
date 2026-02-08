import React from 'react';
import type { ChatMessage, User } from '../types';

type Props = {
  message: ChatMessage;
  currentUser: User;
};

export function MessageBubble({ message, currentUser }: Props) {
  // 组件内的派生判断：决定消息气泡是左对齐还是右对齐
  const isMine = message.sender.id === currentUser.id;

  return (
    // 条件 className：根据 isMine 切换布局
    <div className={`flex w-full gap-2 mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
      {/* 左侧头像区：仅当消息来自他人时显示 */}
      {/* 条件渲染：只有“别人发的消息”才显示左侧头像 */}
      {!isMine && (
        <div
          className="h-8 w-8 rounded-2xl flex items-center justify-center text-[10px] font-medium text-slate-900"
          style={{ backgroundColor: message.sender.avatarColor }}
        >
          {message.sender.nickname.slice(0, 2)}
        </div>
      )}
      {/* 中间内容区：包含“名称/身份 + 消息气泡正文” */}
      <div className={`max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {/* 名称行：自己显示“我”，他人显示发送者昵称 */}
        <span className="text-[11px] text-slate-400 mb-1">
          {isMine ? '我' : message.sender.nickname}
        </span>
        {/* 使用数组 + join 拼接 class，能更清晰地表达条件样式 */}
        {/* 消息体（聊天气泡正文） */}
        <div
          className={[
            'px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-md',
            isMine
              ? 'bg-gradient-to-br from-brand to-purple-500 text-white rounded-br-sm'
              : 'bg-slate-800/80 text-slate-50 rounded-bl-sm'
          ].join(' ')}
        >
          {message.content}
        </div>
      </div>
      {/* 右侧头像区：仅当消息来自自己时显示 */}
      {isMine && (
        <div
          className="h-8 w-8 rounded-2xl flex items-center justify-center text-[10px] font-medium text-slate-900"
          style={{ backgroundColor: currentUser.avatarColor }}
        >
          我
        </div>
      )}
    </div>
  );
}
