# Implementation Plan: Fix create --dry-run

**Branch**: `028-fix-create-dry-run` | **Date**: 2026-02-08 | **Spec**: `specs/028-fix-create-dry-run/spec.md`
**Input**: Feature specification from `specs/028-fix-create-dry-run/spec.md`

## Summary

Ensure `create --dry-run` produces a non-mutating, accurate plan of worktrees/branches and conflicts, with a clear actionable vs blocked outcome.

## Technical Context

**Language/Version**: TypeScript 5.9  
**Primary Dependencies**: Bun runtime, commander, chalk, ora, @inquirer/prompts  
**Storage**: N/A (filesystem and git metadata only)  
**Testing**: Bun test runner  
**Target Platform**: macOS, Linux, Windows (cross-platform CLI)  
**Project Type**: single (CLI library + command entry)  
**Performance Goals**: Dry-run completes under 3 seconds for up to 10 repositories and 50 planned worktrees  
**Constraints**: No side effects; output must match real create plan; cross-platform path handling  
**Scale/Scope**: Workspace with up to 10 repositories and 50 planned worktrees

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-file executable maintained (no new runtime deps) - Pass
- Automatic worktree management preserved - Pass
- Error recovery & rollback respected (dry-run is non-mutating) - Pass
- User-centric output maintained (clear plan + conflicts) - Pass
- Minimalist configuration preserved - Pass
- Cross-platform compatibility maintained - Pass
- Test coverage >80% achievable with added tests - Pass
- Semantic versioning unaffected (bug fix) - Pass
- Hook system unaffected - Pass
- Performance standards met (dry-run under 3 seconds) - Pass

**Post-Design Re-check**: Pass (no design changes affecting constitution)

## Project Structure

### Documentation (this feature)

```text
specs/028-fix-create-dry-run/
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
│   ├── index.ts
│   └── types.ts
└── tests/
```

**Structure Decision**: Single CLI project; implementation will land in `repos/arashi/src/` with tests in `repos/arashi/tests/`.
