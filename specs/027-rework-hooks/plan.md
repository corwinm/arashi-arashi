# Implementation Plan: Rework Hooks

**Branch**: `027-rework-hooks` | **Date**: 2026-02-08 | **Spec**: `specs/027-rework-hooks/spec.md`
**Input**: Feature specification from `specs/027-rework-hooks/spec.md`

## Summary

Rework the hook lifecycle to add repo-specific create hooks that run in the new worktree context with main/parent repo references, while enforcing global pre-create and post-create ordering and the failure policy that stops the operation and skips global post-create on hook failure.

## Technical Context

**Language/Version**: TypeScript 5.9  
**Primary Dependencies**: Bun runtime, commander, chalk, ora, @inquirer/prompts  
**Storage**: File system (`.arashi/config.json`, `.arashi/hooks/`, git worktree metadata)  
**Testing**: Bun test runner (`bun test`)  
**Target Platform**: Cross-platform CLI (macOS, Linux, Windows)  
**Project Type**: Single CLI project  
**Performance Goals**: Worktree creation for 5 repos completes in under 30 seconds (excluding network I/O)  
**Constraints**: Single-file executable, hook failures trigger rollback and clear error messaging, hooks execute in user shell environment, cross-platform path handling  
**Scale/Scope**: Multi-repo create operations across configured child repos with optional per-repo hooks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Single-File Executable**: PASS. Hook changes remain within bundled runtime and file system access.
- **Automatic Worktree Management**: PASS. New hook sequencing preserves single-command orchestration.
- **Error Recovery & Rollback**: PASS. Failure policy stops operation and skips global post-create; rollback remains required.
- **User-Centric Interface**: PASS. Hook failures will surface clearly; progress and warnings remain consistent.
- **Minimalist Configuration**: PASS. Uses existing `.arashi/hooks/` with optional repo-specific files.
- **Cross-Platform Compatibility**: PASS. Hook execution stays in user shell with platform-aware paths.
- **Test Coverage**: PASS. Plan includes unit and integration coverage for hook ordering and context.
- **Semantic Versioning**: PASS. Feature-level change tracked via conventional commits.
- **Hook System**: PASS. Extends existing lifecycle hooks while retaining documented behaviors.
- **Performance Standards**: PASS. Hook execution is sequential within existing lifecycle bounds.

**Post-Design Re-check**: PASS. Phase 1 artifacts align with hook lifecycle, failure policy, and rollback requirements without introducing new runtime dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/027-rework-hooks/
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
│   └── lib/
└── tests/
    ├── integration/
    ├── unit/
    └── helpers/
```

**Structure Decision**: Single CLI project with core hook logic in `repos/arashi/src/lib/` and command orchestration in `repos/arashi/src/commands/`, tested via unit and integration suites under `repos/arashi/tests/`.

## Complexity Tracking

No constitution violations identified.
