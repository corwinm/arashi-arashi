## Why

Arashi's worktree lifecycle is valuable for ordinary single repositories, but most commands currently require `.arashi/config.json` even when the repository already follows the common root-level `.worktrees/` convention. Supporting that convention as an implicit standalone workspace removes unnecessary setup while preserving configured meta-repositories as the authoritative, more capable workflow.

## What Changes

- Recognize a non-bare Git repository with a main-worktree `.worktrees/` directory and no `.arashi/config.json` as an implicit standalone Arashi workspace, including when invoked from one of its linked worktrees.
- Synthesize the standalone workspace configuration in memory only, with `.worktrees` as the worktree base and no child repositories, while preserving real-config precedence and surfacing malformed or invalid existing config.
- Add `arashi init --zero-config` to create `.worktrees/` and, only when no effective Git ignore rule exists, add a repository-local `.worktrees/` exclusion without modifying `.gitignore`, global Git configuration, or `.arashi/` state.
- Support standalone `create`, `list`, `status`, `switch`, `remove`, `prune`, `doctor`, `move`, and `handoff` behavior, with new worktrees at `.worktrees/<branch>` and natural nested paths for branch names containing `/`.
- Block `create` before mutation when the exact planned `.worktrees/<branch>` destination is not effectively ignored, including dry-run, and provide actionable bootstrap/local-exclude guidance.
- Keep child-repository coordination commands and meaningless repository/group filters restricted to configured workspaces with explicit guidance rather than silently broadening scope.
- Preserve dry-run, rollback, human-output, and single-document JSON contracts while identifying implicit standalone mode consistently.
- Document standalone mode as a first-class workflow, link it from Getting Started and relevant command pages, update packaged agent guidance, and regenerate agent-readable exports.

## Capabilities

### New Capabilities

- `zero-config-standalone-workspaces`: Defines implicit workspace discovery, in-memory configuration, initialization bootstrap, command scope, path layout, ignore safety, precedence, linked-worktree behavior, and configured-workspace upgrade guidance for single repositories.

### Modified Capabilities

- `managed-git-ignore-reconciliation`: Adds passive zero-config ignore inspection and explicit repository-local bootstrap behavior without applying configured-workspace managed-block or scope-preference semantics.
- `machine-readable-cli-output`: Adds stable standalone workspace and zero-config bootstrap/blocker details while preserving isolated single-document JSON stdout.
- `workspace-health-diagnostics`: Extends non-mutating diagnostics to implicit standalone repositories and their `.worktrees/` ignore safety.
- `agent-handoff-reporting`: Allows handoff reports for implicit standalone workspaces while preserving configured coordinated reporting.
- `scoped-lifecycle-hooks`: Defines which existing lifecycle hook scopes apply when no persisted standalone workspace config exists.
- `global-hook-targeting`: Defines deterministic repository identity and execution context for user-global hooks in standalone mode.
- `remove-lifecycle-hooks`: Preserves pre/post remove gating, finalization, context, and failure behavior for standalone removals.
- `status-command`: Extends workspace status inspection to the single resolved standalone repository.
- `switch-command`: Extends worktree target discovery and switching to implicit standalone worktrees.
- `remove-dry-run-preview`: Extends non-mutating removal plans to standalone worktrees and branches.
- `worktree-pruning`: Extends stale worktree discovery and pruning to the standalone repository.
- `worktree-change-movement`: Extends eligible change movement to worktrees of the standalone repository.
- `configurable-worktree-location`: Separates configured custom-location behavior from the fixed `.worktrees/<branch>` standalone layout.
- `repository-group-selection`: Rejects configured repository/group selection flags when they have no standalone meaning.
- `create-command-defaults`: Keeps persisted configured defaults out of implicit standalone create behavior.
- `docs-agent-readable-exports`: Requires standalone workflow and command guidance to appear in generated Markdown and LLM exports.
- `arashi-skill-guidance`: Teaches agents to select zero-config standalone mode for one repository and configured mode for coordination/customization.
- `cross-repo-command-contracts`: Keeps CLI, documentation, and skill command/option coverage aligned for `init --zero-config` and the supported standalone lifecycle.

## Impact

- Affected repositories: `corwinm/arashi`, `corwinm/arashi-docs`, and `corwinm/arashi-skills`; OpenSpec artifacts remain in `corwinm/arashi-arashi`.
- Expected CLI areas include workspace/config discovery, Git main-worktree resolution, worktree path calculation, managed-ignore inspection, `init`, lifecycle command entry points, repository filters, JSON result types, contracts, and Git-backed integration fixtures.
- Expected documentation and skill areas include Getting Started, a dedicated standalone workflow, relevant command pages, automation guidance, generated Markdown/LLM exports, and cross-repository contract checks.
- No persisted implicit config, tracked ignore-file mutation, global Git configuration mutation, or new runtime dependency is expected.
