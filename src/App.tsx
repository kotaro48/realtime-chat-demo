import { ChatPage } from './chat/ChatPage';

function App() {
  return (
    // App 是根组件：这里先只负责页面级布局，不放业务逻辑
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <ChatPage />
    </div>
  );
}

export default App;
