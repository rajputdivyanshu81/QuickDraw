# repo-intelligence

## 🎯 Purpose
Generate architecture-aware insights that map code patterns to system design.

## 🛠️ Workflow
1.  **Service Map Generation**: Outline interactions between apps and packages.
2.  **Realtime Schema Trace**: Trace events from `Canvas.tsx` to `ws-backend` to `Prisma`.
3.  **Dependency Graphing**: Identify high-risk "god packages" or excessive external deps.
4.  **Onboarding Synthesis**: Summarize the "core loop" of the codebase for new context.

## 📋 Engineering Checklist
- [ ] Logic for a single feature is contained within its own workspace.
- [ ] Shared types are centrally located in `packages/`.
- [ ] Database schema changes are documented in ADRs.

## 📤 Expected Output Format
- **Service Dependency Map**: Visual/Textual representation of service links.
- **Event Flow Diagram**: Path of a drawing event.
- **Codebase Health Report**: Consistency and modularity scores.
