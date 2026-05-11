# websocket-review

## 🎯 Purpose
Audit the realtime communication layer for protocol stability, message integrity, and mult-user synchronization.

## 🛠️ Workflow
1.  **Event Schema Scan**: Identify all event types in `apps/ws-backend/src/index.ts`.
2.  **Auth Integrity**: Verify `verifyToken` usage in the connection handshake.
3.  **Broadcast Efficiency**: Audit the `users.forEach` loops for performance bottlenecks.
4.  **Error Handling**: Check for `try/catch` around `JSON.parse` and `ws.send`.

## 📋 Engineering Checklist
- [ ] Handshake includes `token` query parameter.
- [ ] Heartbeat/Ping-Pong mechanism is active.
- [ ] `messageQueue` is used during auth to prevent lost messages.
- [ ] Messages are validated before DB insertion.

## ⚠️ Severity Levels
- **CRITICAL**: Unauthenticated socket connections, memory leaks in `users` array.
- **WARNING**: Missing heartbeats, non-throttled high-frequency events.
- **INFO**: Undocumented event types.

## 🚀 Scalability & Risk
- **Current Bottleneck**: In-memory `users` array prevents horizontal scaling.
- **Risk**: Large rooms (>50 users) will cause O(N^2) broadcast overhead.
- **Solution**: Move to Redis Pub/Sub.

## 📤 Expected Output Format
- **Event Catalog**: List of all handled types.
- **Security Audit**: Auth status and leakage risks.
- **Performance bottleneck identification**.
