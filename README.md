## Realtime Chat Demo - Chat Room Module

本模块规划为一个「气泡聊天室」子系统，用于站内实时交流。架构设计面向商业级应用，考虑高并发、可扩展性和用户体验。

---

## 📐 架构设计（商业级考虑）

### 整体架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (React + Vite)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  页面组件     │  │  容器组件     │  │  UI 组件      │      │
│  │  ChatPage    │→ │ChatRoomContainer│→ │MessageList   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                           │                                 │
│                    ┌───────▼────────┐                        │
│                    │  WebSocket 客户端 │                        │
│                    │   (Socket.io)   │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │  (可选：负载均衡、限流)
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  WebSocket 服务 │  │   REST API 服务  │  │   消息队列     │
│  (Socket.io)   │  │   (Express)     │  │  (Redis/RabbitMQ)│
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                     │                    │
        └─────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    数据库层        │
                    │  (PostgreSQL/     │
                    │   MongoDB)        │
                    └───────────────────┘
```

### 商业级架构要点

#### 1. **前后端分离 + 双通道通信**
- **HTTP/REST 通道**：用于一次性操作（登录、注册、拉取历史消息、用户资料查询）
  - 无状态，易于水平扩展
  - 可配合 CDN 缓存静态资源
- **WebSocket 通道**：用于实时双向通信（发送消息、接收广播、在线状态）
  - 长连接，减少握手开销
  - 支持房间（rooms）隔离，降低广播范围

#### 2. **可扩展性设计**
- **水平扩展**：WebSocket 服务可部署多个实例，通过 Redis Adapter 共享房间状态
- **消息队列**：高并发场景下，消息先入队（Redis/RabbitMQ），异步持久化，避免数据库成为瓶颈
- **读写分离**：历史消息查询走只读副本，写入走主库

#### 3. **性能优化**
- **前端虚拟滚动**：消息列表使用 `react-window` 或 `react-virtualized`，只渲染可见区域
- **消息分页加载**：进入房间时只拉取最近 N 条，向上滚动时懒加载更早的历史
- **防抖节流**：输入框防抖、发送按钮节流，避免频繁请求
- **消息去重**：使用 `clientMessageId` + `serverMessageId` 双重 ID，防止重复渲染

#### 4. **可靠性保障**
- **自动重连**：Socket.io 内置重连机制，网络波动时自动恢复
- **消息确认**：发送消息后等待服务端 `ack`，失败时本地标记并支持重试
- **离线消息**：用户离线期间的消息暂存，上线后批量推送
- **限流保护**：后端对单用户发送频率限流（如每秒最多 5 条），防止刷屏

#### 5. **安全性**
- **JWT 鉴权**：WebSocket 握手时校验 JWT token，拒绝未授权连接
- **输入过滤**：前端 XSS 防护，后端内容审核（敏感词过滤）
- **CORS 配置**：严格限制允许的源和请求头

---

## 🧩 前端组件架构

### 组件层级关系

```
App (根组件)
  └─ ChatPage (页面级组件)
      └─ ChatRoomContainer (容器组件/逻辑层)
          ├─ ChatHeader (展示组件)
          ├─ MessageList (展示组件)
          │   └─ MessageBubble (展示组件) × N
          └─ ChatInput (展示组件)
