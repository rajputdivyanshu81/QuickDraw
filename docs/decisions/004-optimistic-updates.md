# ADR 004: Optimistic Updates Strategy

## Status
Accepted

## Context
Network latency (even 50ms) can make drawing feel "laggy" if the user has to wait for a server roundtrip before seeing their own stroke.

## Decision
All drawing actions are rendered **Optimistically** on the local canvas immediately.

## Consequences
- **Pros**: Zero-latency feel for the active drawer.
- **Cons**: Requires complex "reconciliation" logic if the server rejects a message or if another user's action conflicts with the local one.
- **Implementation**: The `initDraw` function maintains a local buffer of strokes that haven't been acknowledged by the server yet.
