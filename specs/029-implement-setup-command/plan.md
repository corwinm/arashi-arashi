# Implementation Plan: Setup Command

**Branch**: `029-implement-setup-command` | **Date**: 2026-02-09 | **Spec**: `specs/029-implement-setup-command/spec.md`
**Input**: Feature specification from `specs/029-implement-setup-command/spec.md`

## Summary

Add a new `setup` command that loads workspace configuration, discovers eligible repositories, runs main repository setup before sub-repository setup tasks, supports repository filtering, and reports progress, per-repository timing, verbose output, and outcome summaries for success, skipped, failed, and timed-out runs.

## Technical Context

**Language/Version**: TypeScript 5.9  
**Primary Dependencies**: Bun runtime, commander, chalk, ora, @inquirer/prompts  
**Storage**: Filesystem workspace configuration (`.arashi/config.json`) and repository setup scripts/hooks  
**Testing**: Bun test runner (integration + unit tests)  
**Target Platform**: macOS, Linux, Windows (cross-platform CLI)  
**Project Type**: Single CLI project (`repos/arashi`)  
**Performance Goals**: Setup command startup feedback within 1 second; complete setup across 5 repositories within 30 seconds excluding repository script runtime  
**Constraints**: Preserve current CLI output conventions, use existing timeout configuration semantics, continue reporting across repositories after per-repo failures, no breaking changes to existing commands  
**Scale/Scope**: Typical workspace of 2-10 repositories with optional setup tasks in main and sub-repositories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-file executable maintained (no runtime dependency expansion) - Pass
- Automatic worktree/repository coordination patterns preserved for multi-repo operation - Pass
- Error recovery and explicit failure classification preserved - Pass
- User-centric interface maintained (progress, clear errors, summaries, verbose mode) - Pass
- Minimalist configuration preserved (reuse existing `.arashi/config.json`) - Pass
- Cross-platform compatibility maintained (Bun APIs + path-safe behavior) - Pass
- Test coverage >80% achievable with added integration and unit tests - Pass
- Semantic versioning impact is additive feature (`feat`) with no breaking change - Pass
- Hook system compatibility preserved (setup scripts are core hook lifecycle behavior) - Pass
- Performance standards met (bounded orchestration overhead; clear progress for long-running tasks) - Pass

**Post-Design Re-check**: Pass (research and design artifacts keep existing architecture, dependencies, and cross-platform constraints intact)

## Project Structure

### Documentation (this feature)

```text
specs/029-implement-setup-command/
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
│   │   └── setup.ts
│   ├── lib/
│   │   ├── process/run-with-timeout.ts
│   │   ├── repo-filter.ts
│   │   └── pull-output.ts
│   └── index.ts
└── tests/
    ├── integration/
    │   └── setup.test.ts
    └── unit/
```

**Structure Decision**: Keep implementation within the existing single CLI project in `repos/arashi`, placing the new command under `repos/arashi/src/commands/` and coverage in `repos/arashi/tests/` to match established command architecture.

## Complexity Tracking

No constitutional violations identified; no complexity exceptions required.
