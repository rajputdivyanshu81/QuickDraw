# Production Readiness Prompt

Use this prompt before deploying to a production environment.

## Context
QuickDraw must handle high concurrency and protect user data.

## Instructions
1. **Secret Audit**: Run a scan for hardcoded keys.
2. **Error Logging**: Ensure `ws-backend` has a global error handler that won't crash the server.
3. **Scaling Check**: Is Redis configured for Pub/Sub?
4. **Auth Hardening**: Are Clerk webhooks secured?
5. **DB Migration**: Are there any pending Prisma migrations?

## Output
A "Launch Checklist" of remaining tasks before the production push.
