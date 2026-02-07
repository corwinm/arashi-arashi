# Implementation Plan: Status Command

**Branch**: `020-status-command` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-status-command/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement the `arashi status` command to provide visibility into the state of all managed repositories in a workspace. The command will execute git status for each configured repository, parse the output to determine clean/dirty state, and present results in three output modes: default (color-coded summary), verbose (full git status output), and short (one-line per repository). The implementation will leverage existing arashi infrastructure including config management, git utilities, and output formatting libraries.

## Technical Context

**Language/Version**: TypeScript (latest stable) with Bun (latest stable version for bundling and runtime)  
**Primary Dependencies**: 
- commander (CLI framework) - already in use
- chalk (colored output) - already in use
- ora (spinners) - already in use
- @inquirer/prompts (user prompts) - already in use
- Bun runtime APIs (spawn, file system, path)

**Storage**: File system (`.arashi/config.json` for workspace configuration, git metadata from `.git/worktrees/`)  
**Testing**: Bun's built-in test runner with integration tests  
**Target Platform**: Cross-platform (macOS ARM64, Linux x64, Windows x64) - single-file executable  
**Project Type**: Single CLI project with command structure  
**Performance Goals**: Status check completion in <3 seconds for workspaces with up to 10 repositories  
**Constraints**: 
- Must handle git command failures gracefully without stopping entire status check
- Must parse git status output across different git versions
- Must display results incrementally (show each repo as checked)

**Scale/Scope**: Support workspaces with 50+ repositories efficiently

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Single-File Executable** | ✅ PASS | Status command integrates into existing arashi executable, no new dependencies |
| **II. Automatic Worktree Management** | ✅ PASS | Status command provides visibility into managed worktrees, supports core value |
| **III. Error Recovery & Rollback** | ✅ PASS | Status is read-only operation, no rollback needed. Handles individual repo failures gracefully |
| **IV. User-Centric Interface** | ✅ PASS | Color-coded output, progress indicators for long operations, three output modes |
| **V. Minimalist Configuration** | ✅ PASS | Uses existing `.arashi/config.json`, no additional configuration required |
| **VI. Cross-Platform Compatibility** | ✅ PASS | Uses Bun's cross-platform APIs and existing git utilities |
| **VII. Test Coverage** | ✅ PASS | Will include integration tests for all three output modes and error scenarios |
| **VIII. Semantic Versioning** | ✅ PASS | New feature, will bump MINOR version (e.g., 1.1.3 → 1.2.0) |
| **IX. Hook System** | ✅ PASS | Status is read-only, no hooks applicable |
| **X. Performance Standards** | ✅ PASS | Target <3 seconds for 10 repos (spec SC-001), parallel execution where safe |

**Overall Assessment**: ✅ All constitutional principles satisfied. No complexity justification required.

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

### Source Code (repos/arashi/)

```text
src/
├── commands/
│   ├── add.ts           # Existing
│   ├── create.ts        # Existing
│   ├── init.ts          # Existing
│   ├── list.ts          # Existing
│   └── status.ts        # NEW - Main status command implementation
├── lib/
│   ├── config.ts        # Existing - Load workspace configuration
│   ├── git.ts           # Existing - Git command execution utilities
│   ├── logger.ts        # Existing - Color output, spinners
│   ├── prompts.ts       # Existing - User prompts (not needed for status)
│   ├── filesystem.ts    # Existing - File system utilities
│   ├── hooks.ts         # Existing - Hook system (not needed for status)
│   └── errors.ts        # Existing - Error types
├── core/                # Existing - Core orchestration
├── types/               # Existing - Type definitions
├── types.ts             # Existing - Shared types
└── index.ts             # Existing - Entry point (register new command)

tests/
├── unit/
│   └── status.test.ts   # NEW - Unit tests for status parsing logic
└── integration/
    └── status.test.ts   # NEW - Integration tests for status command
```

