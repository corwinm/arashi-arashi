## 1. Init Resolution and Default Tests

- [ ] 1.1 Add reusable committed and unborn bare-repository init fixtures and record RED tests for omitted `worktreesDir: ".."` before production changes.
- [ ] 1.2 Add RED integration coverage for bare-root and nested bare invocation, canonical `workspaceRoot`, non-bare omission, and normalized explicit overrides in both repository types.
- [ ] 1.3 Add preservation tests for current-directory and child-directory non-bare bootstrap in apply and dry-run modes, proving dry-run does not probe or create a repository.
- [ ] 1.4 Add existing-config, preference-only, `--force` omitted/default recalculation, forced explicit override, and existing-repository classification/canonicalization failure tests before implementation.
- [ ] 1.5 Add a RED real nested bare init-to-create integration test for committed branch `feature/example`, proving the current implementation does not yet use canonical parent-based branch-only placement and that no worktree may be created beneath bare Git storage.

## 2. Managed-Ignore and Rollback Tests

- [ ] 2.1 Add RED managed-path tests defining bare `..` as external/unsafe and bare-root administrative subdirectories as non-applicable to worktree ignore rules.
- [ ] 2.2 Add real bare init tests for local, tracked, and none scopes across existing-linked-worktree, committed-without-linked-worktree, and unborn topologies; prove no `git check-ignore`, ignore-file write, or temporary worktree is required.
- [ ] 2.3 Add human and JSON dry-run tests proving identical bare classifications and no config, directory, ignore, preference, hook, repository, linked-worktree, or temporary-worktree mutation.
- [ ] 2.4 Add rollback RED tests proving parent existence and bare non-applicable paths do not retain unrelated changes, full applicable cleanup restores prior state, surviving applicable safe `reposDir` state retains coverage, the parent is never mutated, and restoration failures remain structured.

## 3. CLI Implementation

- [ ] 3.1 Enrich init root resolution with repository type; classify existing repositories through Git, canonicalize bare roots with the absolute Git directory, and carry deterministic non-bare type through apply/dry-run bootstrap.
- [ ] 3.2 Select one normalized init-only default after existing-config authority is resolved, without changing shared `DEFAULT_WORKTREES_DIR` or legacy config-load fallbacks.
- [ ] 3.3 Implement deterministic bare non-worktree managed-path reporting for unsafe and non-applicable paths while preserving local/tracked/none scope and clone-local preference semantics without ignore-file inspection or writes.
- [ ] 3.4 Thread normalized `worktreesDir` through standard and preference-only `InitResult`, human preview/success, JSON data, config persistence, and rollback guards.
- [ ] 3.5 Replace raw resolved-path rollback retention with applicable-safe surviving-state checks and preserve established incomplete-restoration reporting.

## 4. Help, Contracts, and Required Documentation

- [ ] 4.1 Add source help/contract RED assertions for the repository-aware omitted default, update init help, then regenerate and verify `repos/arashi/contracts/cli-commands.json`.
- [ ] 4.2 Add CLI documentation assertions first, then update `repos/arashi/docs/commands/init.md` and relevant CLI configuration guidance.
- [ ] 4.3 Add docs semantic/content RED assertions, then update `repos/arashi-docs/docs/commands/init.md` and `repos/arashi-docs/docs/getting-started/index.md`; regenerate and verify agent-readable exports.
- [ ] 4.4 Add packaged-guidance RED assertions, then update `repos/arashi-skills/skills/arashi/references/tutorial.md`, `commands.md`, and `workflows.md`; verify both source and extracted package artifacts.
- [ ] 4.5 Update meta cross-repository contract expectations only if authoritative fields require it, beginning with a deliberate failing drift fixture and verifying the source plus packaged/generated artifacts.

## 5. Verification and Delivery

- [ ] 5.1 Run focused init resolution/default, managed-path, rollback, bare-create, JSON-output, CLI-help, generated-contract, docs, export, skills package-boundary, and cross-repository semantic checks after final source edits.
- [ ] 5.2 Run complete required format, lint, typecheck where available, test, and build gates in every changed child repository; verify dependency installation and unchanged unrelated lockfiles before treating output as feature evidence.
- [ ] 5.3 Run `openspec validate default-bare-init-worktree-location --strict`, `git diff --check`, and an independent read-only semantic review against every issue criterion and current source; reconcile blocking findings and rerun affected gates.
- [ ] 5.4 Commit and open separate child PRs for each changed repository with non-closing issue references, cross-link the complete PR set, and require the full supported cross-platform CI matrix plus zero unresolved review threads before readiness.
- [ ] 5.5 After child PRs merge, complete task evidence, archive and validate the change, update the meta PR as the sole issue-closing PR, merge it last, verify issue closure/post-merge CI, then remove the coordinated worktree and confirm clean synchronized status.
