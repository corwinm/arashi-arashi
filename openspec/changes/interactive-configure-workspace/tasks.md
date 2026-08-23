## 1. Reconfirm scope and establish baselines

- [x] 1.1 Re-read issue #316, this proposal/design/spec set, #274 shared editor and transaction boundaries, current config/default resolution helpers, command contracts, all affected `AGENTS.md` files, and maintained docs/skills/meta registries.
- [x] 1.2 Map every acceptance criterion to an owning repository, focused RED test, GREEN implementation task, sanitized-output assertion, and final aggregate in an implementation evidence ledger.
- [x] 1.3 Capture clean focused and full baselines for CLI editor/config/prompt/contract/PTY tests, docs validation, skills source/package checks, and meta OpenSpec/contracts gates; record unrelated failures separately.
- [x] 1.4 Inventory all maintained configure/configuration command, README, website, generated export, authored skill, extracted package, completion, and semantic-checker surfaces.

## 2. Establish CLI RED behavior

- [x] 2.1 Add pure RED tests for the exact scope/descriptor set, canonical paths, safe display policy, generic-schema exclusion, immutable candidates, and repository identity preservation.
- [x] 2.2 Add pure RED tests for configured/unset state and built-in/inherited effective resolution using the owning runtime constants and precedence helpers.
- [x] 2.3 Add pure RED tests for explicit keep/edit/clear actions, required-field clear rejection, active-file keep/skip without deletion, empty-container pruning, unchanged-candidate no-op behavior, and unrelated compatible-field preservation.
- [x] 2.4 Add repository-editor RED tests proving configure reuses copy/symlink/hooks adapters, keeps add's descriptor subset unchanged, adds groups/base policy explicitly, and preserves retry/skip behavior.
- [x] 2.5 Add workspace-hook RED tests for inline shorthand/maps, visible plaintext entry policy, exact active paths, safe no-op plans, source exclusivity, and metadata-only diagnostics.
- [x] 2.6 Add controller RED tests for every scope, repository selection, setting/action selection, validation retry, skip/keep-existing, complete serialized preview, separate active-file list, final decline, and Ctrl+C.
- [x] 2.7 Add transaction RED tests for no prompt-time writes, at most one expected-byte save, no-replace active files, install/save rollback, concurrent-byte preservation, and retained referenced materialization.
- [x] 2.8 Add command RED tests for registration/help, configured-workspace and invalid-config rejection, TTY requirements, single-envelope sanitized `--json` inspection, stdout isolation, and absence of non-interactive mutation flags.
- [x] 2.9 Add real raw-byte PTY RED journeys covering every supported scope, configured/unset/effective display, keep/edit/clear, visible inline input, exact preview, active files, retry/skip, decline, cancellation, and concurrency.
- [x] 2.10 Add CLI contract/completion RED coverage for normalized configure semantics and prove focused tests fail only for missing behavior.

## 3. Implement the configure editor and transaction GREEN

- [x] 3.1 Generalize the descriptor/editor types around explicit canonical getters, immutable set/clear adapters, safe projections, validation attribution, and effective resolvers while preserving `REPOSITORY_ONBOARDING_DESCRIPTORS`.
- [x] 3.2 Implement workspace, workspace-hook, command-default, editor-default, meta-policy, and repository configure descriptor registries with the exact approved field set.
- [x] 3.3 Reuse or export canonical runtime default/inheritance resolvers and implement separate configured/effective inspection records without implicit persistence.
- [x] 3.4 Implement keep/edit/clear candidate mutations, required clear restrictions, canonical container pruning, and complete-config normalization/field attribution.
- [x] 3.5 Extend the repository editor for existing groups/base policy and consume existing copy/symlink/hook/suggestion/path-observer/script-planner behavior without configure-local duplication.
- [x] 3.6 Implement workspace inline/active-file lifecycle adapters using canonical runtime paths, sole-Bash shorthand, map normalization, fixed safe no-op scaffolds, and retry/skip/keep-existing behavior.
- [x] 3.7 Implement the injectable configure prompt controller with sanitized ordinary views, visible plaintext inline input, retained valid sections, and controlled cancellation.
- [x] 3.8 Implement complete-candidate normalization, exact serialized JSON confirmation, and separate immutable active-file preview with no generated contents.
- [x] 3.9 Implement configure-owned expected-byte locking, revalidation, no-replace file installation, at-most-one config save, and ownership-checked rollback by reusing canonical boundaries.
- [x] 3.10 Register `aw configure`, implement non-TTY rejection and stable sanitized non-mutating `--json` inspection, and keep broad mutation flags absent.
- [x] 3.11 Make focused pure/controller/transaction/command/PTY tests GREEN, run sabotage tests against missing/old behavior, and rerun all add onboarding regressions.

