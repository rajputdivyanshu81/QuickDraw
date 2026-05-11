# ADR 005: Canvas Rendering Optimization

## Status
Accepted

## Context
Rendering hundreds of complex shapes on every frame can cause significant CPU/GPU load, leading to dropped frames (FPS drop).

## Decision
We use a **Layered/Buffered Rendering** approach.

## Consequences
- **Pros**: Only the "Active" layer (current stroke) is drawn on every frame. The "Background" layer (static shapes) is cached in an offscreen canvas and only re-drawn when the camera moves or a shape is added/deleted.
- **Cons**: Slightly higher memory usage (two canvases instead of one).
- **Implementation**: Managed inside the `draw` utility in `apps/excelidraw-frontend/draw/index.ts`.
