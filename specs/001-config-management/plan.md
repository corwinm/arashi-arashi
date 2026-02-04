# Implementation Plan: Configuration Management

**Branch**: `001-config-management` | **Date**: 2026-02-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-config-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement configuration file management system for Arashi that provides functions to load, save, validate, and manage repository configurations stored in `.arashi/config.json`. The system will support initialization with defaults, repository add/remove operations, validation with detailed error messages, and persistent storage with human-readable formatting.

## Technical Context

**Language/Version**: TypeScript + Bun (latest stable version)  
**Primary Dependencies**: Bun runtime (built-in APIs only - file system, path utilities)  
**Storage**: File system (`.arashi/config.json`)  
**Testing**: Bun test runner (built-in)  
**Target Platform**: Cross-platform (macOS, Linux, Windows) - Node.js-compatible filesystem APIs
**Project Type**: Library (configuration management utilities)  
**Performance Goals**: 
  - Config initialization: < 5 seconds
  - Config loading: < 100ms for 100 repositories
  - File operations: synchronous (blocking) for reliability
**Constraints**: 
  - Single-file executable compatibility (no external dependencies)
  - Human-readable JSON output (pretty-printed)
  - Forward-compatible (preserve unknown fields)
**Scale/Scope**: 
  - Optimized for < 100 repositories per configuration
  - Configuration file size: < 1MB typical
  - 8 core functions: load, save, add, remove, validate, exists, getPath, generateDefault

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Single-File Executable** | ✅ PASS | Configuration management is a library module using only Bun built-in APIs (file system, JSON parsing). No external dependencies. |
| **II. Automatic Worktree Management** | N/A | This feature provides configuration infrastructure used by worktree management features. |
| **III. Error Recovery & Rollback** | ✅ PASS | Error messages required per FR-009, FR-010. File operations are atomic (read entire file, write entire file). Validation at load time prevents invalid states. |
| **IV. User-Centric Interface** | ✅ PASS | Detailed error messages required (FR-009, FR-010, SC-003). JSON parse errors include details. Validation errors specify missing fields. |
| **V. Minimalist Configuration** | ✅ PASS | Core purpose of this feature. Default config generation (FR-008) provides sensible defaults. Only 3 required fields: version, repos_dir, auto_setup. |
| **VI. Cross-Platform Compatibility** | ✅ PASS | Uses Bun's cross-platform file system APIs. Path utilities handle platform-specific separators. JSON format is platform-agnostic. |
| **VII. Test Coverage** | ✅ PASS | SC-005 requires complete unit test coverage for all functions including success, error, and edge cases. Target: >80% coverage. |
| **VIII. Semantic Versioning** | ✅ PASS | Configuration includes version field (FR-008) for future migrations. No breaking changes in this initial implementation. |
| **IX. Hook System** | N/A | Configuration management does not execute hooks, but stores hook-related config if needed by other features. |
| **X. Performance Standards** | ✅ PASS | SC-001: < 5s initialization. SC-002: < 100ms loading for 100 repos. File I/O optimized with synchronous operations for reliability. |

**Overall Assessment**: ✅ PASSED - All applicable constitutional principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-config-management/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── config-api.ts    # TypeScript interfaces for configuration API
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/lib/
└── config.ts            # Configuration management functions

tests/unit/
└── config.test.ts       # Unit tests for configuration functions

tests/integration/
└── config-integration.test.ts  # Integration tests for file I/O operations

tests/fixtures/
├── valid-config.json    # Test fixture: valid configuration
├── invalid-config.json  # Test fixture: malformed JSON
└── partial-config.json  # Test fixture: missing required fields
```

**Structure Decision**: Single project structure selected (library module). Configuration management is a utility library within the Arashi project, not a standalone application. All functions exported from `src/lib/config.ts` for use by other Arashi modules. Tests organized by type (unit for logic, integration for filesystem operations) with fixtures for various test scenarios.

## Complexity Tracking

No constitutional violations requiring justification. This feature aligns with all applicable principles.
