# WebSocket Event Catalog

## 📥 Incoming (Client -> Server)
| Event Type | Payload | Description |
| :--- | :--- | :--- |
| `join_room` | `{ roomId: string }` | Joins a room and begins receiving broadcasts. |
| `leave_room` | `{ roomId: string }` | Stops receiving broadcasts for a room. |
| `chat` | `{ roomId: string, message: string }` | Sends a chat message to the room. |
| `update_shape` | `{ roomId: string, shape: object }` | Updates/Creates a shape on the canvas. |
| `delete_shape` | `{ roomId: string, shapeId: string }` | Deletes a shape from the canvas. |
| `laser_pointer` | `{ roomId: string, x: number, y: number }` | Broadcasts real-time cursor position. |
| `voice_ready` | `{ roomId: string }` | Signals user is ready for WebRTC voice. |
| `voice_signal` | `{ roomId: string, targetUserId: string, signal: object }` | Forwards WebRTC signaling data. |

## 📤 Outgoing (Server -> Client)
| Event Type | Payload | Description |
| :--- | :--- | :--- |
| `chat` | `{ roomId: string, message: string }` | Relayed chat message. |
| `update_shape` | `{ roomId: string, shape: object }` | Relayed shape update. |
| `delete_shape` | `{ roomId: string, shapeId: string }` | Relayed shape deletion. |
| `laser_pointer` | `{ userId: string, x: number, y: number }` | Real-time cursor of another user. |
| `voice_left` | `{ userId: string, roomId: string }` | Notifies that a user disconnected. |
