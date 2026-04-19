// 环境感知的接口基础地址
// 开发时：VITE_BACKEND_URL 未设置，Vite proxy 处理 /api 转发
// 生产时：VITE_BACKEND_URL=https://your-railway-app.railway.app
export const API_BASE = import.meta.env.VITE_BACKEND_URL ?? ''

// Socket.IO 连接地址
// Vercel 不支持 WebSocket upgrade，必须直连 Railway
export const SOCKET_URL = import.meta.env.VITE_BACKEND_URL ?? window.location.origin