## 4. Update CLI contracts and generated artifacts

- [x] 4.1 Add typed configure semantic policy to the canonical command contract with required docs/skills classifications and reasoned VS Code representation or exclusion.
- [x] 4.2 Update concise CLI README/configuration guidance and help without duplicating internal transaction or race prose.
- [x] 4.3 Regenerate command contracts, completion artifacts, and any affected schema output; verify deterministic second-generation cleanliness.
- [x] 4.4 Run CLI format, lint, typecheck, focused and full tests, contract/schema/completion freshness, build, package, and applicable native-platform gates.

## 5. Deliver docs and generated exports

- [x] 5.1 Add and register docs semantic RED fixtures for configure scopes, state/action/preview/invocation/secrecy semantics and prove stable aggregate reachability.
- [x] 5.2 Update one canonical command/configuration owner plus proportional discovery links, retaining direct JSON guidance for unsupported fields.
- [x] 5.3 Regenerate Markdown routes, `/llms.txt`, and `/llms-full.txt`; make focused/aggregate checks GREEN and verify deterministic regeneration.
- [x] 5.4 Run the docs repository's complete canonical validation and inspect generated outputs for inline-body leakage or implicit-mutation claims.

## 6. Deliver authored and packaged skill guidance

- [x] 6.1 Add and register source and extracted-package skill semantic RED fixtures and prove both stable aggregates reach the checker.
- [x] 6.2 Update the smallest workspace command reference to route supported inspection/editing through `aw configure` while keeping `SKILL.md` minimal.
- [x] 6.3 Build and verify the canonical skill archive, extract it to the maintained package-check path, and make source/package configure checks GREEN.
- [x] 6.4 Run registration, formatting, source aggregate, archive determinism/membership, extracted-package aggregate, security, and publication-boundary gates.

## 7. Deliver coordinated validation and review

- [x] 7.1 Add out-of-repository coordinated configure semantic fixtures/checker coverage and register it in canonical bytewise order without a feature-specific workflow stage.
- [x] 7.2 Recreate docs exports and extracted skill package in required order, then run meta unit/type/format/contracts gates and strict OpenSpec validation.
- [x] 7.3 Reconcile durable #274 future-scope requirements so archived docs, skill, and shared-editor specs describe shipped configure behavior without weakening add's boundary.
- [x] 7.4 Self-review each repository's complete base-to-head diff for scope, canonical reuse, inline-body boundaries, transaction ownership, generated artifacts, and drive-by changes.
- [ ] 7.5 Run independent repository-aware spec-compliance review before code/content-quality review on each exact clean child/meta head; batch supported findings and allow one exact-head confirmation cycle.

## 8. Open and validate coordinated PRs

- [x] 8.1 Commit and push CLI changes, open the child PR with a non-closing issue reference, and verify exact head/base/files, CI, and eligible review threads.
- [x] 8.2 Commit and push docs changes, open the cross-linked child PR, and verify exact head/base/files, generation/deploy/semantic CI, and eligible review threads.
- [x] 8.3 Commit and push skills changes, open the cross-linked child PR, and verify exact head/base/files, source/archive/package/security CI, and eligible review threads.
- [ ] 8.4 Mark only evidenced OpenSpec tasks complete, commit/push the meta change, open the cross-linked non-closing proposal PR, and verify strict/meta/coordinated exact-head CI.
- [ ] 8.5 Report live current-head CI and remaining blockers without merging, auto-merging, archiving, or force-pushing unless separately authorized.

## 9. Merge and archive closeout

- [ ] 9.1 After explicit merge authorization, apply exact-head last-mile gates and merge verified child PRs one at a time before the meta PR.
- [ ] 9.2 Reconcile final child main revisions and implementation evidence on the open meta branch, then archive the completed OpenSpec change and validate synced durable specs.
- [ ] 9.3 Push archive output, change the meta PR to the sole closing reference, pass fresh exact-head meta CI/review gates, and merge meta last.
- [ ] 9.4 Verify issue closure, synchronize all primary checkouts, remove coordinated worktrees/branches through `aw remove`, and prove clean local/remote final state.
