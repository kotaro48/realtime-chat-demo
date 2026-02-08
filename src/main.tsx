import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// React 18 的应用入口：把根组件挂载到 public/index.html 里的 #root 节点
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // StrictMode 只在开发环境生效，用来帮助发现潜在问题（如副作用写法不安全）
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
