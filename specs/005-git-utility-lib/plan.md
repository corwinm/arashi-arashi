# Implementation Plan: Git Utility Library

**Branch**: `005-git-utility-lib` | **Date**: 2026-02-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-git-utility-lib/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a core git utility library that provides type-safe, error-aware wrappers around git commands for the Arashi worktree manager. This library will serve as the foundation for all git operations, providing repository detection, worktree management, branch operations, remote synchronization, and status querying. The implementation uses Bun.spawn() for process execution with proper stdout/stderr capture and comprehensive error handling that preserves git diagnostic information.

## Technical Context

**Language/Version**: TypeScript + Bun (latest stable version for bundling and runtime)
**Primary Dependencies**: Bun runtime (built-in APIs only - spawn, file system, path)
**Storage**: N/A (library layer - operates on git repositories on filesystem)
**Testing**: Bun test runner with temporary git repositories
**Target Platform**: Cross-platform (macOS ARM64, Linux x64, Windows x64)
**Project Type**: Single project (utility library)
**Performance Goals**: 
- Repository detection: < 100ms per path check
- Worktree operations: < 5 seconds per worktree for repos up to 10k commits
- Status queries: < 1 second for standard repositories
**Constraints**: 
- Must not introduce external dependencies beyond Bun runtime
- Must preserve all git error output for diagnostic purposes
- Must support git versions 2.5+
**Scale/Scope**: 
- Support repositories with up to 50 worktrees
- Handle git command output up to 10MB
- Core library with ~15 public functions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Single-File Executable
✅ **PASS** - This is a library component that will be bundled into the single-file executable. No external dependencies beyond Bun runtime.

### II. Automatic Worktree Management
✅ **PASS** - This library provides the core git operations needed for automatic worktree coordination (createWorktree, listWorktrees, removeWorktree, branchExists, createBranch, etc.).

### III. Error Recovery & Rollback
✅ **PASS** - Library throws structured errors with git diagnostic output, enabling higher-level code to implement rollback. All operations are atomic at the git level.

### IV. User-Centric Interface
✅ **PASS** - Error messages preserve git output for diagnostics. Library focuses on providing clear operation results that can be formatted for user display by CLI layer.

### V. Minimalist Configuration
✅ **PASS** - Library operates on paths and parameters only. No configuration file dependencies. Auto-detection via isGitRepository and isGitBareRepo functions.

### VI. Cross-Platform Compatibility
✅ **PASS** - Uses Bun's cross-platform APIs (spawn, file system, path). Git commands are standardized across platforms. Will test on macOS, Linux, Windows.

### VII. Test Coverage
✅ **PASS** - Comprehensive unit and integration tests with temporary git repositories. Target >80% coverage with both success and failure scenarios.

### VIII. Semantic Versioning
✅ **PASS** - Library version follows project semantic versioning (currently pre-1.0.0).

### IX. Hook System
✅ **PASS** - Library provides primitives that enable hook system (e.g., exec() for running hook scripts, path operations for hook discovery).

### X. Performance Standards
✅ **PASS** - Performance goals align with constitution standards:
- Worktree creation target: < 5 seconds (within constitution's < 30 seconds for 5 repos)
- Status checks: < 1 second (within constitution's < 5 seconds for 5 repos)

**Result**: All constitutional principles satisfied. No complexity justification required.

### Post-Design Re-evaluation (Phase 1 Complete)

✅ **All gates still passing** - Design decisions reinforce constitutional compliance:

1. **Single-File Executable**: API contract uses TypeScript interfaces only, no runtime dependencies
2. **Automatic Worktree Management**: Data model supports all required entities (Worktree, Branch, Repository)
3. **Error Recovery**: ArashiError class provides structured error context for rollback implementation
4. **User-Centric Interface**: Quickstart guide demonstrates clear, informative error handling patterns
5. **Minimalist Configuration**: No configuration files introduced, all operations parameter-driven
6. **Cross-Platform**: Research confirmed Bun.spawn() works identically across all platforms
7. **Test Coverage**: Testing strategy defined with temporary repos for isolation
8. **Semantic Versioning**: No version-specific concerns introduced
9. **Hook System**: exec() function enables hook execution, path utilities support discovery
10. **Performance Standards**: Research confirms sub-second repository detection, sub-5-second operations

**No design changes required. Ready for Phase 2 (Task Breakdown via `/speckit.tasks`).**

## Project Structure

### Documentation (this feature)

```text
specs/005-git-utility-lib/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── git-api.ts      # TypeScript interface definitions for git operations
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── git.ts          # Main git utility library (this feature)
│   └── errors.ts       # ArashiError custom error class
└── types/
    └── git.ts          # TypeScript type definitions for git operations

tests/
├── unit/
│   └── lib/
│       └── git.test.ts # Unit tests for git utility functions
└── integration/
    └── git/
        └── worktree.test.ts # Integration tests with real git repos
```

**Structure Decision**: Single project structure. This is a utility library that provides core git operations. The `src/lib/git.ts` file will contain all git command wrappers, while `src/lib/errors.ts` defines the ArashiError class. Type definitions live in `src/types/git.ts` for reuse across the codebase. Tests use Bun's test runner with temporary git repositories for isolation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. This section intentionally left empty.
