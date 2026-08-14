## 1. Regression Coverage (RED)

- [x] 1.1 Add a real temporary configured workspace fixture with a parent linked worktree and nested child-repository linked worktrees, including a mixed-branch child.
- [x] 1.2 Record real-Git RED from the current implementation by asserting branch- and exact-path-target descendant expansion, dry-run child-first order, removed-path absence from every owning repository's `git worktree list --porcelain`, and no operation-created output from `git worktree prune --dry-run --verbose`.
- [x] 1.3 Add focused failing tests for descendant target closure across exact-parent-path and mixed-branch parent selection, transitive nesting, normalized descendant-before-ancestor ordering, unrelated stable order, sibling-prefix paths, platform path semantics, and no closure under `--keep-worktrees`.
- [x] 1.4 Add failing configured dry-run tests proving human and JSON operation arrays expose the complete expanded child-first plan and remain non-mutating, including mixed-branch descendant branch actions and `--keep-worktrees` preservation.
- [x] 1.5 Add failing orchestration tests proving auto-included descendants participate in dirty resolution and confirmation before mutation, pre/post-remove hook target/context data, branch-deletion planning, human/JSON results, and force/no-dirty-check behavior.
- [x] 1.6 Add failing dependency-safety tests that inject a nested child removal failure and prove its containing parent removal is not invoked, both repository/path failures are recorded, independent targets continue, post-remove finalization still runs with complete context, and the result is non-zero.
- [x] 1.7 Add failing human and JSON partial-result assertions proving summaries and the standard error envelope preserve successful, failed, dependency-blocked, branch, and hook operation details without false complete-success wording or human stdout leakage.

## 2. Implementation (GREEN)

- [x] 2.1 Implement the smallest typed configured worktree-plan helper that expands selected ancestors over the complete configured inventory and satisfies the closure and ordering tests without changing standalone behavior.
- [x] 2.2 Route configured dirty resolution, confirmation, hook targets/context, branch actions, previews, and execution through the shared ordered plan; make the focused orchestration, dry-run, and real-Git success tests pass.
- [x] 2.3 Implement dependency-aware failure blocking while continuing unrelated removals and preserving existing operation, branch-deletion, post-remove finalization, and human/JSON result ledgers; make all failure-path tests pass.

## 3. Regression and Acceptance Gates

- [x] 3.1 Verify the real configured removal leaves all target directories and registrations absent from every owning repository and creates no prunable metadata.
- [x] 3.2 Run existing configured and standalone remove integration coverage, including keep flags, path mode, dirty checks, hooks, dry-run, and JSON output.
- [x] 3.3 Perform the regression-test sabotage run: temporarily restore parent-first/ancestor-destructive behavior, prove the new focused and real-Git tests fail for the intended reason, restore the fix, and prove they pass.

## 4. Validation and Delivery

- [x] 4.1 Run the Arashi CLI focused tests, full test suite, format check, lint, typecheck, completion contract check, and build after the final source edit.
- [x] 4.2 Update OpenSpec task evidence, validate the change, inspect the final diff, and commit the verified CLI implementation separately from the meta/OpenSpec closeout.
- [ ] 4.3 Open and cross-link the child implementation PR, verify exact-head CI and eligible review feedback, then merge the child before archiving this change.
- [ ] 4.4 Archive and sync the completed OpenSpec change, validate the synced specifications, update the meta PR to close issue #272, verify exact-head CI, and merge the meta PR last.

## Evidence

- RED: parent-first ordering sabotage failed the focused child-first planner and real-Git dry-run assertions; disabling strict configured inventory allowed the parent to be removed when a child repository could not be inspected and failed the fail-closed regression.
- GREEN: focused remove suite passed 28 tests, including real spawned-CLI single-document JSON coverage for dirty descendants, dependency-blocked partial failure, conventional and arbitrary registered post-hook plan invalidation, prunable descendants, fail-closed filesystem inspection, and canonical symlink-cycle identities.
- Final CLI validation after the last source edit: 129 test files passed, 1 skipped; 1,732 tests passed, 6 skipped; format, lint (0 errors), typecheck, completion check, build, and `git diff --check` passed.
- Native Windows CI initially exposed four test-only Git-path separator assertions; the assertions were normalized, and the 12-test coordinated-remove file then passed natively on exact commit `b9a62fa`.
- Eligible Codex feedback was independently reproduced: strict inventory incorrectly rejected intentionally absent configured repositories, and automatic descendant deletion was undocumented. Commit `15baed6` introduced the missing-repository distinction and documentation; follow-up regression review found that an absent source can still own a direct or transitive nested registered worktree and that hooks can invalidate the frozen plan. Commit `6d1f69f` recursively verifies missing-owner safety, revalidates the physical hierarchy after pre-remove hooks, and stops worktree and branch mutation when an unplanned descendant appears.
- Later eligible Codex feedback identified prunable physical descendants and `existsSync` collapsing permission errors into absence. Current-head regressions prove prunable descendants block ancestor mutation and only `ENOENT` is accepted as absence; commit `a6c940f` preserves all other filesystem inspection errors and fails closed.
- A final eligible Codex finding reproduced that conventional path synthesis missed a hook-created registered worktree at an arbitrary nested path. Commit `e5fedec` reruns strict complete repository inventory after hooks and blocks mutation for any newly registered descendant beneath a planned ancestor, regardless of location.
- Exact-head Codex review then identified that unresolved symlink/junction spellings could revisit the same physical directory forever. Commit `9326e60` uses canonical filesystem identities in both hierarchy visited sets; deterministic injected-identity and real POSIX symlink-cycle regressions cover the fix.
- The same exact-head review showed that an absent configured repository can conceal a registered descendant at an arbitrary path, which cannot be ruled out from the remaining repositories. Commit `01e73e7` therefore removes the coordinated-removal missing-repository allowlist and fails closed whenever any configured repository is absent or uninspectable; the real-Git RED/GREEN regression moves a registered descendant outside the conventional layout before hiding its owner.
- Exact-head review also found that a physically present but prunable configured descendant was discovered only after the dry-run return, producing an actionable preview that real execution would block. Commit `893e910` runs the physical descendant safety check against the authoritative plan before dirty checks, prompts, hooks, dry-run output, or mutation; a real-Git dry-run regression established RED and now rejects the unsafe plan while preserving every path and registration.
- Review reconciliation: owner-scoped descendant branch deletion, fail-closed complete inventory, stable unrelated target ordering, ancestor-attributed human failures, preserved error causes, and real CLI JSON coverage were added in response to independently reproduced findings.
- Initial independent review passed the original exact staged child diff. Subsequent targeted reviews of the missing-repository follow-up exposed direct, transitive, and post-hook stale-plan safety gaps; all are covered by the final regressions. A required latest-head review and exact-head replacement CI remain delivery gates.