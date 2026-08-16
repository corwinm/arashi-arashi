## Why

Git worktrees do not inherit ignored or untracked local files from a repository's canonical checkout, so common setup such as local environment files and intentionally shared caches currently requires custom lifecycle shell code. Arashi should provide a small, portable, repository-level materialization contract that is safer to validate, preview, diagnose, and roll back than user-authored copy/link commands.

## What Changes

- Add optional `copy: string[]` and `symlink: string[]` fields directly to each configured `repos.<name>` entry.
- Materialize each configured path from the repository's canonical source checkout to the identical relative path in a newly created worktree, after repository `pre-create` and before repository `post-create`.
- Validate relative-path safety, normalized duplicates, cross-mode collisions, source-checkout availability, destination containment, no-overwrite behavior, and native symbolic-link capability without shell-composed filesystem commands.
- Preserve optional machine-local configuration by visibly skipping missing sources, while failing actionable conflicts and unsupported link operations.
- Extend create planning, dry-run, human output, JSON results, partial-failure handling, and rollback with deterministic ordered materialization outcomes.
- Extend `arashi doctor` with non-mutating checks for configured sources, destination safety, existing managed-worktree links, and platform symlink capability.
- Update CLI and website documentation, generated agent-readable exports, packaged Arashi skill guidance, and stable cross-repository semantic validation.
- Keep source/destination remapping, globs, environment expansion, per-entry modes, implicit fallbacks, hard links, junctions, and standalone/configless configuration out of scope.

## Capabilities

### New Capabilities

- `repository-worktree-materialization`: Defines repository configuration, canonical source resolution, copy/symlink planning and execution, lifecycle timing, path and link safety, outcomes, rollback, dry-run, platform acceptance, and user guidance.

### Modified Capabilities

- `lifecycle-hook-contracts`: Inserts declarative materialization after repository `pre-create` and before repository `post-create` without making it hook-owned or disabling it with `--no-hooks`.
- `workspace-health-diagnostics`: Adds shared, non-mutating materialization diagnostics to configured `arashi doctor`.
- `machine-readable-cli-output`: Adds stable ordered materialization outcomes to configured create success, failure, partial-result, and dry-run envelopes while preserving single-document stdout.
- `cross-repo-command-contracts`: Requires stable source/package/meta aggregate validation for configuration and guidance parity across CLI, docs, generated exports, and skills.
- `arashi-skill-guidance`: Teaches agents when to copy versus symlink, the same-relative-path and canonical-source rules, safety/fallback boundaries, and the risky nature of shared dependency trees.
- `docs-agent-readable-exports`: Keeps generated agent-readable website guidance synchronized with canonical materialization documentation.
- `docs-workflow-guidance-sections`: Adds proportionate user-facing setup guidance for repository file materialization and copy-versus-symlink choices.

## Impact

- **CLI repository:** configuration types and normalization, generated JSON Schema, configured repository loading, create planning/orchestration, filesystem materialization and rollback helpers, human/JSON result types, doctor diagnostics, docs, and native POSIX/Windows tests.
- **Docs repository:** configuration and create workflow documentation plus generated agent-readable exports and registered semantic checks.
- **Skills repository:** focused references, packaged guidance, source/package semantic checks, and canonical archive verification.
- **Meta repository:** OpenSpec artifacts and registered cross-repository contract validation using existing stable aggregate entrypoints.
- **Compatibility:** additive optional configuration; existing workspaces behave unchanged. Configured mode only; no new external dependency or shell-tool requirement.
