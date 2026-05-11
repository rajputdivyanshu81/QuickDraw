# WebSocket Debugging Prompt

Use this prompt when users report "lag", "lost strokes", or "connection drops".

## Context
Our WebSocket implementation handles complex state sync for drawing and chat.

## Instructions
1. **Trace the Event**: Pick a specific event type (e.g., `update_shape`) and trace its path from `Canvas.tsx` -> `ws-backend` -> remote `Canvas.tsx`.
2. **Check Handshake**: Verify if the auth token is being refreshed correctly and if the handshake query params are present.
3. **Audit Heartbeats**: Check `index.ts` in `ws-backend` for zombie connection cleanup logic.
4. **Inspect Validation**: Are there any Zod validation errors silently failing?
5. **Analyze Latency**: Identify if the delay is in **Serialization** (JSON.stringify), **Transmission**, or **Processing** (DB save).

## Output
A step-by-step reproduction guide and a hypothesized root cause.
