## Why

The VS Code worktree panel can report a successful refresh without showing worktrees that were created or discovered since the panel last rendered. This breaks trust in the panel as a live view of workspace state and makes common extension workflows appear unreliable.

## What Changes

- Update VS Code panel refresh behavior so a successful manual refresh always updates the visible tree with the latest discovered worktrees.
- Align panel refresh and post-action refresh flows around a single UI update path so newly added, removed, or discovered worktrees appear in the same session.
- Add regression coverage for refresh scenarios where the underlying worktree list changes between refreshes.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `vscode-worktree-panel`: require manual and action-driven refresh flows to update the rendered panel state immediately when discovery returns changed worktree data.

## Impact

- Extension implementation in `repos/arashi-vscode/`, especially the worktree store, tree provider, and command handlers that trigger refresh.
- Extension tests in `repos/arashi-vscode/tests/` covering manual refresh and UI synchronization.
- No expected CLI contract or user configuration changes.
