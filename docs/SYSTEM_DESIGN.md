# QuickDraw System Design

A high-performance, collaborative realtime canvas system built for low-latency brainstorms.

## 🏛️ Architecture Overview
QuickDraw follows a **Distributed Event-Sourced** architecture. The system is designed to handle thousands of concurrent drawing events with sub-50ms latency across participants.

### Core Components
1.  **Rendering Engine (Canvas)**: A custom-built HTML5 Canvas layer that handles multi-user stroke rendering, z-index management, and spatial transformations (zoom/pan).
2.  **Realtime Gateway (WS)**: A Node.js WebSocket server that manages room-based broadcasting and state synchronization.
3.  **Persistence Layer (DB)**: PostgreSQL via Prisma for storing room metadata, chat history, and the final state of drawing objects.
4.  **Auth Gateway (Clerk)**: Handles identity and token-based secure handshakes for all connections.

## 📡 Realtime Communication Flow
1.  **User Joins**: Client requests a token from Clerk and connects to WS with `roomId`.
2.  **Stroke Start**: Client generates a `roomId`-scoped event and broadcasts it locally (Optimistic Update).
3.  **Server Relay**: WS server validates the token, persists the event to DB (if applicable), and broadcasts to all other users in the same room.
4.  **Client Sync**: Remote clients receive the event and render the new stroke onto their local canvas.

## 🚀 Scalability Strategy
- **Horizontal Scaling**: Use Redis Pub/Sub to allow multiple WS server instances to synchronize rooms across nodes.
- **Rendering Optimization**: Offscreen canvas rendering for static background layers; active layers are drawn on top to minimize full-screen repaints.
- **Database Partitioning**: As room count grows, partition `Chat` and `Stroke` tables by `roomId`.

## 🛡️ Security Architecture
- **JWT Handshake**: Every WebSocket connection is authenticated using a Clerk JWT.
- **Room Isolation**: Logic in `ws-backend` ensures users only receive messages for rooms they have joined.
- **Data Integrity**: Schemas enforce relationships between Users, Rooms, and Shapes.
