# Implementation Plan: Windows CLI Compatibility

**Branch**: `039-fix-windows-cli` | **Date**: 2026-02-14 | **Spec**: [specs/039-fix-windows-cli/spec.md](./spec.md)
**Input**: Feature specification from `/specs/039-fix-windows-cli/spec.md`

## Summary

Ensure the npm-installed CLI starts reliably on Windows in PowerShell and Git Bash by using a consistent cross-platform launcher entry point with clear error guidance, while preserving behavior on macOS and Linux.

## Technical Context

**Language/Version**: TypeScript 5.9 with Bun runtime  
**Primary Dependencies**: Bun runtime, commander, chalk, ora, @inquirer/prompts  
**Storage**: N/A  
**Testing**: Bun test  
**Target Platform**: macOS ARM64, Linux x64, Windows x64  
**Project Type**: Single CLI project  
**Performance Goals**: Basic CLI commands (help/version) start in under 2 seconds on Windows  
**Constraints**: Single-file executable distribution, no external runtime required, cross-platform paths  
**Scale/Scope**: Single CLI package with npm-installed launcher across Windows shells

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Single-File Executable**: Pass. Launcher changes do not alter bundled binary distribution.
- **Automatic Worktree Management**: Pass. No changes to worktree orchestration.
- **Error Recovery & Rollback**: Pass. No change to rollback behavior; startup failures will surface clear messages.
- **User-Centric Interface**: Pass. Requirements explicitly include clearer Windows startup guidance.
- **Minimalist Configuration**: Pass. No new configuration required.
- **Cross-Platform Compatibility**: Pass. Primary goal is Windows parity without regressions.
- **Test Coverage**: Pass. Tests will be added to cover Windows launcher behavior.
- **Semantic Versioning**: Pass. Anticipated as a bug fix.
- **Hook System**: Pass. No changes to hooks.
- **Performance Standards**: Pass. Startup time goal remains within standards.

**Post-Design Check**: Re-validated after Phase 1 design; all gates remain Pass.

## Project Structure

### Documentation (this feature)

```text
specs/039-fix-windows-cli/
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
├── bin/
├── src/
│   ├── cli/
│   ├── lib/
│   └── services/
└── tests/
    ├── integration/
    └── unit/
```

**Structure Decision**: Single CLI project in `repos/arashi` using existing `src/` and `tests/` layout.

## Complexity Tracking

No constitution violations identified.
