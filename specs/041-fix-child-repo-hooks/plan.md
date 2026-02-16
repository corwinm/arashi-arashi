# Implementation Plan: Fix child-repo create hook execution

**Branch**: `041-fix-child-repo-hooks` | **Date**: 2026-02-15 | **Spec**: `specs/041-fix-child-repo-hooks/spec.md`
**Input**: Feature specification from `specs/041-fix-child-repo-hooks/spec.md`

## Summary

Restore `arashi create <name>` hook behavior when invoked from any managed child repository by using the same resolved workspace context for hook lookup and execution that is already used for create orchestration. Keep failure semantics and rollback behavior unchanged while adding explicit per-repository hook outcomes to make failures actionable.

## Technical Context

**Language/Version**: TypeScript 5.9 with Bun runtime  
**Primary Dependencies**: commander, chalk, ora, @inquirer/prompts, Bun built-in process/filesystem APIs  
**Storage**: Filesystem (`.arashi/config.json`, `.arashi/hooks/`) and git metadata (`.git/worktrees`)  
**Testing**: Bun test runner (integration + unit), lint/type checks via existing repo scripts  
**Target Platform**: macOS, Linux, Windows CLI environments  
**Project Type**: Single CLI project (`repos/arashi`)  
**Performance Goals**: Maintain create command performance target (<30s for 5 repositories, excluding network I/O) and keep context/hook resolution overhead under 1s for typical workspaces  
**Constraints**: Preserve rollback guarantees, keep hook failure policy fail-fast, avoid duplicate hook execution per repository, preserve existing hook file conventions  
**Scale/Scope**: 1 workspace root plus up to 10 managed repositories per create operation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-file executable maintained (no new runtime dependency requirements) - Pass
- Automatic worktree management across configured repositories preserved - Pass
- Error recovery and rollback preserved for any failed create path - Pass
- User-centric output improved with explicit hook outcomes and actionable recovery guidance - Pass
- Minimalist configuration preserved (`.arashi/config.json` and `.arashi/hooks/` remain canonical) - Pass
- Cross-platform compatibility preserved (path resolution and hook invocation remain Bun/Git based) - Pass
- Test coverage target (>80%) feasible with added integration and unit coverage for child invocation - Pass
- Semantic versioning impact is patch-level bug fix - Pass
- Hook system maintained and clarified (no new hook types introduced) - Pass
- Performance standards maintained (no material regression to create command runtime) - Pass

**Post-Design Re-check**: Pass. Research and design artifacts keep all constitutional constraints intact, including rollback-first failure handling, hook-system compatibility, and cross-platform behavior.

## Project Structure

### Documentation (this feature)

```text
specs/041-fix-child-repo-hooks/
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
│   ├── core/
│   │   ├── worktree.ts
│   │   └── rollback.ts
│   └── lib/
│       ├── config.ts
│       └── hooks.ts
└── tests/
    ├── integration/
    │   ├── create.non-bare-parity.test.ts
    │   └── hooks-integration.test.ts
    └── unit/
```

**Structure Decision**: Keep the existing single-project CLI structure in `repos/arashi`. Implement context propagation and hook-root consistency in the existing create/worktree orchestration modules, and add regression coverage in integration tests for child-repository invocation.

## Complexity Tracking

No constitution violations requiring justification.
