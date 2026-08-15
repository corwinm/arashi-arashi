## Why

Long-running coordinated features need follow-up branches to start from the same non-default branch in every repository. Today configured `arashi create` starts the parent from its current branch but starts children from their detected default branches, forcing users to pre-create matching branches manually before Arashi can coordinate their worktrees.

## What Changes

- Add an optional workspace default at `defaults.create.baseBranch` for the branch from which configured create derives new target branches.
- Add `arashi create <branch> --base <branch>` as a per-invocation override with precedence over the configured base.
- Resolve the requested base independently in the effective selected parent and child repositories, preferring a local branch and then `origin/<branch>`.
- Preflight every selected repository before hooks or mutation and fail with complete actionable diagnostics instead of silently falling back when an explicit/configured base is unavailable.
- Preserve current configured behavior when neither source is present, preserve existing target-branch reuse behavior, and keep implicit standalone create free of persisted workspace defaults while allowing the explicit flag.
- Report requested and resolved base information in dry-run and JSON results, and synchronize the schema, generated command contract, docs, agent-readable exports, packaged skill guidance, and cross-repository validation.

## Capabilities

### New Capabilities

- `create-base-branch-selection`: Define repository-local base resolution, selected-repository preflight, target-branch reuse, standalone explicit-flag behavior, and non-mutating preview semantics.

### Modified Capabilities

- `create-command-defaults`: Add `defaults.create.baseBranch`, `--base` precedence, absent-default compatibility, and configured-versus-standalone scope.
- `lifecycle-hook-contracts`: Require configured and standalone base-resolution failure to precede create hooks and all mutation.
- `machine-readable-cli-output`: Define structured requested/effective base data and complete per-repository base-resolution errors for create.
- `cross-repo-command-contracts`: Publish and enforce the new option/configuration semantics across generated CLI contracts and companion repositories.
- `docs-workflow-guidance-sections`: Publish discoverable create/configuration guidance, generated exports, and the pre-created-target compatibility workaround.
- `arashi-skill-guidance`: Teach agents the canonical configured and one-off base-branch workflows plus the existing-branch workaround boundary.

## Impact

- CLI implementation and tests in `repos/arashi`, including create option parsing, config normalization/schema generation, repository discovery/orchestration, dry-run/human/JSON output, generated completions, and command contracts.
- Canonical create/configuration documentation and generated agent-readable exports in `repos/arashi-docs`.
- Packaged create/configuration guidance and semantic contract records in `repos/arashi-skills`.
- Meta-repository OpenSpec contracts and cross-repository semantic validation.
- No dependency changes and no breaking change for workspaces that omit the new setting.
