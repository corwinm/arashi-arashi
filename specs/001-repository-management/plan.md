# Implementation Plan: Repository Management

**Branch**: `001-repository-management` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-repository-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement repository discovery and management functionality that scans for git repositories, detects default branches and setup scripts, clones repositories, validates repository structure, and gathers repository metadata. This is a foundational layer that provides repository discovery and information to other features like worktree orchestration. The system recursively scans workspace directories to find git repositories, automatically detects repository configurations, and validates workspace structure against expected configurations.

## Technical Context

**Language/Version**: TypeScript (latest stable) with Bun (latest stable version for bundling and runtime)
**Primary Dependencies**: 
- Git utility library (001-git-utility-lib) - for git operations (branch detection, remote queries)
- Filesystem utilities (005-filesystem-utilities) - for directory traversal and file checks
- Logger utilities (006-logger-utilities) - for progress reporting during long operations
- Configuration management (001-config-management) - for reading workspace configuration

**Storage**: No persistent storage required (discovery results in-memory), reads configuration from `.arashi/config.json`
**Testing**: Bun test runner with unit tests for discovery and detection logic, integration tests with real git repositories
**Target Platform**: Cross-platform (macOS, Linux, Windows) - uses Bun runtime APIs only
**Project Type**: Library layer within single executable project (arashi)
**Performance Goals**: 
- Discover 50 repositories in under 5 seconds
- Default branch detection: under 100ms per repository
- Clone operations: bound by network speed (30 seconds for typical 100MB repo)

**Constraints**: 
- Must not modify repositories during discovery (read-only operations)
- Must handle corrupted or invalid git repositories gracefully
- Must respect filesystem permissions
- Clone operations must validate target paths before starting
- Must support configurable scan depth to prevent excessive directory traversal

**Scale/Scope**: 
- Typical workspace: 5-20 repositories
- Large workspace: up to 200 repositories
- Scan depth: configurable (default 3 levels)
- Repository metadata: two-tier (basic/detailed)
- Clone operations: one at a time (no parallel cloning in initial version)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Single-File Executable
**Status**: COMPLIANT - This is a library module within the arashi executable, no changes to distribution model.

### ✅ II. Automatic Worktree Management
**Status**: COMPLIANT - Provides repository discovery and management capabilities that enable automatic worktree creation. Discovers repositories automatically so users don't need manual configuration.

### ✅ III. Error Recovery & Rollback
**Status**: COMPLIANT - Discovery operations are read-only (no rollback needed). Clone operations include cleanup on failure (remove partial clones). Validates before destructive operations.

### ✅ IV. User-Centric Interface
**Status**: COMPLIANT - Clear error messages with repository context, progress reporting for long operations (discovery, cloning), structured results showing what was found/missing.

### ✅ V. Minimalist Configuration
**Status**: COMPLIANT - Auto-discovers repositories without configuration, only requires workspace path. Configuration is optional (for validation and cloning). Uses sensible defaults (scan depth 3, common branch names).

### ✅ VI. Cross-Platform Compatibility
**Status**: COMPLIANT - Uses Bun runtime APIs only (file system, path, spawn), cross-platform path handling, git operations work on all platforms.

### ✅ VII. Test Coverage
**Status**: COMPLIANT - Will implement >80% coverage with unit tests (discovery, detection, validation) and integration tests (real repository scenarios, clone operations).

### ✅ VIII. Semantic Versioning
**Status**: COMPLIANT - No impact on versioning, follows project-wide versioning strategy.

### ✅ IX. Hook System
**Status**: COMPLIANT - Setup script detection supports hook-like functionality (identifies scripts for execution after worktree creation). No direct hook integration needed at this layer.

### ✅ X. Performance Standards
**Status**: COMPLIANT - Performance goals meet requirements (5 seconds for 50 repos, immediate feedback for individual operations). Configurable limits prevent performance degradation on large workspaces.

**Overall Assessment**: ✅ **ALL GATES PASS** - No constitutional violations, no complexity justification required.

## Project Structure

### Documentation (this feature)

```text
specs/001-repository-management/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── repository-api.ts  # TypeScript interfaces for repository functions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
repos/arashi/
├── src/
│   ├── core/
│   │   ├── repository.ts         # Main repository management (THIS FEATURE)
│   │   ├── worktree.ts           # Worktree orchestration (depends on this)
│   │   └── rollback.ts           # Rollback mechanism
│   ├── lib/
│   │   ├── git.ts                # Git operations (dependency: 001-git-utility-lib)
│   │   ├── config.ts             # Configuration (dependency: 001-config-management)
│   │   ├── logger.ts             # Logging utilities (dependency: 006-logger-utilities)
│   │   ├── filesystem.ts         # Filesystem utilities (dependency: 005-filesystem-utilities)
│   │   └── prompts.ts            # Prompt utilities (dependency: 007-prompt-utilities)
│   └── cli/
│       └── commands/
│           ├── create.ts         # CLI command for worktree creation
│           └── status.ts         # CLI command for workspace status (may use repository info)
│
└── tests/
    ├── unit/
    │   └── core/
    │       └── repository.test.ts  # Unit tests for repository management
    ├── integration/
    │   └── repository-integration.test.ts  # Integration tests with real repos
    └── fixtures/
        └── test-repos/           # Test git repositories for integration tests
```

**Structure Decision**: Single project structure (Option 1) with repository management as a core module (`src/core/repository.ts`). This module is at the same level as worktree orchestration and provides foundational repository discovery and information. Library utilities are in `src/lib/` and provide lower-level operations. Test fixtures include real git repositories with different configurations (main vs master, with/without setup scripts, etc.) for comprehensive integration testing.

## Complexity Tracking

**No violations to track** - All constitutional requirements are met.
