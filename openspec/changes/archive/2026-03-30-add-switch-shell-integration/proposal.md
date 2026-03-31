## Why

`arashi switch` can launch a terminal or editor in a selected worktree, but it cannot change the caller shell's working directory. That leaves a gap for users who want in-place navigation, and issue #127 proposes a shell-integration flow that makes `switch` behave more like a native `cd` without removing existing launch behavior.

## What Changes

- Add shell integration commands that generate and install shell wrapper code for supported shells.
- Add directive-file based parent-shell coordination so wrapped invocations of `arashi switch` can request a safe `cd` in the caller shell.
- Extend `arashi switch` with explicit `cd` controls, config-driven mode resolution, and clear fallback diagnostics when shell integration is unavailable.
- Prevent directive-file environment variables from leaking into hooks or child processes.
- Add tests and documentation for shell integration setup, switch mode behavior, and safety constraints.

## Capabilities

### New Capabilities
- `shell-integration`: Shell wrapper initialization and installation that lets Arashi communicate safe parent-shell directives back to supported interactive shells.

### Modified Capabilities
- `switch-command`: Add switch-time `cd` behavior, mode precedence, and diagnostics while preserving existing launch-oriented flows.

## Impact

- CLI command surface and runtime behavior in `repos/arashi/`, including new `shell` subcommands, switch option parsing, config handling, and directive writing.
- User-facing configuration in `.arashi/config.json` for switch mode defaults.
- Hook and subprocess execution safety so directive environment variables are stripped before child execution.
- Documentation and usage guidance in `repos/arashi-docs/`, `repos/arashi-skills/`, and repository README/command docs.
- Test coverage for shell wrappers, directive generation, switch precedence, and launcher regression paths.
