## Why

Selecting a worktree from the VSCode UI should always switch to that exact entry, but choosing `main` currently forwards an ambiguous filter that can match multiple worktrees and fail. This breaks a core extension workflow and creates a mismatch between user intent in the UI and how the CLI resolves the target.

## What Changes

- Add exact-target switch behavior to `arashi switch` so callers that already know the intended worktree can bypass fuzzy filter matching.
- Update VSCode switch flows that already know the selected worktree path to pass exact target identity instead of relying on ambiguous branch-name matching.
- Preserve existing interactive and filter-based CLI behavior for manual `arashi switch <filter>` usage while ensuring deterministic switching for UI-driven flows.
- Update docs and extension guidance where needed to describe the exact-target switch path used by IDE integrations.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `switch-command`: add a deterministic exact-target selection path for callers that already know which worktree should be opened.
- `vscode-command-integration`: require extension-driven switch flows that select a concrete worktree to invoke the CLI with exact target identity.
- `vscode-worktree-panel`: require panel-driven switch actions to resolve the selected worktree entry exactly, including entries whose branch names are duplicated across repositories.

## Impact

- CLI implementation in `repos/arashi/` for target resolution, flag parsing, and JSON/error handling around exact matching.
- VS Code extension code in `repos/arashi-vscode/` for command-handler and tree-item switch invocation.
- Documentation and skills content in `repos/arashi-docs/` and `repos/arashi-skills/` if user-facing switch behavior or troubleshooting guidance changes.
