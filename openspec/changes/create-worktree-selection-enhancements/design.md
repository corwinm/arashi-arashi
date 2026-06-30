## Context

`arashi create -i` currently sends the full repository list, including the current parent/meta repository, into the generic multi-select prompt. That lets users deselect the parent, even though coordinated worktrees require the parent worktree as the anchor where selected child repo worktrees will live.

`arashi status` currently checks every configured repo path. In a partial coordinated worktree, intentionally omitted child repos are absent under `repos/`, so default status output reports them as errors and makes the workspace look broken. `arashi clone` also treats missing repos as ordinary remote clones, which would check out a default branch instead of extending the coordinated branch workspace.

## Goals / Non-Goals

**Goals:**
- Keep the parent/meta worktree mandatory during interactive create while preserving child repo selection.
- Make default status output useful for partial worktrees by hiding missing child repos unless the user asks for verbose detail.
- Allow `arashi clone` to complete a partial coordinated worktree by adding selected missing child repos on the current branch.
- Preserve existing behavior for explicit `--only`, non-interactive create, ordinary clone, and JSON/verbose status visibility.

**Non-Goals:**
- Changing how worktree base paths are configured.
- Creating remote branches for child repos that do not already have the current branch.
- Replacing `arashi create --only`; partial creation remains supported.
- Changing release/package metadata or adding dependencies.

## Decisions

1. **Filter parent/meta separately for interactive create.**
   - The command layer already knows which repository is the parent because it prepends the current repository to the discovered child repositories. Interactive filtering should treat that first/current repository as required and only prompt for selectable child repositories.
   - Alternative considered: mark the parent choice as preselected/disabled in the prompt. The existing prompt abstraction does not expose disabled multi-select choices consistently, so separating required and selectable repos keeps the behavior deterministic.

2. **Hide only missing-repository statuses from default and short human output.**
   - `checkAllRepos` should still produce full status records, including missing repos, so JSON output and verbose output can remain complete. Human default/short formatting should filter statuses whose error is the known missing-repository guidance unless verbose is enabled.
   - Alternative considered: skip missing repos during status collection. That would make JSON less useful for agents and would remove the explicit verbose inspection path requested by the issue.

3. **Make clone choose between worktree completion and ordinary remote clone per selected repo.**
   - Before ordinary clone execution, `arashi clone` can look for a sibling/source repository outside the current coordinated worktree and, when found, run `git worktree add <missing-path> <current-branch>` from that source repo.
   - If no source repo or branch context is available, clone falls back to the current remote clone path.
   - Alternative considered: route through the full `createCoordinatedWorktrees` operation. That would re-run parent/meta create logic and conflict handling for repositories already present, making a simple completion operation harder to reason about.

4. **Keep branch resolution local and explicit.**
   - Completion uses the current workspace root branch name as the target branch for missing child repo worktrees. If the current workspace is detached or the source repo cannot add that branch, the command reports a per-repo failure and continues with remaining selected repos.

## Risks / Trade-offs

- **Source repo discovery may not find unusual layouts** → Fall back to ordinary clone when no source repository can be resolved.
- **A selected child repo may not have the current branch locally** → Surface the git worktree error for that repo and continue cloning/creating the rest.
- **Hiding missing repos could obscure incomplete worktrees** → Keep missing repo records visible with `--verbose` and `--json`, and keep `arashi clone` as the guided remediation.
- **Interactive create selection changes prompt shape** → Cover with unit tests that parent/meta is always included and omitted from prompt choices.

## Migration Plan

- Implement behind existing commands with no config migration.
- Add focused tests for interactive create filtering, status hidden/verbose missing repo output, and clone worktree completion.
- Validate with the standard Arashi CLI checks: `bun run lint`, `bun run test`, and `bun run build`.
