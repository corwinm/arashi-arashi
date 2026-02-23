## Why

Developers cannot reliably sync local repositories with workspace configuration when a repository is newly added or missing, and current command messaging is misleading in these cases. We need a dedicated clone workflow now to make first-time setup and ongoing repo synchronization predictable, interactive, and consistent.

## What Changes

- Add an `arashi clone` command that discovers missing configured repositories and interactively lets users choose which repositories to clone by default.
- Add a non-interactive option to clone all missing configured repositories in one command.
- Detect repositories already present locally and only present missing repositories as clone targets.
- Detect local repositories not present in configuration and provide guided options to add to config, delete local clone, or ignore.
- Update repository metadata handling so configured repositories store git URLs needed for clone operations.
- Improve `arashi status` output for missing repositories to suggest `arashi clone` instead of surfacing git spawn errors.
- Update `arashi add` duplicate-repository handling to suggest and optionally route users to `arashi clone` instead of misleading rename/remove guidance.
- Use a consistent clone protocol (SSH or HTTPS) based on existing user repository URLs, with an explicit prompt when protocol preference cannot be inferred.

## Capabilities

### New Capabilities

- `clone-command`: Clone missing configured repositories with interactive selection and clone-all support.
- `clone-discovery-and-reconciliation`: Detect missing configured repos and unmanaged local repos, then guide reconciliation actions.
- `clone-protocol-preference`: Infer and apply per-user SSH/HTTPS clone protocol consistency.

### Modified Capabilities

- `status-command`: Replace missing-repository git error path with actionable guidance to run `arashi clone`.
- `add-command`: Replace duplicate-repository remediation flow with clone-oriented guidance and optional fallback to clone workflow.

## Impact

- Affected code areas: CLI command surface (`clone`, `status`, `add`), repository/config management utilities, and prompt flows.
- Affected configuration/data: workspace repository entries must include cloneable git URL metadata.
- Affected docs/tooling: user docs and related integration surfaces (docs, skills, VS Code extension command guidance).
- External dependencies: git operations and network access for repository cloning.
