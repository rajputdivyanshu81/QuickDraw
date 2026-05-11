# ADR 002: Realtime Synchronization Design (Event-Sourced)

## Status
Accepted

## Context
Multiple users drawing on the same canvas can lead to conflicts if we try to synchronize the entire canvas state (image/json) every time.

## Decision
We adopted an **Event-Sourced** model. Instead of syncing the "Canvas State", we sync the "Drawing Events" (e.g., `CREATE_RECT`, `DELETE_SHAPE`, `UPDATE_STROKE`).

## Consequences
- **Pros**: Minimal bandwidth (only small JSON events). Infinite undo/redo capability by replaying events. Easy to resolve conflicts by timestamp.
- **Cons**: Requires clients to re-render the entire state from the event log on initial join. Can lead to "drift" if event processing is not deterministic.
- **Mitigation**: Periodic "state snapshots" to DB to speed up initial loading.
