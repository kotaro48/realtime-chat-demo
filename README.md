# AKB48 Fan Community

AKB48 fan community platform — a modern alternative to 5ch-style forums.

## Tech Stack

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS (custom design system)
- Socket.IO client (real-time chat)
- React Router v6

**Backend**
- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- Socket.IO (WebSocket gateway)
- Google OAuth 2.0 + JWT

## Features

- **Forum** — boards, threads, posts with nested quote replies
- **Real-time Chat** — Socket.IO chat room with JWT auth, message reactions, quote replies, online count
- **My Page** — handshake event tracker (grid view), AKB48 official calendar (monthly view with auto-import)
- **Auth** — Google OAuth login

## Project Structure

```
akb48Shop/
├── src/                  # React frontend
│   ├── forum/            # Board / Thread pages
│   ├── chat/             # Chat room
│   ├── mypage/           # Handshake grid + Official calendar
│   ├── components/       # Shared components (BottomTabBar, etc.)
│   └── lib/              # Auth helpers
└── backend/              # NestJS backend
    ├── src/
    │   ├── auth/         # Google OAuth + JWT
    │   ├── board/        # Board CRUD
    │   ├── thread/       # Thread CRUD
    │   ├── post/         # Post CRUD
    │   ├── chat/         # WebSocket gateway + service
    │   ├── handshake/    # Handshake event tracker
    │   └── sync/         # AKB48 official schedule sync (daily cron)
    └── prisma/           # Schema + migrations + seed
```

## Local Development

**Prerequisites:** Docker, Node.js 20+

```bash
# 1. Start PostgreSQL
docker start akb48-postgres

# 2. Start backend (port 3000)
cd backend && npm run start:dev

# 3. Start frontend (port 5173)
cd .. && npm run dev
```

Backend environment variables (`backend/.env`):
```
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
JWT_EXPIRES_IN=
```