```

### 组件职责说明

#### **页面级组件 (Page Components)**

##### `ChatPage` (`src/chat/ChatPage.tsx`)
- **角色**：聊天室页面的最外层容器，负责整体布局和样式
- **职责**：
  - 定义聊天室卡片的尺寸、圆角、阴影等视觉容器
  - 提供响应式布局（在不同屏幕尺寸下的适配）
  - 不包含业务逻辑，纯粹是布局包装
- **Props**：无（未来可扩展：`roomId?: string` 用于路由参数）
- **状态**：无状态组件

---

#### **容器组件 (Container Components)**

##### `ChatRoomContainer` (`src/chat/ChatRoomContainer.tsx`)
- **角色**：聊天室的核心逻辑层，连接 UI 和数据/服务
- **职责**：
  - **状态管理**：管理当前房间信息、当前用户、消息列表
  - **业务逻辑**：
    - 消息发送处理（本地 optimistic update + WebSocket 发送）
    - 消息接收处理（WebSocket 事件监听 → 更新状态）
    - 历史消息拉取（进入房间时调用 REST API）
  - **数据转换**：将原始消息列表转换为带 `isMine` 标记的装饰消息
  - **WebSocket 生命周期**：连接建立、重连、断开处理
- **状态**：
  - `room: RoomInfo` - 当前房间信息
  - `currentUser: User` - 当前登录用户
  - `messages: ChatMessage[]` - 消息列表
  - `wsStatus: 'connecting' | 'connected' | 'disconnected'` - WebSocket 连接状态（未来扩展）
- **副作用**：
  - `useEffect` 中建立 WebSocket 连接（未来实现）
  - `useEffect` 中拉取历史消息（未来实现）

---

#### **展示组件 (Presentational Components)**

##### `ChatHeader` (`src/chat/components/ChatHeader.tsx`)
- **角色**：聊天室顶部标题栏
- **职责**：
  - 显示房间名称
  - 显示在线人数
  - 未来可扩展：返回按钮、房间设置、成员列表入口
- **Props**：
  - `room: RoomInfo` - 房间信息（包含 `id`, `name`, `onlineCount`）
- **状态**：无状态组件

---

##### `MessageList` (`src/chat/components/MessageList.tsx`)
- **角色**：消息列表容器，负责滚动和渲染
- **职责**：
  - 渲染消息列表（遍历 `messages`，为每条消息渲染 `MessageBubble`）
  - **自动滚动到底部**：新消息到达时自动滚动（使用 `useRef` + `useEffect`）
  - 未来可扩展：虚拟滚动（`react-window`）、下拉加载更多历史消息
- **Props**：
  - `messages: ChatMessage[]` - 消息数组（已包含 `isMine` 标记）
  - `currentUser: User` - 当前用户（用于传递给 `MessageBubble`）
- **状态**：无状态组件（滚动位置由 DOM ref 管理）

---

##### `MessageBubble` (`src/chat/components/MessageBubble.tsx`)
- **角色**：单条消息的气泡 UI
- **职责**：
  - 根据 `isMine` 决定左右对齐和配色
    - **自己发送**：右侧对齐，品牌渐变色（`from-brand to-purple-500`）
    - **他人发送**：左侧对齐，中性灰色（`bg-slate-800/80`）
  - 显示头像（圆形，背景色来自 `sender.avatarColor`，显示昵称前 2 个字）
  - 显示昵称和时间（未来扩展）
  - 显示发送状态（`pending` / `sent` / `failed`，未来扩展）
- **Props**：
  - `message: ChatMessage` - 消息对象（包含 `sender`, `content`, `isMine` 等）
  - `currentUser: User` - 当前用户（用于判断 `isMine`）
- **状态**：无状态组件

---

##### `ChatInput` (`src/chat/components/ChatInput.tsx`)
- **角色**：消息输入框和发送按钮
- **职责**：
  - 多行文本输入（`textarea`）
  - **键盘交互**：
    - `Enter` 发送消息
    - `Shift + Enter` 换行
  - 发送按钮状态：输入为空时禁用
  - 发送后清空输入框
- **Props**：
  - `onSend: (text: string) => void` - 发送回调函数
- **状态**：
  - `input: string` - 输入框内容（受控组件）

---

## 📊 数据流设计

### 类型定义 (`src/chat/types.ts`)

```typescript
// 用户信息
type User = {
  id: string;              // 用户唯一标识
  nickname: string;        // 昵称
  avatarColor: string;     // 头像背景色（16进制颜色码）
};

// 聊天消息
type ChatMessage = {
  id: string;              // 消息唯一标识（服务端生成）
  roomId: string;          // 所属房间 ID
  sender: User;            // 发送者信息
  content: string;         // 消息内容（纯文本，未来可扩展富文本）
  createdAt: string;       // ISO 8601 时间戳
  status?: 'pending' | 'sent' | 'failed';  // 发送状态（仅自己发送的消息有）
  isMine?: boolean;        // 是否为自己发送（由 ChatRoomContainer 计算）
};

// 房间信息
type RoomInfo = {
  id: string;              // 房间唯一标识
  name: string;            // 房间名称
  onlineCount: number;     // 当前在线人数
};
```

### 数据流向

#### **发送消息流程**（未来 WebSocket 接入后）

```
用户输入 → ChatInput.onSend()
    ↓
ChatRoomContainer.handleSend()
    ↓
1. 本地 optimistic update（立即添加到 messages，status='pending'）
    ↓
2. 通过 WebSocket 发送到服务端
    ↓
3. 服务端持久化 + 广播给房间内所有用户
    ↓
4. 前端收到服务端确认（ack），更新 status='sent'
    ↓
5. 前端收到服务端广播（chat:message），更新消息 ID 为服务端 ID
```

#### **接收消息流程**

```
服务端广播 chat:message 事件
    ↓
ChatRoomContainer 的 WebSocket 监听器
    ↓
更新 messages 状态（追加新消息）
    ↓
MessageList 自动滚动到底部
    ↓
