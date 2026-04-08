## Why

The VS Code extension currently confirms worktree removal in native editor UI but still invokes `arashi remove` in a way that can trigger an interactive CLI confirmation. In editor-driven remove flows, that extra prompt causes the operation to fail instead of completing against the selected worktree, and long-running extension commands provide little visible feedback while they are in progress.

## What Changes

- Update VS Code remove flows to treat the editor confirmation as the single destructive confirmation step and invoke the CLI in non-interactive forced mode afterward.
- Ensure both command-palette removal and panel trash-button removal target the exact selected worktree without falling back to a prompt-driven CLI flow.
- Show a native busy indicator while long-running Arashi commands execute so users can tell the extension is still working.
- Add regression coverage for successful forced remove invocations, visible progress wrapping for long-running commands, and cancellation behavior when the user declines the VS Code confirmation.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `vscode-command-integration`: require editor-confirmed remove commands to invoke `arashi remove` without a second interactive confirmation prompt and require long-running commands to surface in-progress feedback.
- `vscode-worktree-panel`: require panel remove actions to execute against the clicked worktree using the extension confirmation as the only confirmation step.

## Impact

- Extension command handling in `repos/arashi-vscode/`, especially remove command argument construction, confirmation flow wiring, and shared progress notification behavior for long-running commands.
- Extension tests in `repos/arashi-vscode/tests/` covering command-palette and tree-item remove behavior plus progress-wrapped command execution.
- No expected CLI changes; this proposal aligns extension behavior with existing non-interactive CLI support.
