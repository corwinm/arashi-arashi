## Context

`arashi remove` already discovers worktrees, filters prunable records, checks dirty state, asks for confirmation unless forced, resolves branch presence across configured repositories, executes remove lifecycle hooks, removes worktrees, and deletes local branches. The new dry-run mode should reuse the same discovery and planning path so the preview matches the later mutating run, while making the mutation boundary explicit and testable.

## Goals / Non-Goals

**Goals:**

- Produce a faithful non-mutating plan for branch-name, path-targeted, forced, keep-worktrees, keep-branches, and JSON remove invocations.
- Surface dirty/blocking worktrees and skipped/missing repositories before users approve destructive cleanup.
- Show configured remove hooks that would be considered, without executing hook scripts during preview.
- Keep JSON stdout isolated and parseable for agents.
- Update CLI docs, docs site, and skill guidance so users know when to preview first.

**Non-Goals:**

- Changing the safety semantics of mutating `arashi remove`.
- Adding remote branch deletion or remote cleanup preview.
- Running hook scripts in any dry-run mode.
- Making interactive selection available in `--json` mode; JSON still requires explicit target input.

## Decisions

### Build an explicit removal plan before mutation

Create a plan object after target resolution, dirty checks, branch presence checks, and target repository derivation. The plan should include planned worktree remove operations, planned branch deletes, skipped main worktrees, missing branches, dirty blockers/details, the effective option flags, and hook discovery context. The mutating path can then execute from the plan instead of recomputing separate data.

Alternative considered: formatting the existing `RemovalSummary` before mutation by marking operations as pending. That keeps the diff smaller, but the summary type currently represents completed operations and success counts; overloading it for preview risks confusing dry-run output with executed results.

### Keep dry-run non-interactive except for target selection

Human `arashi remove --dry-run` without a target may still use the existing interactive worktree selector, because selection itself is not destructive and is required to know what the user wants to preview. After selection, dry-run must not ask the destructive confirmation prompt even when `--force` is absent.

JSON `arashi remove --dry-run --json` should require an explicit target, matching the current JSON non-interactive contract.

### Discover but do not execute hooks during preview

Dry-run should resolve `pre-remove` and `post-remove` hooks for the same target repositories and report whether hooks are configured, skipped, disabled, or invalid when this information is available without executing scripts. It must not run hook scripts or depend on hook exit status, because hook execution can mutate external systems.

### Treat dirty state as preview information, not a dry-run failure by itself

When the normal dirty check is enabled, dry-run should include dirty details and label those worktrees as blockers that would require user confirmation or an override path in a real remove. Because no mutation occurs, the preview can still exit successfully when the plan was produced. Structural errors such as missing targets or invalid config should still fail as they do today.

### Represent keep flags in the plan

`--keep-worktrees` should suppress planned worktree removals and show branch deletion/detach implications. `--keep-branches` should suppress planned branch deletes. Supplying both keep flags should produce a no-op preview that explicitly says no destructive operation would be performed.

## Risks / Trade-offs

- Preview and mutation drift → Reuse the same target resolution and planning helpers for both paths, and add tests that compare planned operations to mutating summaries in fixture workspaces.
- Hook context may be incomplete without execution → Report discovery/configuration context only and document that hook success/failure is known only during real removal.
- Output shape churn for existing JSON consumers → Add dry-run fields under a command-specific plan data object while preserving current mutating remove JSON behavior.
- Dirty worktree terminology can imply failure → Use explicit `blockers` / `warnings` language in JSON and clear human headings such as “Would be blocked without confirmation/force”.

## Migration Plan

1. Add tests describing dry-run planning and non-mutation behavior.
2. Implement plan construction and dry-run formatting in `repos/arashi`.
3. Update docs and skill references.
4. Validate CLI, docs, and skill package changes before opening implementation PRs.
