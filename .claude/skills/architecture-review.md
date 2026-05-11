# architecture-review

## 🎯 Purpose
Perform a deep structural audit of the monorepo to ensure architectural integrity, scalability, and adherence to workspace boundaries.

## 🛠️ Workflow
1.  **Dependency Mapping**: Identify internal `@repo/` dependencies and external package bloat.
2.  **Boundary Validation**: Check if apps are leaking logic or depending on each other directly.
3.  **Config Consistency**: Audit `tsconfig.json`, `eslint.config.js`, and `package.json` patterns.
4.  **Data Flow Audit**: Trace how state moves between `packages/db` and `apps/`.

## 📋 Engineering Checklist
- [ ] No circular dependencies between workspaces.
- [ ] Shared UI components in `packages/ui` are truly generic.
- [ ] `packages/db` is the only place where Prisma is initialized.
- [ ] Apps use standardized config from `packages/typescript-config`.

## ⚠️ Severity Levels
- **CRITICAL**: Circular dependencies or cross-app direct imports.
- **WARNING**: Inconsistent linting/TS configs, duplicate logic in `packages/`.
- **INFO**: Minor naming convention deviations.

## 📉 Scalability Analysis
- Does the current structure allow adding a new `mobile-app` workspace without refactoring?
- Are shared packages versioned or synced via `workspace:*`?

## 📤 Expected Output Format
- **Architecture Health Score**: 1-10.
- **Violation List**: File-specific architectural leaks.
- **Action Plan**: Steps to reconcile boundaries.
