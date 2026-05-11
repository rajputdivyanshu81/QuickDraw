# Service Map

## 🖼️ User Layer (Frontend)
- **`excelidraw-frontend`**: Next.js App (Client & Server Components).
  - Connects to `http-backend` for REST.
  - Connects to `ws-backend` for Realtime.
  - Authenticates via Clerk Frontend API.

## ⚙️ Logic Layer (Backends)
- **`http-backend`**:
  - Express/Node.js API.
  - Manages Room CRUD and Auth synchronization.
  - Talks to Prisma (`@repo/db`).
- **`ws-backend`**:
  - Raw WebSocket Server.
  - Manages volatile state and event relay.
  - Talks to Prisma (`@repo/db`) for persistence.

## 💾 Data Layer (Shared)
- **`@repo/db`**:
  - PostgreSQL database.
  - Prisma Client generation.
  - Shared source of truth for all services.

## 🌍 Infrastructure
- **Clerk**: Global Auth Provider.
- **Vercel**: Deployment target for Frontend/Docs.
