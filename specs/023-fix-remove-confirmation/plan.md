# Implementation Plan: Fix Remove Command Confirmation

**Branch**: `023-fix-remove-confirmation` | **Date**: 2026-02-07 | **Spec**: `specs/023-fix-remove-confirmation/spec.md`
**Input**: Feature specification from `specs/023-fix-remove-confirmation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix the remove command so interactive selection does not exit early, branch-based removal always asks for confirmation, and non-interactive runs fail with a clear message. The approach keeps the CLI flow in the command handler using `@inquirer/prompts`, adds a non-TTY guard before prompting, and preserves existing commander + chalk/ora output conventions.

## Technical Context

**Language/Version**: TypeScript (latest stable) + Bun (latest stable)  
**Primary Dependencies**: commander, chalk, ora, @inquirer/prompts  
**Storage**: File system (`.arashi/config.json`, git metadata, worktree directories)  
**Testing**: Bun test runner (`bun test`)  
**Target Platform**: macOS, Linux, Windows (CLI)  
**Project Type**: Single CLI project  
**Performance Goals**: Remove/list interactions complete in <2s for typical worktree counts; no noticeable prompt lag  
**Constraints**: Single-file executable distribution, cross-platform path handling, interactive prompts require TTY, confirmation required for destructive actions  
**Scale/Scope**: Worktree counts typically 1-50 across a multi-repo workspace; single command path update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- PASS: Single-file executable remains intact (no new runtime dependencies)
- PASS: Worktree coordination behavior unchanged; only remove flow adjustments
- PASS: Error recovery/rollback preserved; no partial deletion paths added
- PASS: User-centric output improved with clear prompts/messages
- PASS: Minimal configuration (no new config fields)
- PASS: Cross-platform compatibility preserved (TTY checks use standard APIs)
- PASS: Test coverage requirement acknowledged for implementation phase
- PASS: Semantic versioning unchanged (bug fix)
- PASS: Hook system unaffected
- PASS: Performance standards maintained (prompt flow only)

Re-check after Phase 1 design: PASS (design artifacts introduce no new violations).

## Project Structure

### Documentation (this feature)

```text
specs/023-fix-remove-confirmation/
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
└── tests/
```

**Structure Decision**: Single CLI project in `repos/arashi/` using the existing `src/` and `tests/` layout.

## Complexity Tracking

No constitutional violations identified.
