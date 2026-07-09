## Why

The VS Code extension currently exposes worktree navigation, but users still need to run `arashi status` in a terminal to understand whether the whole coordinated workspace is healthy. A lightweight workspace status dashboard can make dirty repositories, branch drift, missing child repos, and recovery paths visible directly inside VS Code.

## What Changes

- Extend the existing Arashi Worktrees panel into a workspace health dashboard backed by `arashi status --json`.
- Show per-repository health for the current coordinated workspace, including branch/tracking identity, dirty state, ahead/behind/divergence, missing/error states, and healthy repos.
- Surface conservative contextual actions for common recovery paths such as open repository, open terminal, pull, clone missing repositories, and prune stale metadata where safely supported.
- Preserve graceful behavior for older or unsupported CLI versions by keeping last-known panel data when possible and showing actionable guidance when status JSON cannot be consumed.
- Update extension README guidance with the dashboard workflow and representative healthy/unhealthy states.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `vscode-worktree-panel`: Add workspace health/status dashboard behavior to the existing VS Code panel.

## Impact

- `repos/arashi-vscode`: panel data model, CLI status parsing, tree presentation, contextual actions, tests, and extension README guidance.
- `repos/arashi-docs`: likely no docs-site change for the MVP unless implementation exposes new user-facing behavior beyond extension README coverage.
- `repos/arashi`: no CLI behavior change expected for the MVP because `arashi status --json` already exposes repository branch and dirty-state data; stale/prunable metadata may be limited to an action that invokes existing prune preview behavior if status does not expose it directly.
