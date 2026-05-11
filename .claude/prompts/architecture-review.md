# Architecture Review Prompt

Use this prompt before a major refactor or when introducing a new app/package.

## Context
QuickDraw is a Turborepo monorepo with strict boundary rules.

## Instructions
1. **Dependency Validation**: Check if the new package follows the `@repo/` naming convention.
2. **Circular Check**: Ensure the change doesn't introduce a dependency cycle.
3. **DRY Audit**: Check if the logic should live in `packages/` rather than being duplicated across `apps/`.
4. **Pattern Alignment**: Does the new code follow the existing Prisma/Clerk/WS patterns?

## Output
A "Go/No-Go" recommendation with a list of architectural concerns.
