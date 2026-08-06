## Why

Explicit IDE switching currently depends entirely on the editor's shell command being discoverable through the Arashi process `PATH`. VS Code and compatible editors launched from Finder or Spotlight can run the Arashi extension with a different environment than `code .`, causing `switch --vscode` to report that `code` is missing even though the installed macOS application includes a usable official launcher.

## What Changes

- Resolve explicit VS Code, Cursor, and Kiro launch requests to executable launcher targets instead of treating PATH lookup as the complete availability decision.
- Preserve PATH-discovered commands as the first choice.
- On macOS, resolve verified official app-bundle launchers from supported system and per-user application locations when the command is absent from PATH.
- Execute the resolved target with argv-safe `--new-window` arguments and preserve no-fallback behavior when resolution or launch fails.
- Add hermetic platform/environment/path regression coverage for PATH precedence, bundle discovery, spaces in paths, unavailable launchers, and failed resolved launchers.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `switch-command`: Expand explicit supported-IDE launcher resolution so a verified macOS application bundle can satisfy an IDE request when its shell command is unavailable, while preserving explicit-target authority and no fallback.

## Impact

- Affected repository: `repos/arashi`.
- Primary source: IDE availability, resolution, and command construction in `src/lib/switch-launcher.ts` and related switch execution paths.
- Tests: switch launcher unit tests and configured/zero-config switch integration coverage with injected macOS filesystem and process dependencies.
- User-facing behavior: extension-driven and direct CLI IDE switches become independent of terminal-only PATH setup on supported macOS installations when the requested editor has a verified official bundled launcher mapping. VS Code and Cursor are verified targets; Kiro remains PATH-only unless its official bundle layout is established during implementation evidence.
- No configuration, generated schema, CLI option, JSON envelope, or extension command-surface change is intended.
