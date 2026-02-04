# Implementation Plan: Hook System

**Branch**: `001-github-issues` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-github-issues/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a lifecycle hook system for the arashi CLI that allows developers to run custom shell scripts at defined execution points. The system will discover hooks in `.arashi/hooks/` directory, validate permissions, execute them with appropriate context via environment variables, and handle failures gracefully with timeouts. The implementation will use Bun's process spawning APIs to execute shell scripts and provide real-time output streaming with hook name prefixes.

## Technical Context

**Language/Version**: TypeScript (latest stable) + Bun (latest stable version for bundling and runtime)  
**Primary Dependencies**: Bun runtime (built-in APIs only - spawn, file system, path)  
**Storage**: File system (hook scripts in `.arashi/hooks/` directory, timeout configuration in `.arashi/config.json`)  
**Testing**: Bun's built-in test runner  
**Target Platform**: Cross-platform (macOS, Linux, Windows) - single-file executable
**Project Type**: Single project (CLI utility library)  
**Performance Goals**: Hook discovery < 50ms, hook execution startup < 100ms (excluding hook script runtime), timeout enforcement with ±1 second precision  
**Constraints**: 5-minute default timeout (configurable), non-blocking failure handling, cross-platform shell execution, real-time output streaming  
**Scale/Scope**: Support 10+ lifecycle points, handle hooks with 1000+ lines of output, manage parallel hook execution in future

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check (Initial)

### I. Single-File Executable
✅ **PASS** - Hook system is a library module within arashi, does not affect bundling or distribution

### II. Automatic Worktree Management
✅ **PASS** - Hook system enhances worktree operations by enabling custom automation at lifecycle points

### III. Error Recovery & Rollback
✅ **PASS** - Hook failures are non-fatal and logged; commands continue execution without rollback issues

### IV. User-Centric Interface
✅ **PASS** - Real-time output streaming with hook name prefixes, clear error messages for common issues (permissions, timeout, execution failure)

### V. Minimalist Configuration
✅ **PASS** - Auto-discovery of hooks from `.arashi/hooks/` directory, timeout configuration optional (5-minute default)

### VI. Cross-Platform Compatibility
✅ **PASS** - Uses Bun's spawn API which handles platform differences; shell scripts are platform-specific but that's expected user responsibility

### VII. Test Coverage
✅ **PASS** - Requires >80% coverage with unit tests (mock hook scripts) and integration tests (real hook execution scenarios)

### VIII. Semantic Versioning
✅ **PASS** - New feature, will bump minor version (0.x → 0.y) in pre-1.0.0 phase

### IX. Hook System
✅ **PASS** - This feature implements the constitutional requirement for hook support

### X. Performance Standards
✅ **PASS** - Hook discovery < 50ms meets performance goals; execution overhead minimal (< 100ms startup)

**Initial Status**: ✅ ALL GATES PASS - Proceeded to Phase 0

---

### Post-Phase 1 Check (After Design)

**Re-validated**: 2026-02-04

All constitutional principles remain satisfied after detailed design:
- **I-VI**: Design maintains all architectural principles
- **VII**: Test strategy defined with >80% coverage target (unit + integration tests)
- **VIII**: Feature versioning confirmed (minor bump)
- **IX**: Complete hook system implementation with all required features
- **X**: Performance targets confirmed achievable with Bun.spawn() API

**Post-Design Status**: ✅ ALL GATES PASS - Ready for Phase 2 (tasks breakdown)

## Project Structure

### Documentation (this feature)

```text
specs/001-github-issues/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── hooks-api.md     # Hook system function signatures and types
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repos/arashi/)

```text
repos/arashi/
├── src/
│   └── lib/
│       ├── hooks.ts        # Hook system implementation
│       ├── config.ts       # Existing config system (for timeout settings)
│       └── git.ts          # Existing git utilities
│
└── tests/
    ├── unit/
    │   └── hooks.test.ts   # Unit tests with mock hook scripts
    └── integration/
        └── hooks-integration.test.ts  # Real hook execution tests
```

**Structure Decision**: Single project structure is appropriate for this library-level feature. The hook system is implemented as a module in `src/lib/hooks.ts` alongside other arashi utilities (config, git, filesystem). Tests follow the existing pattern with unit and integration test directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No constitutional violations - this section intentionally left empty.
