## Why

`arashi create` currently resolves the same workspace defaults whether it is run from a terminal or from the VS Code extension. That makes extension-driven create flows inherit terminal-oriented switch and launch behavior, which can trigger the wrong follow-up action or duplicate editor launches unless users avoid defaults entirely.

## What Changes

- Add editor-aware create default resolution so extension-driven `arashi create` can use editor-specific overrides instead of always inheriting the generic CLI defaults.
- Define a workspace config section for editor or extension defaults, with support for VS Code-hosted create flows and a safe fallback that applies no post-create defaults when no editor override is configured.
- Update the VS Code extension create flow to identify its editor host when invoking the CLI so the CLI can resolve the correct defaults for that invocation.
- Document the precedence between generic create defaults, editor-specific create defaults, and explicit CLI flags or opt-outs.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `create-command-defaults`: extend create-default resolution to support editor-specific overrides and no-default fallback for extension-triggered create flows.
- `vscode-command-integration`: require the extension create flow to pass its host context so CLI default resolution can distinguish editor invocations from terminal invocations.

## Impact

- CLI config parsing and create default resolution in `repos/arashi/src/`.
- VS Code extension create argument construction and command invocation in `repos/arashi-vscode/src/`.
- Tests in `repos/arashi/tests/` and `repos/arashi-vscode/tests/` covering precedence, host-aware default resolution, and extension create behavior.
- User-facing configuration and workflow guidance in `repos/arashi/README.md` and companion docs if broader guidance needs updating.
