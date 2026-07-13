## Why

Arashi-related repositories currently use Bun for dependency installation, test execution, and—in some repositories—source execution or compilation. Moving dependency management to pnpm and tests to a Node-compatible framework now reduces Bun coupling across the project while allowing the CLI's unresolved standalone executable packaging decision to remain separate until Node SEA, `pnpm pack-app`, or another alternative is production-ready.

## What Changes

- Make pnpm the declared dependency manager for every Arashi JavaScript/TypeScript repository that currently uses Bun for dependency installation: `arashi-arashi`, `arashi`, `arashi-docs`, and `arashi-vscode`.
- Replace Bun lockfiles with pnpm lockfiles and use frozen pnpm installs in local setup, coordinated-worktree hooks, CI, release workflows, and deployment configuration.
- Replace `bun:test` with Vitest in `arashi-arashi`, `arashi`, and `arashi-vscode`.
- Replace Bun APIs used by tests, fixtures, and test-build helpers with Node-compatible filesystem, subprocess, mocking, and build-tool APIs so tests run under Node rather than Bun.
- Preserve existing test coverage, unit/integration boundaries, platform matrices, VS Code extension-host tests, and CLI binary smoke tests.
- Retain Bun temporarily only where production source execution or standalone compilation still requires it.
- Preserve the current npm package, direct installers, standalone release assets, checksums, supported update paths, and user-facing support for installing Arashi through Bun.
- Defer production CLI `Bun.*` API replacement and standalone-packager selection only where they are not required to run the tests under Node.

## Capabilities

### New Capabilities

- `project-package-management`: Defines reproducible pnpm-based dependency installation and package-script orchestration across Arashi JavaScript/TypeScript repositories.
- `node-test-execution`: Defines Node-compatible unit and integration test execution without `bun:test` or Bun runtime APIs in test code and helpers.

### Modified Capabilities

<!-- No existing user-facing CLI behavior requirements change. -->

## Impact

- Affected repositories: `corwinm/arashi-arashi`, `corwinm/arashi`, `corwinm/arashi-docs`, and `corwinm/arashi-vscode`.
- `corwinm/arashi-skills` has no JavaScript dependency installation and requires no package-manager migration.
- Expected paths include package manifests, lockfiles, test configuration, tests and helpers, build/test scripts, CI and release workflows, Netlify configuration, coordinated-worktree hooks, and contributor guidance.
- The CLI may still require Bun temporarily for production runtime APIs and `bun build --compile`; the VS Code extension may retain Bun compilation only until its build path is replaced with a Node-compatible bundler.
- Follow-up work can independently migrate remaining production Bun APIs and evaluate production-ready standalone packaging alternatives for issue #155.
