# Dependency Map

## 📦 Internal Packages (@repo/)
- **`db`**: Prisma client and schema. (Used by: `http-backend`, `ws-backend`, `excelidraw-frontend`)
- **`ui`**: Shared React components. (Used by: `excelidraw-frontend`)
- **`typescript-config`**: Shared TS configs. (Used by: All)
- **`eslint-config`**: Shared ESLint rules. (Used by: All)

## 🚀 Applications
- **`excelidraw-frontend`**: Main user interface.
- **`http-backend`**: REST API for room management.
- **`ws-backend`**: Realtime event relay.
- **`docs`**: Project documentation portal.

## 🔗 Key External Dependencies
- **Clerk**: Authentication & Identity.
- **Prisma**: Database ORM.
- **ws**: WebSocket implementation.
- **Next.js 15**: Frontend framework.
- **Tailwind**: Styling.
