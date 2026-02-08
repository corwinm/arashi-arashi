# Implementation Plan: Fix Remove Worktree Grouping

**Branch**: `024-fix-remove-grouping` | **Date**: 2026-02-08 | **Spec**: `specs/024-fix-remove-grouping/spec.md`
**Input**: Feature specification from `specs/024-fix-remove-grouping/spec.md`

## Summary

Update the remove workflow to group worktrees by parent-child relationship (not branch name), mark missing worktree directories as prunable, and keep child status accurate after parent removal using existing worktree path and status conventions.

## Technical Context

**Language/Version**: TypeScript 5.9 + Bun (latest stable)  
**Primary Dependencies**: commander, chalk, ora, @inquirer/prompts  
**Storage**: File system (`.git/worktrees`, worktree paths), `.arashi/config.json`  
**Testing**: `bun test` (unit + integration)  
**Target Platform**: Cross-platform CLI (macOS, Linux, Windows)  
**Project Type**: Single CLI project  
**Performance Goals**: List/remove operations stay within constitution targets (list < 2s; status < 5s for 5 repos)  
**Constraints**: Single-file executable, Bun runtime APIs only, rollback-safe operations, no new config  
**Scale/Scope**: Multi-repo workspaces (5-20 repos), dozens of worktrees per repo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-File Executable: PASS (no new runtime dependencies)
- Automatic Worktree Management: PASS (no changes to orchestration)
- Error Recovery & Rollback: PASS (remains intact)
- User-Centric Interface: PASS (clearer grouping/status)
- Minimalist Configuration: PASS (no new config)
- Cross-Platform Compatibility: PASS (Bun fs/path APIs)
- Test Coverage: PASS (tests planned for new behaviors)
- Semantic Versioning: PASS (bug fix)
- Hook System: PASS (no changes)
- Performance Standards: PASS (no new heavy operations)

**Post-Design Re-check**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/024-fix-remove-grouping/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
repos/arashi/
├── src/
│   ├── commands/
│   ├── core/
│   ├── lib/
│   └── types/
└── tests/
    ├── helpers/
    ├── integration/
    ├── unit/
    └── fixtures/
```

**Structure Decision**: Single CLI project in `repos/arashi` using existing `src/commands`, `src/core`, `src/lib`, `src/types` with `tests/unit` and `tests/integration` for behavior and edge cases.
