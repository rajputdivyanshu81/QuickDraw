# ADR 001: WebSocket vs Polling for Realtime Canvas

## Status
Accepted

## Context
QuickDraw requires sub-100ms synchronization for a smooth collaborative drawing experience. Users expect to see strokes from others appearing as they are drawn.

## Decision
We chose **WebSockets (ws)** over HTTP Polling or Server-Sent Events (SSE).

## Consequences
- **Pros**: Bi-directional, low-latency communication. Efficient for high-frequency events (mouse movement, stroke data).
- **Cons**: Requires keeping active connections open on the server (stateful). Scaling requires Redis Pub/Sub to sync multiple server nodes.
- **Implementation**: Native Node.js `ws` library for minimal overhead.
