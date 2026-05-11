# QuickDraw Repository Operating Guide

Advanced engineering standards for a high-performance, collaborative realtime canvas system.

## 🏗️ Stack Definition
- **Core**: Turborepo Monorepo (pnpm)
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide Icons, Framer Motion
- **Drawing Engine**: Custom HTML5 Canvas engine with WebGL-ready architecture
- **Realtime**: WebSocket (ws), WebRTC (Voice/Signaling)
- **Auth**: Clerk (Backend & Frontend)
- **Backend**: Node.js (Express-less native WS), Prisma ORM
- **Database**: PostgreSQL (Production), Redis (Scaling target)

## 📐 Architecture Constraints
1. **Event-Sourced Drawing**: All canvas updates MUST be broadcast as discrete event types (`chat`, `update_shape`, `delete_shape`).
2. **Single Source of Truth**: The Database is the final state. Local UI MUST use optimistic updates but reconcile with incoming WS events.
3. **Monorepo Boundaries**: Shared logic (DB client, ESLint, TS configs) MUST live in `packages/`. Business logic stays in `apps/`.
4. **Stateless Backends**: All session state (except active connections) should be externalized to Redis/DB to allow horizontal scaling.

## 📡 WebSocket Engineering Rules
- **Authentication**: Handshake MUST happen via URL query token (`?token=...`).
- **Heartbeat**: Implement server-side ping/pong to prune zombie connections.
- **Broadcast Efficiency**: Filter users by `roomId` BEFORE serializing and sending JSON.
- **Message Validation**: Use Zod or strict type checking for all incoming `parsedData.type` handlers.

## ⚡ Performance Optimization Rules
- **Canvas Rendering**: Use `requestAnimationFrame` for all draw cycles. Minimize canvas context state changes (strokeColor, lineWidth).
- **React Hydration**: Heavy canvas logic MUST be isolated in client components (`"use client"`) and deferred where possible.
- **Message Batching**: High-frequency events (like `laser_pointer`) should be throttled/debounced at the source.

## 🔐 Security Standards
- **Clerk Integration**: Use `verifyToken` on every WS connection and HTTP request.
- **Data Isolation**: Always filter DB queries by `roomId` AND `userId` where applicable to prevent cross-room leakage.
- **Input Sanitization**: Sanitize all incoming string messages to prevent XSS in chat/labels.

## 🤖 AI-Assisted Development Workflows
1. **Review First**: Run `architecture-review` skill before major refactors.
2. **Realtime Audit**: Use `websocket-review` when adding new event types.
3. **Performance Guard**: Run `frontend-performance` before adding new canvas layers.
4. **Decision Logging**: All major changes MUST result in an ADR in `docs/decisions/`.

## 🛠️ Repository Conventions
- **Naming**: PascalCase for React components, camelCase for functions/vars, kebab-case for directories.
- **Commits**: Follow conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- **Environment**: Always update `.env.example` when adding new variables.
