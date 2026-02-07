# Implementation Plan: Worktree Orchestration

**Branch**: `013-worktree-orchestration` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-worktree-orchestration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement coordinated worktree creation across multiple git repositories with automatic rollback on failure. The system orchestrates worktree creation from a single command, detects and resolves branch conflicts, supports repository filtering (all/explicit/interactive), displays progress indicators, executes lifecycle hooks, and maintains an operation log for automatic cleanup when errors occur. This is the core orchestration layer that coordinates between repository management, rollback mechanisms, git operations, prompts, and logging utilities.

## Technical Context

**Language/Version**: TypeScript (latest stable) with Bun (latest stable version for bundling and runtime)
**Primary Dependencies**: 
- Git utility library (001-git-utility-lib) - for git operations
- Rollback mechanism (001-rollback-mechanism) - for operation logging and cleanup
- Repository management (001-repository-management) - for discovering and validating repositories
- Logger utilities (006-logger-utilities) - for progress spinners and colored output
- Prompt utilities (007-prompt-utilities) - for interactive repository selection and conflict resolution
- Configuration management (001-config-management) - for reading workspace configuration and hook settings
- Hooks system (001-github-issues) - for executing pre-create and post-create hooks

**Storage**: Operation log maintained in memory during execution, configuration read from `.arashi/config.json`
**Testing**: Bun test runner with unit tests for orchestration logic, integration tests with multiple test repositories
**Target Platform**: Cross-platform (macOS, Linux, Windows) - uses Bun runtime APIs only
**Project Type**: Library layer within single executable project (arashi)
**Performance Goals**: Create coordinated worktrees across 10 repositories in under 30 seconds, rollback within 10 seconds
**Constraints**: 
- Must maintain atomic consistency (all-or-nothing for multi-repo operations)
- Must respect hook timeout configurations
- Progress indicators must update within 500ms of status changes
- Must handle concurrent operations safely (prevent race conditions in rollback)

**Scale/Scope**: 
- Typical workspace: 5-20 repositories
- Large workspace: up to 50 repositories
- Support for 3 filtering modes (all/explicit/interactive)
- 2 conflict resolution strategies (abort/reuse)
- 2 hook types per repository (pre-create/post-create)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Single-File Executable
**Status**: COMPLIANT - This is a library module within the arashi executable, no changes to distribution model.

### ✅ II. Automatic Worktree Management
**Status**: COMPLIANT - This IS the core worktree coordination feature. Directly implements "one command creates worktrees for main repo + all sub-repos".

### ✅ III. Error Recovery & Rollback
**Status**: COMPLIANT - Implements automatic rollback via operation log (dependency on 001-rollback-mechanism). All operations tracked and reversed on failure.

### ✅ IV. User-Centric Interface
**Status**: COMPLIANT - Uses logger utilities for spinners/progress, prompt utilities for interactive dialogs, color-coded output, detailed error messages with repository context.

### ✅ V. Minimalist Configuration
**Status**: COMPLIANT - Reads configuration from 001-config-management, auto-discovers repositories via 001-repository-management, manual filters only when desired.

### ✅ VI. Cross-Platform Compatibility
**Status**: COMPLIANT - Uses Bun runtime APIs only (spawn, file system, path), repository paths handled via cross-platform path utilities, depends on cross-platform git operations.

### ✅ VII. Test Coverage
**Status**: COMPLIANT - Will implement >80% coverage with unit tests (orchestration logic, filtering, conflict detection) and integration tests (multi-repo scenarios with test fixtures).

### ✅ VIII. Semantic Versioning
**Status**: COMPLIANT - No impact on versioning, follows project-wide versioning strategy.

### ✅ IX. Hook System
**Status**: COMPLIANT - Integrates with hooks system (001-github-issues), executes pre-create/post-create hooks at appropriate lifecycle points, respects --no-hooks flag, handles hook failures with rollback.

### ✅ X. Performance Standards
**Status**: COMPLIANT - Performance goals align with constitution (30 seconds for multiple repos, shows progress for operations > 1 second). Will use parallel operations where safe (e.g., branch conflict detection across repos).

**Overall Assessment**: ✅ **ALL GATES PASS** - No constitutional violations, no complexity justification required.

## Project Structure

### Documentation (this feature)

```text
specs/013-worktree-orchestration/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── worktree-api.ts  # TypeScript interfaces for orchestration functions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
repos/arashi/
├── src/
│   ├── core/
│   │   ├── worktree.ts           # Main orchestration logic (THIS FEATURE)
│   │   ├── rollback.ts           # Rollback mechanism (dependency: 001-rollback-mechanism)
│   │   └── repository.ts         # Repository management (dependency: 001-repository-management)
│   ├── lib/
│   │   ├── git.ts                # Git operations (dependency: 001-git-utility-lib)
│   │   ├── config.ts             # Configuration (dependency: 001-config-management)
│   │   ├── logger.ts             # Logging utilities (dependency: 006-logger-utilities)
│   │   ├── prompts.ts            # Prompt utilities (dependency: 007-prompt-utilities)
│   │   ├── filesystem.ts         # Filesystem utilities (dependency: 005-filesystem-utilities)
│   │   └── hooks.ts              # Hooks system (dependency: 001-github-issues)
│   └── cli/
│       └── commands/
│           └── create.ts         # CLI command that calls core/worktree.ts
│
└── tests/
    ├── unit/
    │   └── core/
    │       └── worktree.test.ts  # Unit tests for orchestration logic
    └── integration/
        └── worktree-integration.test.ts  # Multi-repo integration tests
```

**Structure Decision**: Single project structure (Option 1) with clear separation between core orchestration logic (`src/core/worktree.ts`), library utilities (`src/lib/`), and CLI commands (`src/cli/commands/`). The worktree orchestration module is part of the core layer and coordinates between lower-level utilities. This follows the existing arashi project structure established in the constitution and earlier feature specifications.

## Complexity Tracking

**No violations to track** - All constitutional requirements are met.
