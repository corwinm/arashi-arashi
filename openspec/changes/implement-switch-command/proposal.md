## Why

Arashi currently has no command for quickly switching into an existing worktree from the CLI, which slows down day-to-day branch navigation in multi-worktree setups. Adding a dedicated switch flow now closes a common workflow gap and aligns with issue #64.

## What Changes

- Add a new `switch` command that lets users select or filter branches that already have associated worktrees.
- Open a new terminal context at the selected worktree path instead of attempting to `cd` in place.
- Add a `--sesh` mode that uses `sesh` to switch workspace when the terminal context is tmux.
- Detect VS Code integrated terminals and prefer opening a new VS Code window/context when supported.
- Define clear fallback behavior when terminal-specific integration is unavailable.

## Capabilities

### New Capabilities
- `switch-command`: Interactive and filter-based worktree switching that opens the selected worktree in an appropriate terminal/session context.

### Modified Capabilities

## Impact

- Affected code: CLI command registration/parsing and a new `switch` command implementation in `repos/arashi`.
- Affected integrations: terminal launching behavior, tmux/`sesh` detection, and VS Code terminal detection.
- Affected UX: branch/worktree selection prompts, filtering flow, and user-facing success/error messaging.
- Affected quality gates: unit/integration tests for switch behavior and terminal-mode branching.
