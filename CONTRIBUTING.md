# Contributing to QuickDraw

This guide outlines the process for contributing to the QuickDraw project.

## Getting Started

### Prerequisites
- Node.js: Use version 20 or 22
- pnpm: Version 9.x is required for monorepo management
- Docker: Optional, used for running the local database

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/rajputdivyanshu81/QuickDraw.git
   cd QuickDraw
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Database Setup:
   ```bash
   pnpm db:generate
   ```

4. Run Development Environment:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Monorepo Overview
- apps: Contains the applications (Frontend, HTTP/WS Backends)
- packages: Contains shared logic, UI components, and configurations

### Commands
- Format: pnpm format
- Lint: pnpm lint
- Type Check: pnpm check-types
- Test: pnpm test

## Contribution Process

### Pull Requests
- Create a new branch from main for your changes.
- Ensure all CI checks (lint, check-types, test) pass locally before submitting.
- Provide a clear description of your changes in the PR.

### Communication
- Use Discussions for feature ideas, suggestions, and general questions.
- Use Issues for bug reports and tracking specific tasks.
