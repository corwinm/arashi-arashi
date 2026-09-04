## Why

Configured repository lifecycle hooks are intended to offer either an inline source or a native script, but remove hooks lack the workspace-owned repository-specific file form already used by configured create. Workspace owners therefore cannot keep targeted remove automation beside their coordinated create hooks, and `.arashi/hooks/pre-remove.<repo><ext>` is silently ignored.

## What Changes

- Discover `.arashi/hooks/pre-remove.<repo><ext>` and `.arashi/hooks/post-remove.<repo><ext>` as workspace-owned native files for the repository-scoped configured remove location.
- Treat the new file as the native alternative to `repos.<name>.hooks.pre-remove|post-remove`, preserving plain remove lifecycle names, repository scope, target-checkout cwd/context, per-target ordering, timeout, input, dry-run, JSON, gating, and finalization behavior.
- Preserve existing `repos/<repo>/.arashi/hooks/<lifecycle><ext>` compatibility; fail preflight deterministically if more than one native file form or an inline source claims the same repository lifecycle location.
- Update `doctor`, dry-run previews, and interactive repository hook configuration to use the same canonical candidate resolver and workspace-owned active filename.
- Update CLI and website guidance, generated/exported contracts, packaged skill guidance, and cross-repository semantic checks with POSIX and native Windows coverage.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `remove-lifecycle-hooks`: Add workspace-owned repository-specific native files to configured remove discovery and acceptance.
- `scoped-lifecycle-hooks`: Define the repository-scope candidate set, ambiguity behavior, cwd, and ordering.
- `inline-lifecycle-hook-configuration`: Make repository inline remove hooks alternative to the complete repository native candidate set.
- `remove-dry-run-preview`: Preview the new source and report the same ambiguity as real remove without execution.
- `workspace-health-diagnostics`: Diagnose the same repository-specific candidates and collisions as runtime.
- `interactive-repository-configuration`: Generate repository remove scripts at the workspace-owned repository-specific active filename.
- `configured-repository-deletion`: Include workspace-owned repository remove scripts in exact owned-hook cleanup while preserving unrelated hooks.
- `docs-workflow-guidance-sections`: Document the symmetric repository-specific script/inline model without obscuring legacy compatibility.
- `arashi-skill-guidance`: Keep packaged operational guidance aligned with the new configured remove filename and ambiguity rules.

## Impact

The change affects configured remove hook planning in `repos/arashi`, shared native candidate discovery used by runtime/dry-run/doctor, repository hook onboarding/configuration, CLI and website hook documentation, generated agent-readable exports and contracts, the packaged Arashi skill, and cross-repository semantic validation. Existing repository-local remove files remain supported; workspaces that define both old and new repository file forms for one lifecycle must resolve the resulting explicit ambiguity before removal.
