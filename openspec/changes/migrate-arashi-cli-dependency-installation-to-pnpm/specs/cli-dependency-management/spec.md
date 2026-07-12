## ADDED Requirements

### Requirement: pnpm is the CLI dependency manager
The Arashi CLI repository SHALL declare a pinned pnpm version, commit a pnpm lockfile as its authoritative dependency graph, and use pnpm for local and automated dependency installation.

#### Scenario: Clean frozen installation
- **WHEN** a contributor or automation installs CLI dependencies from a clean checkout
- **THEN** pnpm installs successfully using the committed lockfile in frozen mode without generating or requiring a Bun lockfile

#### Scenario: Dependency cache invalidation
- **WHEN** the committed pnpm lockfile changes
- **THEN** CLI CI and release dependency caches are invalidated using the pnpm lockfile as the dependency key

### Requirement: pnpm orchestrates CLI development scripts
The Arashi CLI repository SHALL use pnpm to run package scripts and dependency-local executables that do not intrinsically require the Bun runtime.

#### Scenario: Standard validation entry points
- **WHEN** a contributor runs the documented lint, typecheck/schema, test, or build package scripts through pnpm
- **THEN** pnpm resolves and orchestrates the declared scripts and local tools without using Bun as the dependency installer

#### Scenario: Coordinated worktree setup
- **WHEN** Arashi creates a coordinated CLI worktree and executes its post-create hook
- **THEN** the hook installs dependencies with pnpm and completes the repository's expected setup/build behavior

### Requirement: Temporary Bun responsibilities are explicit and minimal
The CLI repository SHALL retain Bun only for commands that still depend on Bun runtime APIs, `bun:test`, or Bun standalone compilation, and SHALL NOT represent this migration slice as complete Bun removal.

#### Scenario: Runtime and test compatibility during migration
- **WHEN** pnpm invokes a test, source-execution, or build script that still requires Bun
- **THEN** that script explicitly invokes Bun and continues to preserve existing behavior

#### Scenario: CI and release tool setup
- **WHEN** a CI or release job no longer executes a Bun-dependent command
- **THEN** that job does not install Bun solely for dependency installation or package-script orchestration

### Requirement: Existing distribution contract is preserved
The dependency-manager migration SHALL preserve the CLI's npm package behavior, standalone executable asset names, checksum generation, direct installers, update paths, and supported release targets.

#### Scenario: Standalone build validation
- **WHEN** release or CI build scripts run after the pnpm migration
- **THEN** they produce and smoke-test the same expected standalone CLI artifacts as before the migration

#### Scenario: End-user install channels
- **WHEN** users install or update Arashi through npm-compatible package managers or direct installers
- **THEN** their existing commands and resulting CLI behavior remain unchanged
