# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-11

### Added
- **CI/CD Pipeline**: Automated linting, type-checking, and testing using GitHub Actions and Turborepo.
- **GitHub Labeler**: Automated PR labeling based on modified file paths.
- **Project Documentation**: Added a technical `CONTRIBUTING.md` and updated `README.md` with modern badges and links.
- **Issue Templates**: Added configuration to redirect questions to GitHub Discussions.
- **Discussion Templates**: Added a "Welcome" template for GitHub Discussions.

### Changed
- **Node.js**: Updated project CI to use Node.js v22.
- **ESLint Configuration**: Disabled `react/prop-types` for TypeScript packages to reduce noise.
- **README**: Modernized layout with high-quality mockups and a live demo link.

### Fixed
- **pnpm Version Conflict**: Resolved version mismatch between `package.json` and GitHub Action config.
- **Labeler Permissions**: Updated workflow to `pull_request` and `v5` to fix "Not Found" errors.
- **Lint Errors**: Resolved missing key props and variable warnings in the web application.

## [1.0.0] - 2026-01-18

### Added
- Initial monorepo structure with Next.js, Express, and WebSockets.
- Real-time drawing synchronization.
- AI design assistance integration.
- Clerk authentication.
