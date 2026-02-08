import type { RoomInfo } from '../types';

type Props = {
  // props：父组件传入的数据；这里 Header 只关心房间信息
  room: RoomInfo;
};

export function ChatHeader({ room }: Props) {
  return (
    <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-50">{room.name}</h1>
        <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
          {room.onlineCount} 人在线
        </span>
      </div>
    </div>
  );
}
