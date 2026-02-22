## Why

Arashi is currently easiest to use from the terminal, which makes common workflows slower for developers who work primarily inside VS Code. Issue #59 requests a first-class editor integration so users can trigger Arashi actions with native VS Code prompts and manage worktrees without leaving the IDE.

## What Changes

- Create a VS Code extension that contributes keybind-friendly commands for core Arashi actions (`init`, `add`, `create`, `switch`, `remove`) and gathers input with native VS Code UI.
- Add a dedicated worktree panel that lists Arashi-managed worktrees, shows git-change status, and supports quick actions (switch, delete, add repo).
- Add extension-side command execution, result reporting, and error handling so command success/failure is clear in the VS Code experience.
- Ensure extension command integrations use machine-readable CLI output (`--json`) for operations that require parsing.
- Add extension configuration, packaging, and project scaffolding aligned with existing extension conventions referenced in issue #59.

## Capabilities

### New Capabilities

- `vscode-command-integration`: Expose Arashi CLI operations as VS Code commands with native input/confirmation flows and keybinding support.
- `vscode-worktree-panel`: Provide a VS Code view that displays Arashi worktrees with status indicators and contextual management actions.

### Modified Capabilities

- None.

## Impact

- Adds a new VS Code extension implementation area under `repos/arashi-vscode`, including command handlers and view-provider logic.
- Introduces dependency on the VS Code extension runtime and extension packaging/release configuration.
- Requires release/publishing support for both VS Marketplace and Open VSX.
- Expands documentation and onboarding for editor-based workflows while keeping existing CLI behavior intact, with compatibility expectations for VS Code forks such as Cursor.
