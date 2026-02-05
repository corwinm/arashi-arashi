# Implementation Plan: Init Command

**Branch**: `001-init-command` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-init-command/spec.md`

## Summary

The Init Command is the foundational entry point for Arashi. It initializes the `.arashi/` workspace structure in an existing git repository, creates default configuration with repository discovery settings, automatically discovers existing repositories in the configured directory, and provides example hook templates for customization. This command establishes the workspace that all other Arashi commands depend on.

## Technical Context

**Language/Version**: TypeScript (latest stable) with Bun (latest stable version for bundling and runtime)  
**Primary Dependencies**: Bun runtime (built-in APIs only - spawn, file system, path)  
**Storage**: File system (`.arashi/config.json` for configuration, `.arashi/hooks/` for hook templates)  
**Testing**: Bun test runner with unit and integration tests  
**Target Platform**: Cross-platform (macOS, Linux, Windows) - single-file executable  
**Project Type**: Single project (CLI tool)  
**Performance Goals**: Complete initialization in under 30 seconds; repository discovery supports up to 50 repositories in standard workspace  
**Constraints**: Must work in any git repository; must not require network access; must handle missing .gitignore gracefully  
**Scale/Scope**: Single command implementation with 4 core operations (validation, directory creation, config generation, repository discovery)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Single-File Executable** | ✅ PASS | No change to build process; uses existing Bun bundling |
| **II. Automatic Worktree Management** | ✅ PASS | Init prepares workspace for worktree commands; no worktree logic in this command |
| **III. Error Recovery & Rollback** | ✅ PASS | Must implement rollback if initialization fails partway (e.g., .arashi created but config write fails) |
| **IV. User-Centric Interface** | ✅ PASS | Progress spinners for long operations; clear success message with discovered repo count; helpful error messages |
| **V. Minimalist Configuration** | ✅ PASS | Auto-discovers repos in repos/ dir; minimal default config; only 3 required settings (version, repos_dir, auto_setup) |
| **VI. Cross-Platform Compatibility** | ✅ PASS | Uses Bun cross-platform APIs; path handling via Bun's path module; .gitignore updates work on all platforms |
| **VII. Test Coverage** | ✅ PASS | Integration tests for complete init workflow; unit tests for config generation, repo discovery, gitignore updates |
| **VIII. Semantic Versioning** | ✅ PASS | This is a new feature (0.x → 0.y version bump); no breaking changes |
| **IX. Hook System** | ✅ PASS | Creates example hook templates in .arashi/hooks/; no hook execution during init |
| **X. Performance Standards** | ✅ PASS | Initialization target: <30 seconds (SC-001 in spec); repository discovery should handle typical workspaces (10-20 repos) |

**Rollback Strategy**: If any operation fails after .arashi directory creation, remove the entire .arashi directory to leave repository in clean state. Track operations in sequence and reverse on error.

## Project Structure

### Documentation (this feature)

```text
specs/001-init-command/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (dependency patterns, .gitignore best practices)
├── data-model.md        # Phase 1 output (configuration schema, hook templates)
├── quickstart.md        # Phase 1 output (init command usage guide)
├── contracts/           # Phase 1 output (command interface contract)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repos/arashi/)

```text
repos/arashi/
├── src/
│   ├── commands/
│   │   └── init.ts           # NEW: Init command implementation
│   ├── lib/
│   │   ├── config.ts         # EXISTING: Config utilities (already implemented)
│   │   ├── filesystem.ts     # EXISTING: File operations (already implemented)
│   │   ├── git.ts            # EXISTING: Git utilities (already implemented)
│   │   ├── logger.ts         # EXISTING: Progress & error display (already implemented)
│   │   └── prompts.ts        # EXISTING: User interaction (already implemented)
│   ├── core/
│   │   └── repository.ts     # EXISTING: Repo discovery (already implemented)
│   └── index.ts              # EXISTING: CLI entry point (needs init command registration)
│
└── tests/
    ├── unit/
    │   ├── commands/
    │   │   └── init.test.ts  # NEW: Unit tests for init logic
    │   └── lib/
    │       └── gitignore.test.ts  # NEW: Unit tests for .gitignore updates
    └── integration/
        └── init.test.ts      # NEW: E2E init command tests
```

**Structure Decision**: Single project structure (repos/arashi) is maintained. Init command follows existing patterns established by `create.ts` command. New command file in `src/commands/`, integration with existing utilities in `src/lib/` and `src/core/`. Tests follow existing structure with unit and integration separation.

## Complexity Tracking

> **No constitutional violations** - all principles satisfied with existing patterns.

## Phase 0: Research & Investigation

**Status**: ✅ Complete

### Research Questions

