# Claude Code Skills

This directory contains custom skills (tools) for Claude Code. Skills allow the AI to perform complex tasks specific to the QuickDraw repository.

## How to add a skill
1. Create a `.ts` or `.js` file in this directory.
2. Define your tool logic using the Claude Code tool definition format.
3. Restart your Claude Code session to load the new skills.

## Recommended Skills for QuickDraw
- **Monorepo Health**: A tool to run linting and type-checking across all packages.
- **Database Manager**: A tool to wrap common Prisma commands (`generate`, `migrate`, `studio`).
- **Environment Sync**: A tool to ensure all `.env` files match their `.env.example` templates.
