import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path'; // @types/node：让 TypeScript 认识 Node.js 内置的 path 模块

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 路径别名：@/ 代表 src/，shadcn/ui 组件内部互相引用时使用
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',  // 监听所有网卡，局域网手机可访问
    proxy: {
      // 将 /api 和 /auth 请求转发到后端 3000 端口
      '/api': 'http://192.168.3.22:3000',
      '/auth': 'http://192.168.3.22:3000',
      '/socket.io': {
        target: 'http://192.168.3.22:3000',
        ws: true,  // WebSocket プロキシを有効化（Socket.IO デフォルトパス）
      },
    },
  }
});

