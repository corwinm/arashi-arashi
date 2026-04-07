## Why

The VS Code extension already exposes Arashi worktree management, but key UI flows are still awkward or hard to discover. The current panel does not refresh reliably after commands, its destructive remove flow is unnecessarily confusing, and it does not yet help users navigate across the parent workspace and child repositories in a way that matches how Arashi is actually used.

## What Changes

- Improve the worktree panel UX so its primary actions match frequent workflows, including creating worktrees directly from the panel instead of prioritizing repository addition.
- Make panel and command-driven actions keep the UI synchronized after worktree changes so newly created or removed entries appear immediately.
- Simplify destructive removal from the panel so users confirm the selected worktree once and the extension executes that exact removal flow reliably.
- Add extension navigation support for parent and child repositories so users can see repo context and open a VS Code window focused on a selected repository from both commands and UI surfaces.
- Update extension README guidance to explain where the panel lives and how to use it, including visual or descriptive onboarding that improves discoverability.

## Capabilities

### New Capabilities
- `vscode-repo-navigation`: let users view related repositories from the extension and open an editor window focused on a selected parent or child repository.
- `vscode-extension-panel-guidance`: document how to find and use the extension panel so the worktree UI is discoverable for new users.

### Modified Capabilities
- `vscode-worktree-panel`: update panel actions, contextual labeling, removal flow, and refresh behavior to support a more reliable day-to-day worktree workflow.
- `vscode-command-integration`: extend command registration and execution flows so repo-navigation actions and panel-driven mutations stay consistent with command-palette behavior.

## Impact

- Primary implementation in `repos/arashi-vscode/` across command handlers, tree views, worktree state management, and extension manifest contributions.
- Documentation updates in `repos/arashi-vscode/README.md`, with companion docs review in `repos/arashi-docs/` only if broader workflow guidance needs to change.
- Tests in `repos/arashi-vscode/tests/` for panel refresh, removal confirmation, and repo-navigation flows.
