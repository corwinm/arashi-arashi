## 1. Regression Coverage (RED)

- [ ] 1.1 Add a real temporary configured workspace fixture with a parent linked worktree and nested child-repository linked worktrees, including a mixed-branch child.
- [ ] 1.2 Record real-Git RED from the current implementation by asserting branch- and exact-path-target descendant expansion, dry-run child-first order, removed-path absence from every owning repository's `git worktree list --porcelain`, and no operation-created output from `git worktree prune --dry-run --verbose`.
- [ ] 1.3 Add focused failing tests for descendant target closure across exact-parent-path and mixed-branch parent selection, transitive nesting, normalized descendant-before-ancestor ordering, unrelated stable order, sibling-prefix paths, platform path semantics, and no closure under `--keep-worktrees`.
- [ ] 1.4 Add failing configured dry-run tests proving human and JSON operation arrays expose the complete expanded child-first plan and remain non-mutating, including mixed-branch descendant branch actions and `--keep-worktrees` preservation.
- [ ] 1.5 Add failing orchestration tests proving auto-included descendants participate in dirty resolution and confirmation before mutation, pre/post-remove hook target/context data, branch-deletion planning, human/JSON results, and force/no-dirty-check behavior.
- [ ] 1.6 Add failing dependency-safety tests that inject a nested child removal failure and prove its containing parent removal is not invoked, both repository/path failures are recorded, independent targets continue, post-remove finalization still runs with complete context, and the result is non-zero.
- [ ] 1.7 Add failing human and JSON partial-result assertions proving summaries and the standard error envelope preserve successful, failed, dependency-blocked, branch, and hook operation details without false complete-success wording or human stdout leakage.

## 2. Implementation (GREEN)

- [ ] 2.1 Implement the smallest typed configured worktree-plan helper that expands selected ancestors over the complete configured inventory and satisfies the closure and ordering tests without changing standalone behavior.
- [ ] 2.2 Route configured dirty resolution, confirmation, hook targets/context, branch actions, previews, and execution through the shared ordered plan; make the focused orchestration, dry-run, and real-Git success tests pass.
- [ ] 2.3 Implement dependency-aware failure blocking while continuing unrelated removals and preserving existing operation, branch-deletion, post-remove finalization, and human/JSON result ledgers; make all failure-path tests pass.

## 3. Regression and Acceptance Gates

- [ ] 3.1 Verify the real configured removal leaves all target directories and registrations absent from every owning repository and creates no prunable metadata.
- [ ] 3.2 Run existing configured and standalone remove integration coverage, including keep flags, path mode, dirty checks, hooks, dry-run, and JSON output.
- [ ] 3.3 Perform the regression-test sabotage run: temporarily restore parent-first/ancestor-destructive behavior, prove the new focused and real-Git tests fail for the intended reason, restore the fix, and prove they pass.

## 4. Validation and Delivery

- [ ] 4.1 Run the Arashi CLI focused tests, full test suite, format check, lint, typecheck, completion contract check, and build after the final source edit.
- [ ] 4.2 Update OpenSpec task evidence, validate the change, inspect the final diff, and commit the verified CLI implementation separately from the meta/OpenSpec closeout.
- [ ] 4.3 Open and cross-link the child implementation PR, verify exact-head CI and eligible review feedback, then merge the child before archiving this change.
- [ ] 4.4 Archive and sync the completed OpenSpec change, validate the synced specifications, update the meta PR to close issue #272, verify exact-head CI, and merge the meta PR last.
