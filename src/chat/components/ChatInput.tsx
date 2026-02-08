import { useState, KeyboardEvent } from 'react';

type Props = {
  // 父组件传入的发送函数
  onSend: (text: string) => void;
};

export function ChatInput({ onSend }: Props) {
  // 受控组件：输入框的值完全由 React state 管理
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送；Shift+Enter 保留原生换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input.trim());
        // 发送后清空输入
        setInput('');
      }
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <textarea
        value={input}
        // onChange 每次输入都会更新 state，UI 与 state 始终同步
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
        className="flex-1 px-4 py-2 bg-slate-800/80 text-slate-50 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none min-h-[44px] max-h-32"
        rows={1}
      />
      <button
        onClick={() => {
          if (input.trim()) {
            onSend(input.trim());
            setInput('');
          }
        }}
        // 派生状态：输入为空时禁用按钮
        disabled={!input.trim()}
        className="px-6 py-2 bg-gradient-to-r from-brand to-purple-500 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        发送
      </button>
    </div>
  );
}
