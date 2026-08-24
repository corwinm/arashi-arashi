## Why

Arashi's corrected topology defaults still leave configured worktree directory names dependent on repository shape and preserve branch-name slashes as directory boundaries. Configured workspaces need a constrained, portable naming policy that makes new destination paths predictable without changing Git branch names, migrating existing worktrees, or introducing an arbitrary template language.

## What Changes

- Add optional root-level `worktreeNaming.style` configuration with `current`, `branch`, and `repo-branch` values. Omission and explicit `current` preserve the corrected bare/non-bare topology defaults delivered for #323.
- Add optional `worktreeNaming.branchSlashes` configuration with `preserve` and `flatten` values. Omission and explicit `preserve` retain slash-separated path hierarchy; `flatten` replaces branch `/` separators only in the filesystem naming component.
- Resolve one exact configured parent/child destination plan before hooks, branch creation, worktree creation, managed-path writes, or other mutation, and reject deterministic filesystem or Git-registration collisions without suffixes or alternate names.
- Reuse that authoritative plan for human output, dry-run output, JSON output, collision diagnostics, coordinated child placement, and execution while preserving the requested Git branch exactly.
- Preserve metadata-driven operation of existing worktrees and the fixed standalone `.worktrees/<branch>` convention.
- Extend generated configuration types/schema, maintained configuration guidance, examples, and companion documentation for the new closed settings and compatibility defaults.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `configurable-worktree-location`: Add configured naming and slash policies while preserving corrected topology defaults, authoritative planning, collision safety, coordinated child layout, standalone isolation, existing-worktree compatibility, and cross-platform behavior.
- `machine-readable-cli-output`: Make configured create success, dry-run, and collision JSON destinations reflect the selected naming policy without changing the established envelope, ordering, or destination field locations.
- `init-repository-aware-worktree-default`: Qualify configured bare create's persisted-base destination as the omitted/`current` compatibility policy while allowing explicit `branch` and `repo-branch` styles beneath the same base.
- `docs-workflow-guidance-sections`: Require canonical authored configuration/create guidance for the closed policy, compatibility defaults, exact examples, JSON-authored scope, collision behavior, and unchanged Git branches.
- `docs-agent-readable-exports`: Preserve the same naming-policy contract in generated Markdown and full-document agent exports.
- `arashi-skill-guidance`: Add focused packaged workspace/create guidance without expanding the routing-only skill entry point.
- `cross-repo-command-contracts`: Require deterministic coordinated drift checks across the CLI schema and maintained/generated docs and skill guidance.

## Impact

- **CLI (`repos/arashi`)**: authored root configuration types and validation, generated JSON Schema, destination planning, configured create preflight/execution, human/dry-run/JSON renderers, maintained guidance, and focused/native regression coverage.
- **Documentation (`repos/arashi-docs`)**: authored configuration and create guidance plus regenerated agent-readable exports.
- **Packaged guidance (`repos/arashi-skills`)**: audit concrete configured destination examples and update only policy-bearing guidance that would otherwise contradict the new configuration contract.
- **Meta repository**: OpenSpec deltas and coordinated contract validation across the CLI schema and maintained/generated companion guidance.
- No configuration migration, existing-worktree rename, standalone naming option, arbitrary template syntax, automatic collision suffix, or Git branch transformation is introduced.
