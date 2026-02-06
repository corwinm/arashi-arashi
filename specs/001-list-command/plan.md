# Implementation Plan: List Command

**Branch**: `001-list-command` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-list-command/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The list command provides comprehensive visibility into all worktrees and their nested sub-repositories. It displays worktree paths, branch names, modification status, and detailed sub-repository information in both human-readable and JSON formats. This enables users to quickly assess their workspace state and integrate worktree selection into workflows using tools like fzf, tmux, and sesh.

**Technical Approach**: Leverage existing git utility library to query `git worktree list` and `git status` for each worktree. Support verbose mode for nested sub-repository discovery using existing filesystem utilities. Provide both formatted table output using logger utilities and JSON output for machine parsing.

## Technical Context

**Language/Version**: TypeScript (latest stable) with Bun (latest stable version for bundling and runtime)  
**Primary Dependencies**: 
  - Bun runtime (built-in APIs only - spawn, file system, path)
  - chalk (colors for terminal output)
  - ora (spinners for progress indicators)
  - @inquirer/prompts (for any future interactive features)
**Storage**: File system (`.arashi/config.json` for configuration, git worktree metadata from `.git/worktrees/`)  
**Testing**: Bun's built-in test runner with >80% coverage requirement  
**Target Platform**: macOS ARM64, Linux x64, Windows x64 (single-file executables)  
**Project Type**: Single project (CLI tool)  
**Performance Goals**: 
  - List operations: < 2 seconds for repositories with up to 50 worktrees
  - Verbose mode with sub-repos: < 5 seconds for worktrees with up to 20 nested repositories
**Constraints**: 
  - Must use only Bun built-in APIs for git operations (spawn git commands)
  - Output must be parseable by command-line tools (fzf, jq, etc.)
  - No external runtime dependencies (Bun bundled in executable)
**Scale/Scope**: 
  - Support up to 50 worktrees per repository
  - Support up to 20 nested sub-repositories per worktree
  - JSON output must validate against schema

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Single-File Executable** | ✅ PASS | List command integrates into existing arashi executable. No additional dependencies required beyond existing CLI framework. |
| **II. Automatic Worktree Management** | ✅ PASS | List command supports the worktree management workflow by providing visibility into existing worktrees. Essential for users to understand current state before creating/removing worktrees. |
| **III. Error Recovery & Rollback** | ✅ PASS | List command is read-only with no state modifications. No rollback needed. Errors (e.g., no repo found, permission issues) will provide clear messages per Principle IV. |
| **IV. User-Centric Interface** | ✅ PASS | Provides color-coded output (ora/chalk), progress indicators for slow operations, structured table format, and JSON output for machine parsing. Clear error messages for all edge cases. |
| **V. Minimalist Configuration** | ✅ PASS | Uses existing `.arashi/config.json` for repository discovery. No additional configuration required. Auto-discovers worktrees via `git worktree list`. |
| **VI. Cross-Platform Compatibility** | ✅ PASS | Uses Bun's cross-platform APIs exclusively. Git commands are platform-agnostic. Path handling uses Bun's path utilities. Will be tested on macOS, Linux, Windows per CI workflow. |
| **VII. Test Coverage** | ✅ PASS | Will implement unit tests for formatting logic and integration tests for full list workflow. Target >80% coverage per constitution. Edge cases (no worktrees, permission errors, invalid paths) will be covered. |
| **VIII. Semantic Versioning** | ✅ PASS | New feature in pre-1.0.0 phase. Will bump MINOR version (e.g., 0.1.0 → 0.2.0). No breaking changes to existing commands. |
| **IX. Hook System** | ✅ PASS | List command does not trigger hooks (read-only operation). Respects existing hook configuration in `.arashi/config.json` but does not execute any hooks. |
| **X. Performance Standards** | ✅ PASS | List operations target < 2 seconds per constitution requirement. Will use parallel git operations where safe. Progress indicators for operations > 1 second. |

**Overall Status**: ✅ ALL GATES PASSED - Proceed to Phase 0