MessageBubble 渲染新消息（根据 sender.id 判断左右对齐）
```

---

## 🛠 技术栈选择（前后端）

### 前端：Vite + React + TypeScript + Tailwind CSS

- **Vite**
  - 原生 ES 模块开发服务器，冷启动和热更新速度极快，适合频繁调整 UI 的聊天室开发场景
  - 配置简单，和 TypeScript/Tailwind 等生态整合良好
  - 生产构建使用 Rollup，打包体积小、性能好

- **React**
  - 组件化能力强，便于把聊天室拆分成 `ChatPage`、`MessageList`、`MessageBubble`、`ChatInput` 等可复用组件
  - Hooks 模型适合管理 WebSocket 连接状态、消息列表状态等「长期存在的 UI 状态」
  - 生态成熟，有大量聊天室相关的第三方库（虚拟滚动、富文本编辑器等）

- **TypeScript**
  - 聊天室涉及较多数据结构（消息、用户、房间、WebSocket 事件等），TS 可以在前后端共享类型定义，降低联调成本
  - 对 WebSocket 消息格式、组件 props 进行静态约束，减少运行时错误
  - 重构友好，商业项目必备

- **Tailwind CSS**
  - 原子化样式，非常适合快速迭代 UI 细节（左/右对齐、气泡圆角、渐变背景等），能快速做出「简单 + 时尚」的界面
  - 在多人协作时可以保持样式风格统一，不易出现「一堆零散的自定义 class」
  - 生产构建时自动 tree-shaking，只打包用到的样式

### 后端：Node.js + Express + Socket.io

- **Node.js**
  - 天然适合 IO 密集型、长连接场景（如 WebSocket 聊天室），单线程事件循环模型处理并发连接效率高
  - 生态成熟，npm 包丰富

- **Express**
  - 轻量且灵活，用来提供 REST API（登录/注册、历史消息拉取等）足够简洁
  - 中间件体系完善，方便集成认证、日志、限流等能力
  - 易于与 Socket.io 集成在同一服务中

- **Socket.io**
  - 基于 WebSocket 的上层封装，支持自动重连、心跳、房间（rooms）、事件命名空间等，非常契合聊天室需求
  - 提供事件命名机制（如 `message`, `join`, `leave`），在前后端之间约定清晰的事件语义
  - 兼容性好，对浏览器环境友好，减少低层 WebSocket 兼容工作量
  - 支持 Redis Adapter，便于多实例部署时共享房间状态

---

## 📁 项目结构

```
src/
├── main.tsx                 # 应用入口，React 挂载点
├── App.tsx                  # 根组件，路由和全局布局
├── index.css                # 全局样式，Tailwind 指令
│
└── chat/                    # 聊天室模块
    ├── ChatPage.tsx         # 页面级组件（布局容器）
    ├── ChatRoomContainer.tsx # 容器组件（业务逻辑层）
    ├── types.ts             # TypeScript 类型定义
    │
    └── components/          # 展示组件
        ├── ChatHeader.tsx   # 顶部标题栏
        ├── MessageList.tsx  # 消息列表容器
        ├── MessageBubble.tsx # 单条消息气泡
        └── ChatInput.tsx    # 输入框和发送按钮
