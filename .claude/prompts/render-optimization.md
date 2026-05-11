# Render Optimization Prompt

Use this prompt to optimize the drawing canvas performance.

## Context
QuickDraw uses a custom canvas engine. FPS drops impact user experience directly.

## Instructions
1. **Context State Audit**: Identify how many `ctx.strokeColor` or `ctx.lineWidth` changes happen per frame.
2. **Layer Analysis**: Evaluate if the background is being re-rendered unnecessarily.
3. **Event Loop Contention**: Check if heavy JS logic (e.g., collision detection) is running inside the `requestAnimationFrame` loop.
4. **Memory Leaks**: Identify if canvas objects or listeners are being cleaned up on component unmount.

## Output
A list of "Quick Wins" (minor code changes) and "Architectural Shifts" (e.g., moving to WebGL or OffscreenCanvas).
