# Realtime Data Flow

The lifecycle of a single drawing stroke in QuickDraw.

## 1. Local Creation (Frontend)
- **Trigger**: `onMouseDown` -> `onMouseMove` in `Canvas.tsx`.
- **Logic**: `initDraw` calculates world coordinates based on camera zoom/pan.
- **Immediate State**: The stroke is rendered to the local "Active" canvas layer immediately (Optimistic).

## 2. Emission (Client -> WS)
- **Event**: A `update_shape` message is serialized to JSON.
- **Channel**: Sent over the authenticated WebSocket connection.

## 3. Relay & Persistence (WS Backend)
- **Reception**: `ws-backend` receives the message and validates the user's room membership.
- **Persistence**: The server updates/creates a record in the `Chat` table (which stores shape JSON).
- **Broadcast**: The server iterates through the `users` array and sends the JSON to everyone in the same `roomId`.

## 4. Remote Reception (Remote Client)
- **Reception**: `socket.onmessage` in the remote `RoomCanvas.tsx` receives the event.
- **Logic**: The `draw` utility adds the shape to its local memory buffer.
- **Re-render**: The remote canvas re-renders the "Background" layer to include the new shape.

## 5. Reconciliation
- If the client reconnects, it calls `GET /chats/:roomId` on `http-backend` to fetch all historical events and rebuild the canvas state from scratch.
