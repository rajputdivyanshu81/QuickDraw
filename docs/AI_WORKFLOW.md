# AI-Native Engineering Workflow

How to collaborate with AI assistants (Antigravity/Claude) to build and maintain QuickDraw.

## 🧠 The "Architecture-Aware" Loop
Always use this 3-step loop when making changes:
1.  **Understand**: Run `repo-intelligence` to map the impact of your change.
2.  **Review**: Run the relevant review skill (`websocket-review`, `security-review`, etc.).
3.  **Implement & Log**: Execute the change and create a new ADR in `docs/decisions/` if a structural choice was made.

## 🛠️ Specialized Prompts
Use the prompts in `.claude/prompts/` for specific engineering tasks:
- **`scaling-analysis.md`**: For evaluating if a new feature will scale to 100+ concurrent users.
- **`websocket-debugging.md`**: For tracing lost packets or sync issues.
- **`render-optimization.md`**: For debugging canvas lag or memory leaks.

## 📝 Coding Standards for AI
When generating code, the AI MUST:
- Adhere to the **PascalCase/camelCase** rules defined in `CLAUDE.md`.
- Include **error handling** and **logging** for all WS/DB interactions.
- Prefer **functional patterns** over class-based state where possible.
- Always use **Zod** or strict types for payload validation.

## 🚦 PR Checklist for AI
- [ ] Added unit/integration tests if applicable.
- [ ] Updated `.env.example` if new keys are added.
- [ ] Verified that change doesn't break the "Event-Sourced" canvas pattern.
- [ ] Documented any new WS event types in `docs/SYSTEM_DESIGN.md`.
