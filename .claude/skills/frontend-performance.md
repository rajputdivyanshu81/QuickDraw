# frontend-performance

## 🎯 Purpose
Analyze the rendering pipeline and application responsiveness for high-frequency collaborative interactions.

## 🛠️ Workflow
1.  **Canvas Audit**: Check `requestAnimationFrame` usage and context state management.
2.  **React Hook Optimization**: Review `useEffect` dependencies in `Canvas.tsx`.
3.  **Bundle Inspection**: Identify large client-side imports in `package.json`.
4.  **Network Overhead**: Analyze WS message size and frequency.

## 📋 Engineering Checklist
- [ ] Canvas draw calls are decoupled from React state updates where possible.
- [ ] Optimistic updates are used for local drawing strokes.
- [ ] Large assets (icons, fonts) are pre-cached.
- [ ] Offscreen canvas or layer-based rendering is considered for complex scenes.

## ⚠️ Severity Levels
- **CRITICAL**: Main thread blocking during drawing, memory leaks in canvas listeners.
- **WARNING**: Layout shifts during hydration, non-debounced UI updates.
- **INFO**: Unoptimized images or icons.

## 📤 Expected Output Format
- **Performance Report**: Identifying bottlenecks (JS execution vs Rendering).
- **Optimization Backlog**: Prioritized list of performance fixes.
- **Metrics**: Estimated FPS and latency impacts.
