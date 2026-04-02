import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'  // react-router-dom: 路由管理
import { AnimatePresence } from 'framer-motion'  // framer-motion: 路由退场动画
import { MotionConfig } from 'framer-motion'     // framer-motion: 全局 reducedMotion 支持
import { BoardListPage } from './forum/BoardListPage'
import { ThreadListPage } from './forum/ThreadListPage'
import { ThreadDetailPage } from './forum/ThreadDetailPage'
import { MyPage } from './mypage/MyPage'
import { ChatPage } from './chat/ChatPage'
import { BottomTabBar } from './components/BottomTabBar'
import { BookmarkListPage } from './bookmarks/BookmarkListPage'
import { PhotoCardDemoPage } from './photo-card/PhotoCardDemoPage'
import { VenueMapPage } from './venue-map/VenueMapPage'
import { DesignSystemPage } from './design-system/DesignSystemPage'

// 带 Bottom Tab Bar 的页面布局
function MainLayout() {
  return (
    <>
      <Outlet />
      <BottomTabBar />
    </>
  )
}

// AnimatePresence 需要感知 location 变化，必须在 BrowserRouter 内部使用
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route path="/"                              element={<BoardListPage />} />
          <Route path="/board/:slug"                   element={<ThreadListPage />} />
          <Route path="/board/:slug/thread/:threadId"  element={<ThreadDetailPage />} />
          <Route path="/chat"                          element={<ChatPage />} />
          <Route path="/bookmarks"                     element={<BookmarkListPage />} />
        </Route>
        <Route path="/mypage"         element={<MyPage />} />
        <Route path="/photo-demo"     element={<PhotoCardDemoPage />} />
        <Route path="/venue"          element={<VenueMapPage />} />
        <Route path="/design-system"  element={<DesignSystemPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    // reducedMotion="user" 自动尊重系统 prefers-reduced-motion 设置
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </MotionConfig>
  )
}

export default App
