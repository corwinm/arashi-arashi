# Implementation Plan: Fix create command in bare repositories

**Branch**: `032-fix-bare-create-command` | **Date**: 2026-02-09 | **Spec**: `specs/032-fix-bare-create-command/spec.md`
**Input**: Feature specification from `specs/032-fix-bare-create-command/spec.md`

## Summary

Allow `arashi create <branch>` to succeed when invoked from a bare repository root by resolving workspace configuration in bare-repo context and executing create operations from a valid worktree context without changing behavior for normal worktree invocations.

## Technical Context

**Language/Version**: TypeScript 5.9  
**Primary Dependencies**: Bun runtime, commander, chalk, ora, @inquirer/prompts  
**Storage**: N/A (filesystem, git metadata, and repository refs only)  
**Testing**: Bun test runner (unit + integration)  
**Target Platform**: macOS, Linux, Windows (cross-platform CLI)  
**Project Type**: single (CLI + library modules)  
**Performance Goals**: Create command start-up context resolution adds less than 1 second overhead for workspaces with up to 10 repositories  
**Constraints**: Preserve rollback guarantees; preserve current create behavior in non-bare contexts; maintain clear user-facing errors for missing setup  
**Scale/Scope**: Workspace with 1 main repository plus up to 10 configured child repositories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-file executable maintained (no new runtime dependencies) - Pass
- Automatic worktree management across configured repositories preserved - Pass
- Error recovery and rollback behavior preserved for failed create runs - Pass
- User-centric output preserved (clear progress and actionable errors) - Pass
- Minimalist configuration preserved (`.arashi/config.json` remains canonical) - Pass
- Cross-platform compatibility preserved (path and git behavior considerations included) - Pass
- Test coverage target (>80%) feasible with added unit and integration tests - Pass
- Semantic versioning impact is patch-level bug fix - Pass
- Hook system behavior unchanged unless explicitly disabled by flags - Pass
- Performance standards maintained (no material regression for create startup) - Pass

**Post-Design Re-check**: Pass. Design artifacts add no constitutional violations and explicitly preserve rollback, hooks, cross-platform behavior, and testability.

## Project Structure

### Documentation (this feature)

```text
specs/032-fix-bare-create-command/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
repos/arashi/
├── src/
│   ├── commands/
│   │   └── create.ts
│   ├── lib/
│   │   ├── config.ts
│   │   └── git.ts
│   └── core/
│       └── worktree.ts
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Keep the existing single CLI project structure. Implement command/context resolution in `repos/arashi/src/commands/create.ts` and supporting config/git helpers in existing library modules, with regression coverage in `repos/arashi/tests/unit/` and `repos/arashi/tests/integration/`.

## Complexity Tracking

No constitution violations requiring justification.