1. **Hook Template Patterns**: What should example hook templates contain? What are common use cases?
   - **Decision**: Provide 3 example templates (pre-create.sh, post-create.sh, setup.sh) with comments explaining use cases and available environment variables
   - **Rationale**: These match the hooks supported by Constitution Principle IX; examples help users understand extensibility
   - **Alternatives Considered**: Single example hook (insufficient guidance); full working examples (too prescriptive)

2. **.gitignore Update Strategy**: How should we handle different .gitignore scenarios (missing file, existing entries, etc.)?
   - **Decision**: Create .gitignore if missing; append entry with blank line separator if exists; check for exact match to avoid duplicates
   - **Rationale**: Idempotent operation; respects existing user configuration; follows git best practices
   - **Alternatives Considered**: Always append (creates duplicates); parse and dedupe (complex, error-prone); prompt user (friction)

3. **Rollback Granularity**: What operations need rollback if init fails?
   - **Decision**: Track 4 operations in order: (1) .arashi directory creation, (2) config file write, (3) repos directory creation, (4) .gitignore update. On error, reverse completed operations.
   - **Rationale**: Follows Constitution Principle III; leaves repo in clean state; simple reverse order logic
   - **Alternatives Considered**: No rollback (violates constitution); transactional filesystem (not available); backup/restore (complex)

4. **Repository Discovery Scope**: Should init discover repos in subdirectories or just top-level?
   - **Decision**: Use existing `discoverRepositories()` with maxDepth=3 (already implemented in core/repository.ts)
   - **Rationale**: Reuses battle-tested discovery logic; handles nested structures; configurable via discovery options
   - **Alternatives Considered**: Top-level only (too restrictive); unlimited depth (performance concerns); custom discovery (code duplication)

5. **Configuration Validation**: Should init validate git repository before proceeding?
   - **Decision**: Yes, check for .git directory/file existence before any operations. Use existing `git.exec(['rev-parse', '--git-dir'])` pattern.
   - **Rationale**: FR-001 requirement; prevents creating .arashi in non-git directories; provides clear error message
   - **Alternatives Considered**: No validation (violates spec); check .git existence only (less reliable); full git status (overkill)

### Dependency Analysis

| Dependency | Usage | Status |
|------------|-------|--------|
| `src/lib/config.ts` | Configuration generation, validation, persistence | ✅ Implemented (lines 187-209, 242-274, 475-493) |
| `src/lib/filesystem.ts` | Directory creation, file existence checks, file I/O | ✅ Implemented (ensureDir, fileExists, writeTextFile) |
| `src/lib/git.ts` | Git repository validation | ✅ Implemented (exec function for git commands) |
| `src/lib/logger.ts` | Progress spinners, success/error messages | ✅ Implemented (spinner, success, error, warn functions) |
| `src/core/repository.ts` | Repository discovery in repos directory | ✅ Implemented (discoverRepositories function, lines 334-429) |

**Best Practices**:
- **Error Handling**: Use try-catch with specific error types (ConfigError, FilesystemError, GitError); provide context in error messages
- **.gitignore Updates**: Always append with newline prefix to ensure proper formatting; check for exact match before adding
- **Path Handling**: Use Bun's path.join() for cross-platform compatibility; resolve relative paths to absolute
- **User Feedback**: Show spinner during long operations (repo discovery); display count of discovered repos in success message

## Phase 1: Design & Contracts

### Data Model

**See**: [data-model.md](./data-model.md) for complete schema definitions

**Key Entities**:
1. **InitOptions**: Command-line options for init command (repos_dir override, force flag)
2. **InitResult**: Result of initialization (success/failure, discovered repo count, created paths)
3. **HookTemplate**: Example hook script with metadata (name, description, example script content)

### API Contracts

**See**: [contracts/](./contracts/) for complete command interface specifications

**Command Interface**:
```text
arashi init [options]

Options:
  --repos-dir <path>  Custom location for managed repositories (default: ./repos)
  --force             Overwrite existing configuration
  --no-discover       Skip repository discovery
```

**Exit Codes**:
- 0: Success
- 1: Not in a git repository
- 2: Configuration already exists (without --force)
- 3: Filesystem error (permissions, disk full)

### Quickstart Guide

**See**: [quickstart.md](./quickstart.md) for user-facing documentation

## Phase 2: Task Breakdown

**Not generated by this command** - run `/speckit.tasks` to create implementation tasks from this plan.

---

## Agent Context Update

Run after completing Phase 1 design:

```bash
.specify/scripts/bash/update-agent-context.sh opencode
```

This updates the AGENTS.md file with any new technologies or patterns introduced by this feature. For init command, this is minimal (no new dependencies) but ensures the command list and project structure docs are current.
