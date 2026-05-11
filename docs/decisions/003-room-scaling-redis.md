# ADR 003: Collaborative Room Scaling via Redis Pub/Sub

## Status
Accepted (In Progress)

## Context
The current `ws-backend` uses an in-memory `users` array. This limits the application to a single server instance.

## Decision
We will integrate **Redis Pub/Sub** as a message broker between WebSocket instances.

## Consequences
- **Pros**: Allows horizontal scaling. Any server instance can handle any room.
- **Cons**: Adds complexity to the backend (dependency on Redis). Slight increase in latency for cross-server message propagation.
- **Plan**: Use `ioredis` to subscribe to `room:${roomId}` channels.
