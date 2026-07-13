## ADDED Requirements

### Requirement: pnpm is the Arashi project dependency manager
Each Arashi JavaScript or TypeScript repository that currently uses Bun for dependency installation SHALL declare a pinned pnpm version, commit a pnpm lockfile as its authoritative dependency graph, and use pnpm for local and automated dependency installation.

#### Scenario: Clean frozen installation
- **WHEN** a contributor or automation installs dependencies from a clean checkout of `arashi-arashi`, `arashi`, `arashi-docs`, or `arashi-vscode`
- **THEN** pnpm installs successfully using the repository's committed lockfile in frozen mode without generating or requiring a Bun lockfile

#### Scenario: Dependency cache invalidation
- **WHEN** a repository's committed pnpm lockfile changes
- **THEN** its CI, release, or deployment dependency cache is invalidated using that pnpm lockfile

### Requirement: pnpm orchestrates project scripts
Affected repositories SHALL use pnpm to run package scripts and dependency-local executables that do not intrinsically require the Bun runtime.

#### Scenario: Standard validation entry points
- **WHEN** a contributor runs documented lint, typecheck, test, build, or validation scripts through pnpm
- **THEN** pnpm resolves and orchestrates the declared scripts and local tools without using Bun as the dependency installer

#### Scenario: Coordinated worktree setup
- **WHEN** Arashi creates a coordinated worktree for an affected repository and executes its post-create hook
- **THEN** the hook installs dependencies with pnpm and completes the repository's expected setup behavior

#### Scenario: Docs deployment
- **WHEN** Netlify or GitHub Actions builds and validates `arashi-docs`
- **THEN** dependencies are installed from `pnpm-lock.yaml` with pnpm and existing generated-content and site validation behavior is preserved

### Requirement: Remaining Bun responsibilities are explicit and minimal
Affected repositories SHALL retain Bun only for production runtime or compilation commands that have not yet been replaced and SHALL NOT use Bun for dependency installation or test execution.

#### Scenario: CI and release tool setup
- **WHEN** a CI, release, or deployment job no longer executes a Bun-dependent production or compiler command
- **THEN** that job does not install Bun

#### Scenario: Retained standalone compilation
- **WHEN** the Arashi CLI standalone build runs before a replacement packager is approved
- **THEN** the build may invoke Bun explicitly while all dependency installation and tests remain pnpm- and Node-based

### Requirement: Existing distribution contract is preserved
The package-manager migration SHALL preserve npm package behavior, standalone executable asset names, checksum generation, direct installers, update paths, supported release targets, and documented end-user installation channels.

#### Scenario: Standalone build validation
- **WHEN** release or CI build scripts run after the pnpm migration
- **THEN** they produce and smoke-test the same expected standalone CLI artifacts as before the migration

#### Scenario: End-user install channels
- **WHEN** users install or update Arashi through npm-compatible package managers, Bun, or direct installers
- **THEN** their existing commands and resulting CLI behavior remain unchanged
