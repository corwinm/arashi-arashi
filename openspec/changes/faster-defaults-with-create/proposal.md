## Why

Creating a worktree currently requires extra manual steps to switch into it and open the preferred shell/editor workflow. This slows down branch creation and adds repetitive command usage, so users need configurable defaults that make `create` and `switch` one-step flows.

## What Changes

- Add configurable default behavior for `arashi create` so users can automatically switch into the new worktree and launch a preferred shell/editor command.
- Add explicit opt-out flags on `create` to bypass configured defaults for a single invocation (for example, skip auto-switch or skip shell launch).
- Extend default launch behavior to `arashi switch` so switching can also open the configured terminal/editor workflow.
- Define config schema updates and precedence rules between config defaults and CLI flags.

## Capabilities

### New Capabilities
- `create-command-defaults`: Configure default post-create actions (auto-switch and shell/editor launch) with per-command opt-out flags.

### Modified Capabilities
- `switch-command`: Allow `switch` to apply configurable default shell/editor launch behavior with one-off opt-out controls.

## Impact

- Affected code in command option parsing and execution flow for `create` and `switch` under `repos/arashi/src/`.
- Configuration changes in `.arashi/config.json` (new default settings and documented precedence).
- Tests for config-driven behavior, flag overrides, and create/switch integration paths in `repos/arashi/tests/`.
- Documentation updates for CLI usage, defaults configuration, and migration guidance.
