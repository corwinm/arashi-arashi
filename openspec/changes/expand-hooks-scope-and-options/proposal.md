## Why

Arashi currently discovers lifecycle hooks only from the workspace root, which prevents repository-specific setup logic and reusable user-level automation across multiple Arashi workspaces. Expanding hook scope now unblocks consistent setup workflows for teams with shared repos and users who maintain global bootstrap scripts.

## What Changes

- Add hook discovery for three scopes: repository-local (`repos/<repo>/.arashi/hooks/<lifecycle>.sh`), workspace-root (`.arashi/hooks/<lifecycle>.sh`), and user-global (`~/.arashi/hooks/<lifecycle>.sh`).
- Define deterministic execution order: repository scope first, then workspace-root scope, then user-global scope.
- Execute each hook in the repository context where it is defined so scripts run against the correct working directory.
- Add global hook scoping options so user-global hooks can target a specific repository name or apply to all repositories.
- Update user-facing docs and skills guidance to explain hook locations, precedence, and scoping behavior.

## Capabilities

### New Capabilities

- `scoped-lifecycle-hooks`: Discover lifecycle hooks from repository, workspace, and user-global locations and execute them in a deterministic order.
- `global-hook-targeting`: Support user-global hooks that can be applied either to all repositories or filtered to specific repository names.

### Modified Capabilities

- `remove-lifecycle-hooks`: Expand remove hook behavior from workspace-root-only discovery to scoped discovery and ordered execution consistent with the new hook resolution model.

## Impact

- Affected implementation: hook discovery/execution utilities and command flows that invoke lifecycle hooks in `repos/arashi`.
- Affected behavior: hook execution context (working directory), ordering, and selection logic for global hooks.
- Affected docs: command/hook documentation in `repos/arashi-docs` and workflow guidance in `repos/arashi-skills`.