**Justification**: The list command is a read-only query operation that aligns perfectly with all constitutional principles. It provides essential visibility into worktree state, integrates cleanly into the existing CLI structure, and requires no new dependencies or configuration.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── commands/
│   └── list.ts          # List command implementation
├── lib/
│   ├── git.ts          # Existing git utilities (git worktree list, git status)
│   ├── config.ts       # Existing config loading
│   ├── filesystem.ts   # Existing filesystem utilities
│   └── logger.ts       # Existing logger utilities (chalk, ora)
└── types/
    └── worktree.ts     # Worktree and SubRepository type definitions

tests/
├── unit/
│   └── list.test.ts    # Unit tests for formatting and parsing logic
└── integration/
    └── list.test.ts    # Integration tests for full list workflow
```

**Structure Decision**: Single project structure (Option 1) is appropriate for this CLI tool. The list command integrates into the existing `src/commands/` directory alongside other commands (init, create, remove). Reuses existing utilities from `src/lib/` for git operations, configuration loading, and output formatting. No new source directories required beyond a new command file and type definitions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section is intentionally left empty as all constitutional principles are satisfied.

---

## Post-Design Constitution Re-Check

*Performed after Phase 1 design completion*

| Principle | Status | Design Notes |
|-----------|--------|--------------|
| **I. Single-File Executable** | ✅ PASS | Design integrates cleanly into existing arashi executable at `src/commands/list.ts`. No new dependencies beyond existing infrastructure (chalk, ora). |
| **II. Automatic Worktree Management** | ✅ PASS | List command provides essential visibility for worktree management workflow. Users can see current state before creating/removing worktrees. JSON output enables automation. |
| **III. Error Recovery & Rollback** | ✅ PASS | Read-only command with no state modifications. Error handling defined for all edge cases (no repo, missing config, permission errors). Clear error messages guide users to resolution. |
| **IV. User-Centric Interface** | ✅ PASS | Design includes: color-coded table output, status icons (✓/✗/🔒), progress spinner for verbose mode, JSON output for automation, helpful error messages, clear legend, and suggestions when no worktrees exist. |
| **V. Minimalist Configuration** | ✅ PASS | No additional configuration required. Reuses existing `.arashi/config.json`. Auto-discovers worktrees via git commands. Sub-repository discovery is automatic in verbose mode. |
| **VI. Cross-Platform Compatibility** | ✅ PASS | Uses Bun's cross-platform APIs exclusively. Git commands are platform-agnostic. Path handling uses standard Bun path utilities. No platform-specific code needed. |
| **VII. Test Coverage** | ✅ PASS | Quickstart defines comprehensive test strategy: unit tests (gatherWorktreeData, discoverSubRepositories, formatters), integration tests (full command workflow), validation tests. Target >80% coverage. |
| **VIII. Semantic Versioning** | ✅ PASS | New feature in pre-1.0.0 phase. Will bump MINOR version per constitution (e.g., 0.1.0 → 0.2.0). No breaking changes. Additive feature only. |
| **IX. Hook System** | ✅ PASS | List command does not execute hooks (read-only operation). Respects existing hook configuration but does not trigger any lifecycle events. |
| **X. Performance Standards** | ✅ PASS | Design includes parallel git operations (Promise.all with concurrency limiting). Target < 2 seconds for 50 worktrees achieved via batched parallel status checks. Verbose mode target < 5 seconds via efficient sub-repo discovery with max-depth limiting. Progress indicators shown for operations > 1 second. |

**Overall Status**: ✅ ALL GATES PASSED POST-DESIGN

**Design Validation Summary**:
- No new dependencies beyond existing arashi infrastructure
- All data structures defined in data-model.md and contracts/list-api.ts
- Implementation path clear via quickstart.md with 8 sequential phases
- Performance targets achievable with parallel operations
- Error handling comprehensive with custom error classes
- Output formats support both human (table) and machine (JSON) consumption
- Integration with command-line tools (fzf, jq, tmux) validated in research
- All user stories from spec.md addressed in design

**No violations or complexity justifications required.**
