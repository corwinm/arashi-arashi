# project-package-management Specification

## Purpose
Define pnpm as the dependency manager and script orchestrator for Arashi's JavaScript and TypeScript repositories while preserving existing distribution and installation contracts.
## Requirements
### Requirement: pnpm is the Arashi project dependency manager
Each Arashi JavaScript or TypeScript repository that currently uses Bun for dependency installation SHALL declare a pinned pnpm version, commit a pnpm lockfile as its authoritative dependency graph, and use pnpm for local and automated dependency installation.

#### Scenario: Clean frozen installation
- **WHEN** a contributor or automation installs dependencies from a clean checkout of `arashi-arashi`, `arashi`, `arashi-docs`, or `arashi-vscode`
- **THEN** pnpm installs successfully using the repository's committed lockfile in frozen mode without generating or requiring a Bun lockfile

#### Scenario: Dependency cache invalidation
- **WHEN** a repository's committed pnpm lockfile changes
- **THEN** its CI, release, or deployment dependency cache is invalidated using that pnpm lockfile

### Requirement: pnpm orchestrates project scripts
Affected repositories SHALL use pinned Corepack pnpm to run package scripts and dependency-local executables that do not intrinsically require the Bun runtime. Coordinated child-worktree setup SHALL honor each child's committed `packageManager` and lockfile, SHALL avoid selecting the ancestor meta workspace, and SHALL propagate install/build failure to Arashi.

#### Scenario: Standard validation entry points
- **WHEN** a contributor runs documented lint, typecheck, test, build, or validation scripts through pnpm
- **THEN** pnpm resolves and orchestrates the declared scripts and local tools without using Bun as the dependency installer

#### Scenario: Coordinated worktree setup
- **WHEN** Arashi creates a coordinated worktree for an affected pnpm repository and executes its post-create hook
- **THEN** the hook sets `CI=true` using syntax native to the current shell and runs `corepack pnpm --ignore-workspace install --frozen-lockfile`
- **AND** POSIX guidance may use `CI=true command`, PowerShell guidance uses `$env:CI = "true"` before the command, and command-script guidance uses `set "CI=true"`
- **AND** uses the child's pinned pnpm version and committed lockfile rather than the ancestor meta workspace
- **AND** any required install or build failure makes the hook fail

#### Scenario: Every configured pnpm child has an explicit provisioning policy
- **WHEN** a configured Arashi child repository declares pnpm
- **THEN** the meta workspace either provides the same ready-after-create provisioning hook or explicitly documents that repository as manual setup
- **AND** the default Arashi project policy is automatic provisioning

#### Scenario: Docs deployment
- **WHEN** Netlify or GitHub Actions builds and validates `arashi-docs`
- **THEN** dependencies are installed from `pnpm-lock.yaml` with pinned pnpm and existing generated-content and site validation behavior is preserved

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