```

---

## 🚀 开发状态

- ✅ **Phase 1：前端 UI + 假数据**（当前阶段）
  - 已完成：所有组件结构、类型定义、假数据模拟
  - 可运行：`npm install && npm run dev`，在浏览器中查看聊天室 UI

- ⏳ **Phase 2：WebSocket 实时通信**（下一步）
  - 后端搭建 Express + Socket.io 服务
  - 前端封装 WebSocket 客户端，接入真实消息流

- ⏳ **Phase 3：历史消息 + 数据库持久化**
  - 数据库设计（消息表、用户表、房间表）
  - REST API 拉取历史消息
  - 消息持久化逻辑

- ⏳ **Phase 4：增强功能**
  - 发送状态（pending/sent/failed）、重试机制
  - 时间分组显示
  - 富媒体支持（图片、表情）
  - 多房间/私聊支持

---

## 📝 学习 Memo

### 为什么 `onSend` 的具体实现放在容器组件（父）而不是 `ChatInput`（子）？

- 核心原则是“状态归属 + 职责分离”。
- `ChatInput` 是展示/输入组件，职责是采集文本并触发事件，不应承载复杂业务。
- `messages` 状态归 `ChatRoomContainer` 管理；谁拥有状态，谁负责更新状态。
- 发送消息不只是“拿到文本”，后续还会涉及消息追加、WebSocket 发送、ack、失败重试、埋点、限流等业务逻辑，这些都更适合放在容器层。
- 通过 `onSend` 把行为从父传给子，符合 React 的单向数据流，组件更清晰、更可复用。
- 如果把实现放在 `ChatInput`，子组件会知道太多业务细节，复用性会下降，后续维护成本会变高。

### `useEffect` 何时触发（结合 `MessageList.tsx`）

- `useEffect` 都是在组件渲染提交到 DOM 之后执行（不在 render 阶段执行）。
- `MessageList.tsx` 里有 3 个 effect：
  - `useEffect(..., [messages])`：首次挂载后执行一次；之后每次 `messages` 变化时执行。这里用于“新消息到达时，判断是否自动滚动或显示 `有新消息` 提示”。
  - `useEffect(..., [])`（滚动监听）：只在首次挂载后执行一次，用来注册 `scroll` 事件；返回的清理函数会在组件卸载时移除监听。
  - `useEffect(..., [])`（初始滚到底部）：只在首次挂载后执行一次，让初始进入页面时定位到底部。
- 如果 effect 返回清理函数，清理函数会在“下一次该 effect 重新执行前”以及“组件卸载时”执行。

### TODO：消息列表性能优化（全量渲染 -> 虚拟列表）

- 现状：`MessageList.tsx` 里通过 `messages.map(...)` 全量渲染所有消息，阅读体验简单直观。
- 风险：当消息量很大时，DOM 节点数量和内存占用上升，渲染/滚动压力变大，可能出现卡顿。
- 解决方案（暂不实现）：
  - 引入虚拟列表（如 `react-window` / `react-virtualized`），仅渲染可视区与少量缓冲区消息。
  - 配合“向上加载历史消息”分页策略，初次只加载最近 N 条。
  - 保持“有新消息”提示交互，不强制打断用户阅读旧消息。

### TODO：首个待修复 Bug（消息区与输入区布局）

- 现象：
  - 连续发送多条消息后，消息输入框会被挤出可视区域。
  - 同时看不到可用滚动条来调整位置（桌面端）。
  - 也没有稳定出现“有新消息”提示按钮用于快速跳转到底部。
- 复现方式：
  - 启动 `server + client` 后，在同一窗口连续发送多条消息，观察聊天容器高度与输入框位置变化。
- 预期行为：
  - 输入框应始终固定在底部可见区域内，不应被消息列表挤出画面。
  - 消息区应保持可滚动（桌面端可见滚动条或可滚动行为明确）。
  - 当用户不在底部且有新消息到达时，应稳定显示“有新消息”按钮，点击后滚动到最新消息。
- 已实施修复（2026-02-23）：
  - 在聊天容器层补充 `min-h-0` 与 `overflow-hidden`，防止消息区撑破布局把输入框顶出可视区。
  - 在消息列表滚动容器补充 `min-h-0`，确保滚动高度计算与滚动行为稳定。
  - 待你本地回归验证：输入框固定可见、消息区可滚动、“有新消息”按钮触发恢复正常。
- 修复思路（为什么加 `min-h-0`）：
  - 该问题本质是 `flex` 列布局中的“子项无法收缩”导致的：子项默认 `min-height: auto`，消息变多后会按内容高度继续撑开父容器。
  - 一旦中间消息区被内容撑高，底部输入区会被挤出可视区域，同时内部滚动容器的滚动边界也会失真。
  - 给中间层和滚动层补 `min-h-0`（即 `min-height: 0`）后，子项允许在可用空间内收缩，溢出内容交由 `overflow-y-auto` 处理。
  - 这类修复属于典型的“打通 flex 高度传递链路”：外层容器可计算高度，中间层可收缩，内层负责滚动。

### 进度检查记录（2026-02-23）

- 已实现：
  - 前端基础工程已完成（React + Vite + TypeScript + Tailwind）。
  - 聊天页面与组件结构已完成（`ChatPage`、`ChatRoomContainer`、`ChatHeader`、`MessageList`、`MessageBubble`、`ChatInput`）。
  - 最小后端已完成（`Express + Socket.io`，单房间 demo，内存消息列表，在线人数广播）。
  - 前端已接入真实实时链路（`room:join`、`chat:history`、`chat:send`、`chat:message`、`room:onlineCount`）。
  - 消息列表已支持“在非底部时显示有新消息提示，点击后滚到底部”逻辑。
  - 学习向注释已补充到关键前后端代码（`useEffect`、`io/socket` 事件流、执行顺序）。

- 未实现：
  - 消息持久化未实现（数据库与历史消息落库链路未接入）。
  - 完整 REST API 未实现（当前仅提供 `GET /health`，聊天主链路走 socket 事件）。
  - 消息可靠性机制未实现（ack 驱动的 pending/sent/failed、失败重试策略未完善）。
  - 大列表性能优化未实现（虚拟列表与历史分页仅记录为 TODO，尚未编码）。
  - 当前发现的布局滚动 bug 尚未修复（输入框被挤出、滚动异常、新消息提示触发不稳定）。

- 当前阶段结论：
  - 项目已从“纯前端 mock”进入“前后端最小可联调”阶段。
  - 下一优先级：先修复消息区/输入区布局滚动 bug，再推进可靠性与持久化。
