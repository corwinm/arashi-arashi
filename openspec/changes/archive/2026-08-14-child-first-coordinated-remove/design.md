## Context

Configured remove discovers the parent meta-repository before configured children and appends matching worktrees in that repository order. Both dry-run planning and mutation iterate the resulting `worktreesToRemove` array directly. In a coordinated worktree, child paths are descendants of the parent path (`<parent>/repos/<child>`), so Git's parent worktree removal recursively removes those directories before child repositories can deregister them.

The command already records each operation and continues after failures, runs post-remove hooks after operation attempts, and offers `doctor`/`prune` recovery for pre-existing stale registrations. This change must prevent new stale metadata without changing those public contracts or standalone mode.

## Goals / Non-Goals

**Goals:**

- Derive one deterministic, dependency-safe worktree removal plan for configured mode.
- Use that plan for dry-run output, JSON output, hook target data, and execution.
- Prevent an ancestor removal when a failed descendant removal would make that ancestor destructive to still-registered metadata.
- Preserve independent progress and truthful per-operation failures.
- Prove cleanup with real Git registrations, not filesystem assertions alone.

**Non-Goals:**

- Automatically prune stale registrations created before this command.
- Change standalone remove ordering or semantics.
- Add CLI options, configuration, operation record fields, or dependencies.
- Change branch deletion, dirty checking, confirmation, or lifecycle-hook policy except where worktree dependency failure prevents safe ancestor mutation.

## Decisions

### Close the target set over nested descendants

After ordinary branch/path/interactive target discovery, configured mode will compare the selected worktrees with the complete discovered configured worktree inventory whenever worktree removal is enabled. If a selected ancestor contains a removable nested child worktree, that child becomes an explicit removal target even when it uses a different branch or was not the exact path argument. This closure repeats for deeper descendants. Auto-included descendants participate in confirmation, hook target data, operation reporting, worktree removal, and the existing branch-deletion policy just as descendants selected through the interactive parent grouping already do. When `--keep-worktrees` disables worktree removal, there is no recursive deletion hazard, so exact target and branch-action semantics remain unchanged and descendant closure is not applied.

Alternative: order only the initially selected targets. Rejected because a parent selected by exact path, or by a branch different from a nested child branch, could still recursively erase an omitted child's path and leave its registration stale.

### Build an explicit descendant-first plan

After descendant closure and before confirmation/summary construction, configured mode will order removable worktrees by path ancestry: a worktree whose normalized path is inside another target path must precede that ancestor. Unrelated paths retain deterministic discovery order. Path comparison will use existing path-normalization/platform conventions rather than raw prefix matching, so sibling prefixes such as `/feature-a` and `/feature-ab` are not treated as dependencies.

Alternative: reverse repository discovery order. Rejected because configuration order is not the safety contract and does not generalize to deeper nesting or path-targeted selections.

### Share the plan across preview and execution

The descendant-closed ordered collection becomes the authoritative input for operation previews, hook target derivation, confirmation, branch-presence planning, and the execution loop. Dry-run and JSON therefore describe the complete target set and order the mutating command will attempt rather than maintaining separate discovery and presentation plans.

Alternative: sort only immediately before mutation. Rejected because preview would continue to misrepresent destructive behavior and tests could not verify the plan safely.

### Fail closed at an ancestor dependency

If a descendant worktree removal fails, the command must not attempt an ancestor whose removal would recursively erase that descendant path. It will record an attributable failed worktree operation for the blocked ancestor using the existing operation/error shape, continue independent worktree removals, preserve all failures in the final result, and return non-zero. Branch deletion and post-remove finalization retain their existing attempted/failure reporting.

Alternative: continue with the ancestor and rely on `arashi prune`. Rejected because it recreates the defect. Abort every remaining removal was also rejected because unrelated repositories can still be cleaned safely and the command already has partial-failure semantics.

### Verify Git registration state directly

A real temporary configured workspace test will create a parent linked worktree and nested child linked worktrees, including a child on a different branch, run configured removal by parent branch and exact parent path, then inspect `git worktree list --porcelain` and `git worktree prune --dry-run --verbose` in every owning repository. Tests will assert removed paths are absent and no operation-created registration is prunable. A focused failure-path test will inject a descendant removal failure and prove the ancestor path and registration remain intact while independent work can continue.

Alternative: assert only that directories disappear. Rejected because the bug is specifically hidden repository-local metadata after the parent directory is gone.

## Risks / Trade-offs

- [Path ancestry differs across POSIX and Windows] → Use platform-aware normalized path boundaries and cover sibling-prefix plus separator/case behavior through focused tests and CI.
- [A child failure leaves more filesystem state than before] → This is intentional fail-closed behavior; identify both child and blocked ancestor in operation errors and return non-zero.
- [Descendant expansion changes hook and branch target context] → Make the expanded worktree set explicit before confirmation, derive hook targets and existing branch actions from that authoritative plan, and preserve canonical hook aggregate normalization.
- [`--keep-worktrees` has no ancestry hazard] → Apply descendant closure only when worktree removal is enabled, preserving existing branch-only target semantics and the both-keep-flags no-op.
- [Real-Git integration coverage is slower] → Keep one focused nested-workspace acceptance fixture and use smaller unit tests for ordering edge cases.

## Migration Plan

No data or configuration migration is required. Ship the ordering fix in the CLI. Existing stale registrations remain recoverable with `arashi doctor` followed by `arashi prune`. Rollback is a normal code revert; no persisted schema changes are introduced.

## Open Questions

None.
