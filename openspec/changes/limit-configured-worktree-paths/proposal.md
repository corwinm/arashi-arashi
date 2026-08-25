## Why

Configured worktree names can consume enough of an absolute path that Git, editors, hooks, or other Windows tools fail when they encounter repository files beneath the worktree. Windows long-path behavior is not uniform across applications, so configured workspaces need an opt-in way to reserve path space without changing Git branch names or manually abbreviating every branch.

## What Changes

- Add optional positive-integer `worktreeNaming.maxPathLength` as a UTF-16-code-unit budget for each absolute newly planned configured-worktree destination.
- Keep omission behavior-preserving; do not infer, persist, or migrate a platform default.
- Resolve the complete selected parent/child plan and, only when required, shorten the generated parent-relative namespace to a readable prefix plus a stable eight-hex SHA-256 suffix.
- Size one authoritative shortened parent against every selected coordinated child path so every final planned destination fits the budget.
- Fail with `WORKTREE_PATH_LENGTH_EXCEEDED` before mutation when the fixed base/child topology leaves insufficient room for the collision-resistant suffix.
- Reuse exact fitted paths for human output, dry-run, JSON, collision checks, hooks, materialization, and execution.
- Preserve exact Git branch identity, existing registered paths, configured child-relative paths, deliberate pre-existing naming aliases, and standalone `.worktrees/<branch>` behavior.
- Document that the setting reserves space but cannot guarantee the lengths of files inside a repository.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `configurable-worktree-location`: Extend configured naming policy with an opt-in absolute path budget, deterministic shortening, coordinated-plan sizing, and pre-mutation overflow failure.
- `machine-readable-cli-output`: Define authoritative fitted destination values and the structured overflow failure envelope.
- `docs-workflow-guidance-sections`: Explain configuration, examples, limitations, and unchanged compatibility boundaries.
- `docs-agent-readable-exports`: Preserve the same path-budget contract in generated exports.
- `arashi-skill-guidance`: Teach agents when and how to configure the budget without overstating protection.
- `cross-repo-command-contracts`: Keep CLI schema, canonical docs, generated exports, and packaged guidance synchronized.

## Impact

- **CLI (`repos/arashi`)**: config type/validation/schema, configured path planner, structured errors, tests, native Windows acceptance, and maintained configuration guidance.
- **Documentation (`repos/arashi-docs`)**: configuration/create guidance and generated exports.
- **Packaged guidance (`repos/arashi-skills`)**: focused workspace/create guidance and source/package semantic checks.
- **Meta repository**: OpenSpec deltas and coordinated drift validation.
- No automatic Windows detection, tracked-file scan, repository-content guarantee, interactive configure field, existing-worktree rename, standalone policy, numeric collision suffix, or Git branch transformation is introduced.

## Implementation Evidence

- CLI: https://github.com/corwinm/arashi/pull/165 at `0f23f3ca6e91b6ade6ae5f2c8da6a6d52fee41bd`
- Documentation: https://github.com/corwinm/arashi-docs/pull/95 at `c95f69ccc6f98ef3c2354f1657d744054469ba7b`
- Packaged guidance: https://github.com/corwinm/arashi-skills/pull/73 at `57936cb3670f91e2f418c49aacef52bdb31f01f0`
- CLI verification includes focused and full Vitest suites, schema drift, typecheck, lint, build, native materialization, and an independent exact-head specification/security review.
- Documentation verification includes 105 controlled semantic drifts, all 20 registered semantic checkers, Astro validation/build, links, accessibility, and domain checks.
- Packaged-guidance verification includes 114 authored/package drift fixtures, all 19 registered guidance checkers, security, deterministic archive, registration, and workflow-composition gates.
- Coordinated validation includes strict OpenSpec validation, the worktree-naming contract checker, and 16 controlled cross-repository tests.
