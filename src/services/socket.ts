// Socket.IO 单例封装
// 整个 App 只维护一个连接实例，避免重复创建/销毁

import { io, type Socket } from 'socket.io-client' // socket.io-client: WebSocket 客户端
import { SOCKET_URL } from '../config'
import { getToken } from '../lib/auth'

let socket: Socket | null = null

// 获取（或创建）Socket 实例
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      transports: ['websocket'],
      auth: { token: getToken() },
      autoConnect: false, // 手动控制连接时机
    })
  }
  return socket
}

// 建立连接（组件 mount 时调用）
export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

// 断开连接并销毁实例（用户登出时调用）
export function destroySocket() {
  socket?.disconnect()
  socket = null
}
