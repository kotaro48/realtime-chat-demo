import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'  // react-router-dom: 路由管理
import { BoardListPage } from './forum/BoardListPage'
import { ThreadListPage } from './forum/ThreadListPage'
import { ThreadDetailPage } from './forum/ThreadDetailPage'
import { MyPage } from './mypage/MyPage'    // MyPage: 个人中心（握手会记录等）
import { ChatPage } from './chat/ChatPage'  // ChatPage: リアルタイムチャット
import { BottomTabBar } from './components/BottomTabBar'  // BottomTabBar: 全局底部导航
import { BookmarkListPage } from './bookmarks/BookmarkListPage'  // BookmarkListPage: 収藏帖子列表
import { PhotoCardDemoPage } from './photo-card/PhotoCardDemoPage'  // PhotoCardDemoPage: 数字生写真演示
import { VenueMapPage } from './venue-map/VenueMapPage'  // VenueMapPage: 握手会虚拟地图
import { DesignSystemPage } from './design-system/DesignSystemPage'  // DesignSystemPage: 设计系统展示

// 带 Bottom Tab Bar 的页面布局
function MainLayout() {
  return (
    <>
      <Outlet />
      <BottomTabBar />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Bottom Tab Bar 布局：掲示板 + チャット */}
        <Route element={<MainLayout />}>
          <Route path="/"                              element={<BoardListPage />} />
          <Route path="/board/:slug"                   element={<ThreadListPage />} />
          <Route path="/board/:slug/thread/:threadId"  element={<ThreadDetailPage />} />
          <Route path="/chat"                          element={<ChatPage />} />
          <Route path="/bookmarks"                     element={<BookmarkListPage />} />
        </Route>

        {/* 无 Bottom Tab Bar 的独立页面 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/photo-demo" element={<PhotoCardDemoPage />} />
        <Route path="/venue" element={<VenueMapPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
