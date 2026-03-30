import { ChatRoomContainer } from './ChatRoomContainer'

export function ChatPage() {
  return (
    // h-dvh: 移动端动态视口高度，不包含浏览器 URL 栏
    <div className="h-dvh flex flex-col bg-bg overflow-hidden">
      <ChatRoomContainer />
    </div>
  )
}
