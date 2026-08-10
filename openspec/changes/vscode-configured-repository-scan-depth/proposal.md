## Why

VS Code scans one directory below an opened workspace for Git repositories by default, while Arashi's configured child repositories commonly live at `repos/<repository>` and may use still-deeper custom paths. The Arashi extension already resolves configured workspace context, so it can calculate the required scan depth and offer a precise, opt-in correction instead of hardcoding `2` or asking users to diagnose editor settings themselves.

## What Changes

- Derive the required VS Code repository scan depth from configured `repos.<name>.path` values that are reachable beneath opened workspace folders.
- Check the effective `git.repositoryScanMaxDepth` only when a readable, usable Arashi configuration is available.
- Prompt only when the effective depth is insufficient, and let the user choose whether to persist the computed value for the current workspace or globally for their user profile.
- Require separate explicit actions for the settings update and for reloading the editor window.
- Treat explicit workspace-folder repositories and paths outside opened workspace folders accurately rather than claiming scan depth can discover them.
- Limit the feature to `git.repositoryScanMaxDepth`; do not inspect or modify other VS Code Git settings.

## Capabilities

### New Capabilities

- `vscode-configured-repository-discovery`: Compute and optionally apply VS Code Git repository scan depth from an available Arashi workspace configuration.

### Modified Capabilities

None.

## Impact

- `repos/arashi-vscode`: configured-workspace parsing/context, activation and refresh diagnostics, VS Code configuration updates, user notifications, and unit/extension-host tests.
- `repos/arashi-docs`: no additional change is required beyond the merged concise guidance for the default layout.
- No Arashi CLI behavior, Arashi config schema, or unrelated VS Code Git setting changes.