**Structure Decision**: Following existing single CLI project structure. Status command follows the established pattern used by `add.ts`, `create.ts`, `init.ts`, and `list.ts`. All new code will be in `src/commands/status.ts` with supporting logic using existing libraries in `src/lib/`. Tests will be added to the existing test structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations**: All constitutional principles satisfied. No complexity justification required.

---

## Phase 0: Research (Completed)

✅ All technical unknowns resolved in `research.md`:
- Git status parsing approach (porcelain v1 format)
- Repository discovery strategy (existing config management)
- Output formatting strategy (three modes with chalk/ora)
- Performance optimization (parallel execution)
- Error handling patterns (continue on individual failures)
- Integration with existing infrastructure

**Key Research Outcomes**:
1. Use `git status --porcelain=v1 --branch` for stable, parseable output
2. Leverage existing `loadConfig()`, git, and logger utilities
3. Implement three output modes: default (color-coded), verbose (full git output), short (one-line)
4. Execute git commands in parallel using Promise.all for performance
5. Handle individual repo failures gracefully without stopping entire check

---

## Phase 1: Design & Contracts (Completed)

✅ **Data Model** (`data-model.md`):
- Entities defined: StatusOptions, GitFileStatus, BranchTrackingInfo, RepoStatus, StatusSummary
- Type definitions with validation rules
- Computed properties and helper functions
- Example data structures

✅ **API Contracts** (`contracts/cli-interface.md`):
- Command signature: `arashi status [options]`
- Options: `--verbose`, `--short` (mutually exclusive)
- Exit codes: 0 (success), 1 (partial failure), 2 (critical error)
- Three output format specifications with examples
- Error handling specifications
- Integration points with existing libraries

✅ **Quickstart Guide** (`quickstart.md`):
- Step-by-step implementation guide
- Code examples for each component
- Testing checklist
- Common pitfalls and solutions
- Estimated implementation time: 4-6 hours

✅ **Agent Context Updated** (`AGENTS.md`):
- Added TypeScript + Bun technology stack
- Added file system storage for config and git metadata
- Preserved manual additions in context file

---

## Constitution Check (Phase 1 Re-evaluation)

*Re-checked after Phase 1 design completion*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Single-File Executable** | ✅ PASS | Status command integrates into existing arashi executable, no new dependencies beyond existing (chalk, ora, commander) |
| **II. Automatic Worktree Management** | ✅ PASS | Status command provides visibility into managed worktrees, directly supports core value proposition |
| **III. Error Recovery & Rollback** | ✅ PASS | Read-only operation, no state changes, graceful error handling for individual repo failures |
| **IV. User-Centric Interface** | ✅ PASS | Three output modes (default/verbose/short), color-coded indicators, progress spinners, clear error messages with suggestions |
| **V. Minimalist Configuration** | ✅ PASS | Zero additional configuration, uses existing `.arashi/config.json` |
| **VI. Cross-Platform Compatibility** | ✅ PASS | Uses Bun's cross-platform APIs, existing git utilities handle platform differences |
| **VII. Test Coverage** | ✅ PASS | Test plan includes unit tests (parsing, formatting) and integration tests (all modes, error scenarios). Target >80% coverage |
| **VIII. Semantic Versioning** | ✅ PASS | New feature will bump MINOR version (1.1.3 → 1.2.0 or similar) |
| **IX. Hook System** | ✅ PASS | Read-only status check, no hooks applicable or needed |
| **X. Performance Standards** | ✅ PASS | Parallel execution design, target <3s for 10 repos (SC-001), progress indicators for >1s operations |

**Post-Design Assessment**: ✅ All constitutional principles remain satisfied after detailed design. Implementation approach aligns with existing arashi patterns and conventions.

---

## Implementation Readiness

✅ **Ready for Phase 2 (Task Breakdown)**

All planning artifacts complete:
- ✅ Technical context defined
- ✅ Constitution compliance verified (pre and post design)
- ✅ Research completed with decisions documented
- ✅ Data model defined with type definitions
- ✅ CLI interface contract specified
- ✅ Quickstart guide created with code examples
- ✅ Agent context updated
- ✅ Project structure documented

**Next Command**: `/speckit.tasks` - Generate task breakdown for implementation
