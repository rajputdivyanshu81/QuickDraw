# ADR 006: Collaborative Room Scaling Limits

## Status
Accepted

## Context
As the number of participants in a room grows, the O(N^2) nature of broadcasting events (every user action broadcast to every other user) becomes a bottleneck.

## Decision
We will implement **Spatial/Event Filtering** and **Rate Limiting** for high-frequency events.

## Consequences
- **Pros**: Maintains 60FPS even in crowded rooms. Reduces server CPU load.
- **Cons**: Users might see slightly "choppy" cursors for others if rate-limited.
- **Implementation**:
  - `laser_pointer` events throttled to 30ms on the client.
  - Server-side "max room occupancy" enforced at 100 users per room until Redis cluster is implemented.
