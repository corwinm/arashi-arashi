## 1. Removal Plan TDD

- [ ] 1.1 Add focused failing tests for descendant target closure across exact-parent-path and mixed-branch parent selection, transitive nesting, normalized descendant-before-ancestor ordering, unrelated stable order, sibling-prefix paths, platform path semantics, and no closure under `--keep-worktrees`.
- [ ] 1.2 Implement the smallest typed configured worktree-plan helper that expands selected ancestors over the complete configured inventory and satisfies the ordering tests without changing standalone behavior.
- [ ] 1.3 Add failing configured dry-run tests proving human and JSON operation arrays expose the complete expanded child-first plan and remain non-mutating, including mixed-branch descendant branch actions and `--keep-worktrees` preservation.
- [ ] 1.4 Add failing orchestration tests proving auto-included descendants participate in dirty resolution and confirmation before mutation, pre/post-remove hook target/context data, branch-deletion planning, human/JSON results, and force/no-dirty-check behavior.
- [ ] 1.5 Route configured dirty resolution, confirmation, hook targets/context, branch actions, previews, and execution through the shared ordered plan; make the focused orchestration and dry-run tests pass.

## 2. Failure Safety TDD

- [ ] 2.1 Add failing tests that inject a nested child removal failure and prove its containing parent removal is not invoked, both repository/path failures are recorded, independent targets continue, post-remove finalization still runs with complete context, and the result is non-zero.
- [ ] 2.2 Implement dependency-aware failure blocking while continuing unrelated removals and preserving existing operation, branch-deletion, and post-remove finalization ledgers.
- [ ] 2.3 Add human and JSON failure-path assertions proving partial-success summaries and one standard error envelope preserve successful, failed, dependency-blocked, branch, and hook operation details without false complete-success wording or human stdout leakage.

## 3. Real-Git Acceptance

- [ ] 3.1 Add a real temporary configured workspace fixture with a parent linked worktree and nested child-repository linked worktrees, including a mixed-branch child.
- [ ] 3.2 Record RED from the current implementation by asserting branch- and exact-path-target descendant expansion, dry-run child-first order, and post-remove Git registrations rather than filesystem state alone.
- [ ] 3.3 Make the real configured removal pass and verify all target directories and paths disappear from every owning repository's `git worktree list --porcelain` with no operation-created output from `git worktree prune --dry-run --verbose`.
- [ ] 3.4 Run existing configured and standalone remove integration coverage, including keep flags, path mode, dirty checks, hooks, dry-run, and JSON output.

## 4. Validation and Delivery

- [ ] 4.1 Run the Arashi CLI focused tests, full test suite, format check, lint, typecheck, completion contract check, and build after the final source edit.
- [ ] 4.2 Update OpenSpec task evidence, validate the change, inspect the final diff, and commit the verified CLI implementation separately from the meta/OpenSpec closeout.
- [ ] 4.3 Open and cross-link the child implementation PR, verify exact-head CI and eligible review feedback, then merge the child before archiving this change.
- [ ] 4.4 Archive and sync the completed OpenSpec change, validate the synced specifications, update the meta PR to close issue #272, verify exact-head CI, and merge the meta PR last.
