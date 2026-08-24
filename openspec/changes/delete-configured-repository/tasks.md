## 1. Proposal gates

- [ ] 1.1 Validate proposal/design/delta specs/tasks with `openspec validate delete-configured-repository --strict`, run `git diff --check`, and record a complete hash manifest for every change artifact including `.openspec.yaml`.
- [ ] 1.2 Run an independent source-aware semantic review against the complete hash-locked artifact set; reconcile every topology, safety, output-schema, TDD-order, companion, and archive-acyclicity blocker, then repeat strict validation and the final hash gate.
- [ ] 1.3 Commit only the OpenSpec artifacts in the meta repository, push the coordinated branch, and open a proposal PR with `Tracks #318`, affected repository list, validation evidence, and no closing keyword.
- [ ] 1.4 Obtain explicit proposal approval before beginning production or companion-content implementation; refresh the coordinated worktree and fast-forward clean affected child branches to current `origin/main` as required.

## 2. CLI RED contract and command-boundary coverage

- [ ] 2.1 Add failing registration/help/contract tests for optional exact `delete [repository]`, omitted-target human-TTY checkbox multi-selection, `-f/--force`, `-n/--dry-run`, `-j/--json`, configured-only classification, explicit VS Code exclusion, and unchanged `remove` meaning; prove generated contract/completion freshness is RED before registration changes.
- [ ] 2.2 Add failing command-boundary tests for the normative parse → workspace/config → selection → structural/Git inspection → complete ordered plan set → Git-loss → dry-run → confirmation → concurrent/execution/partial precedence; cover explicit exact-key absence, config-invalid-first, TTY omitted-target key-only checkbox choices and bytewise order, one/multiple/empty/cancelled selection, omitted non-TTY/JSON selection-required even with force/dry-run, dirty selected refusal before prompt, clean combined TTY confirmation, decline/cancel exit 2, clean explicit-key non-TTY/JSON confirmation-required exit 2, force, and no pre-confirmation mutation.
- [ ] 2.3 Add spawned real-CLI JSON RED tests proving exactly one stdout document for omitted-target selection-required, explicit-key dry-run including blocked Git-loss plans, force success, planning errors, confirmation-required mutation, concurrent change, and partial failure; pin exact `data`/`error.details` locations, nullable fields, item/phase vocabularies, ordering, exit statuses, and zero human/hook-content leakage.
- [ ] 2.4 Add failing completion model/query tests for the optional positional slot and exact configured repository keys, parent/path/branch exclusion, aliases, linked/nested active-config authority, standalone empty results, and no Git/hook/remote/destructive-planner probes.
- [ ] 2.5 Add pre-implementation compatibility characterization for `aw add`, `aw clone`, `aw create`, `aw remove`, `aw prune`, `aw configure`, managed-ignore persistence/reconciliation, and unchanged command paths/options; pin the existing `.arashi-add.transaction.lock` on-disk identity so later shared-helper/lock/contract edits cannot split cooperating clients or silently regress behavior.

## 3. CLI RED planner safety matrix

- [ ] 3.1 Add failing pure/unit planner tests for exact closed success/error-details/plan/result/workspace/item/phase/retry records, deterministic SHA-256 plan ID, resume-receipt item, exact human/JSON retry argv, deterministic ordering, deepest-first worktrees, bytewise ref/hook/warning order, slash refs, and plan/result identity preservation.
- [ ] 3.2 Add real-Git RED fixtures for direct-main, linked-parent, nested-child invocation, multiple parent-linked child worktrees, NUL-delimited main/branch/detached/locked/prunable/malformed/duplicate records, present and exact-absent stale registrations, configured bare parent, exact external configured authority, custom roots, Git URL rewrite/SCP/SSH/local normalization, multiple fetch/push URLs, and common-directory identity rather than path shape.
- [ ] 3.3 Add fail-closed RED fixtures for missing/corrupt/mismatched/ambiguous Git identity, selected child aliasing parent/meta, unconfigured external paths versus exact accepted external projections, symlink/junction target/ancestor traversal, permission/canonicalization errors, exact-`ENOENT`, phase-boundary target/ancestor swaps, same-parent quarantine identity mismatch/restoration, and unsupported no-follow primitives; prove force cannot bypass.
- [ ] 3.4 Add hook-scope RED fixtures for exact active native candidates and finite concrete `active-path + .example` templates for `pre-create.<repository>`/`post-create.<repository>` on POSIX and Windows; prove literal generic `<repo>`/`REPO` init templates, shared hooks, and user-global hooks are preserved; also cover child-local ownership through clone deletion, inline-config removal through the config entry, user-global path guidance, unexpected kinds/parent links, active-candidate and inline/file ambiguity, and no content reads/output.
- [ ] 3.5 Add config-scope RED fixtures proving the complete selected entry is removed while unrelated repos/meta/defaults/groups/shared hooks and managed-ignore files/preferences remain byte-identical, including deletion of the last configured child.
- [ ] 3.6 Add Git-loss RED fixtures for tracked, staged, untracked, conflicted, ignored worktree state; local-only/ahead heads; lightweight/annotated tags with adjacent exact tag-object and `^{}` peeled-commit records; stash; detached checked-out commits; explicit reflog-only warning/non-claim; malformed/unreadable reachability evidence; multiple remotes and locally remote-reachable safe refs; no fetch/push; and force disclosure without structural bypass.
- [ ] 3.7 Add mutation-free multi-target planner RED fixtures proving key deduplication/bytewise order, empty configured-key behavior, all-selected preflight before confirmation, combined blocker disclosure, exact predicted before/after config-byte chaining, no cross-repository item mixing, and complete plan-set invalidation when any selected identity changes.

## 4. CLI RED execution, race, and retry matrix

- [ ] 4.1 Add failing executor tests proving read-only planning/dry-run/refusal creates no lock/receipt, accepted execution acquires the unchanged common-directory lock only after confirmation/force, revalidates before owner-only (`0600`/Windows-equivalent) expected-byte receipt creation, refreshes each phase, and preserves newer config/receipt bytes on concurrency.
- [ ] 4.2 Add failing deterministic execution tests for provenance receipt, deepest-first Git worktree removal, owned stale metadata, identity-verified quarantine/removal of clone/hooks, config-last finalization, final verification/receipt deletion, and zero remote/ignore/unrelated mutation.
- [ ] 4.3 Add one injected failure RED fixture for provenance create/update/delete and every destructive phase/boundary; assert exact item/phase states, specific error before irreversible mutation versus partial failure after it, receipt-current safe retry versus persistence-unsafe manual review, and no false rollback.
- [ ] 4.4 Add failing receipt-backed retry fixtures for every completed prefix, config-still-present continuation, receipt-proven config-removed idempotent completion, exact human/JSON argv, missing/multiple/malformed/permission-unsafe/stale receipts, contradictory survivors, and refusal to broaden unrelated absence/identity.
- [ ] 4.5 Add post-confirmation race RED fixtures for config/receipt bytes, worktree registrations/paths, refs/OIDs, canonical identity, hook candidates, target/ancestor swaps, and quarantined identity changing before each destructive phase; prove mutation stops at the first stale identity and replacements are never recursively removed.
- [ ] 4.6 Wire native Linux/macOS and Windows real-Git acceptance for path canonicalization, ignored/conflicted state, linked topology, exact JSON stdout, non-TTY refusal, force success, phase failure/retry, and cleanup of all fixture state.
- [ ] 4.7 Add failing multi-repository executor tests proving one shared lock and one confirmation, bytewise per-repository execution, predicted config-byte handoff with external-change refusal, config-last within each repository, stop-on-first-failure, earlier-completed/failing/later-not-started ledgers, distinct receipts, and one exact retry argv/manual-review result per incomplete repository.

## 5. Companion and coordinated semantic RED gates

- [ ] 5.1 In CLI docs/contract tests, add failing dedicated-command-page/index/README/help policy checks before editing maintained CLI prose or generated artifacts.
- [ ] 5.2 In arashi-docs, add and register a focused failing semantic checker plus controlled fixtures for delete/remove distinction, explicit exact key and omitted-target TTY multi-selection, dry-run/force confirmation, non-overridable safety, deleted/preserved scope, JSON locations/secrecy, partial failure/retry, navigation, and generated-export freshness before editing canonical pages.
- [ ] 5.3 In arashi-skills, add and register a focused failing guidance checker for authored and extracted-package roots plus controlled fixtures for explicit destructive intent, exact-key automation, interactive multi-selection, installed-help discovery, preview-before-force, remove distinction, safety/preservation/secrecy, and partial-failure behavior before editing installed guidance.
- [ ] 5.4 In the meta repository, add failing normalized contract tests/checker expectations for CLI delete policy, dedicated docs/export coverage, packaged-skill coverage, explicit VS Code exclusion, stable aggregate registration, and deliberate cross-repository mismatch propagation before implementing the coordinated checker changes.

## 6. CLI planner and output GREEN

- [ ] 6.1 Implement closed delete plan/result/error/phase models and deterministic public projections/order without adding open-ended output fields or reading secret hook/config content.
- [ ] 6.2 Implement mutation-free active configuration snapshot, optional-target TTY checkbox selection, omitted noninteractive/JSON refusal, exact-key resolution, and complete bytewise-ordered plan-set construction using configured roots; after accepted confirmation/force, acquire the workspace transaction lock and revalidate before mutation, generalizing shared symbols only while preserving the existing `.arashi-add.transaction.lock` path and proving add/configure behavior remains unchanged.
- [ ] 6.3 Implement Git-common-directory plus normalized configured-fetch-URL identity and strict NUL-delimited worktree/ref inventory for direct, linked, nested, external/custom, and configured-bare topologies.
- [ ] 6.4 Implement fail-closed physical containment/symlink/identity checks, same-parent quarantine with moved-identity verification, Git-owned worktree removal, and exact hook candidate/template discovery plus preserved-global guidance.
- [ ] 6.5 Implement complete dirty/ignored/conflict and local-ref/reachability data-loss analysis using local evidence only, with force overriding only confirmation/Git-loss classification.
- [ ] 6.6 Implement combined human plan-set and explicit-key JSON renderers from the same per-repository immutable plans, exact confirmation/exit behavior, one-document stdout isolation, stable error vocabulary, and secrecy redaction at the raw renderer/error boundary.
- [ ] 6.7 Run the focused planner, topology, Git-loss, hook, command-boundary, spawned-JSON, and completion tests GREEN; deliberately sabotage one structural guard, one Git-loss guard, and JSON stdout isolation to prove each regression returns RED, then restore and rerun GREEN.

## 7. CLI executor and command GREEN

- [ ] 7.1 Implement phase-local accepted-plan revalidation and deterministic deepest-first worktree plus owned-metadata execution.
- [ ] 7.2 Implement canonical clone, exact planned workspace-hook, config-last, and final-observation phases with complete item/phase ledger updates.
- [ ] 7.3 Implement bytewise per-repository batch execution under one lock, stop-on-first-failure ledgering, owner-only (`0600`/Windows-equivalent) expected-byte durable receipts, exact phase-prefix updates/cleanup, state-aware error precedence, receipt-proven retry/idempotency, exact argv, and manual-review fallback without broad absence acceptance.
- [ ] 7.4 Register optional-argument `delete` in `src/cli-program.ts`, wire the existing prompt abstraction's checkbox multi-select, typed command policy, generated CLI command contract, and completion candidate mapping while preserving executable-distribution identity and remove/add/configure behavior; do not add delete to the executable-distribution artifact.
- [ ] 7.5 Regenerate CLI command/completion artifacts twice and prove byte stability; update the dedicated CLI delete command-list page, README/config/hook references, and source semantic records only after their RED gates exist.
- [ ] 7.6 Run focused tests, command-contract/completion freshness, CLI semantic aggregates, typecheck, lint, build, package/executable acceptance, and the complete CLI test suite after the final CLI edit.
- [ ] 7.7 Stage only owned CLI files; perform the precommit destructive-orchestration lifecycle/inventory/race self-review against the approved spec, run `git diff --cached --check`, reconcile blockers and rerun affected gates, then commit the exact reviewed CLI snapshot.

## 8. Docs and skills GREEN

- [ ] 8.1 Add one dedicated website delete command page plus proportionate configured-workspace/configuration/hook/index/navigation cross-links; document explicit-key and interactive multi-target selection, combined confirmation, JSON's explicit-key requirement, scope, preservation, and per-repository retry without mirroring internal lock/ledger implementation.
- [ ] 8.2 Regenerate website Markdown/LLM exports from canonical sources; run the focused checker, deliberate mismatch fixtures, export freshness, stable semantic aggregate, format/lint/type/build/render validation, and inspect the rendered command/workflow pages.
- [ ] 8.3 Update the smallest installed configured-workspace Arashi skill reference with help-first, explicit-intent, dry-run, force, safety, preservation, secrecy, and partial-failure guidance while keeping `SKILL.md` minimal unless routing itself changes.
- [ ] 8.4 Run the focused skill checker, deliberate mismatch fixtures, source aggregate, canonical release-archive membership/extraction, extracted-package aggregate, package byte comparison, format/tests, and confirm maintainer-only checker/contract files are excluded.
- [ ] 8.5 Independently review and commit each clean docs and skills repository snapshot separately after its final validation; leave untouched VS Code/presentation branches unpushed.

## 9. Coordinated validation and child PR delivery

- [ ] 9.1 Implement the normalized meta delete contract checker/registry changes and controlled mismatch fixtures; run focused meta tests, `contracts:check`, meta test/typecheck/format gates, and strict OpenSpec validation against the coordinated child revisions.
- [ ] 9.2 Run one bounded repository-aware compliance review of the complete cumulative CLI, docs, skills, and meta/OpenSpec diffs; convert every verified approved-contract blocker into a focused RED before correction and rerun only affected gates plus the final required full gates.
- [ ] 9.3 Push clean CLI, docs, and skills child branches and open one PR per affected repository with `Tracks corwinm/arashi-arashi#318`, complete related-PR links, problem/approach/tests/risk/exclusions, and no issue-closing keyword.
- [ ] 9.4 Read back each child PR's exact head/base/title/files/body, verify local HEAD equals `headRefOid`, and record live CI state plus all eligible top-level/inline/review-thread feedback without claiming green before exact-head evidence.
- [ ] 9.5 Commit/push the updated meta proposal/apply artifacts and coordinated checker on the existing proposal PR, cross-link the complete child PR set, retain `Tracks #318`, and verify exact head/files/checks.

## 10. Pre-archive closeout gates

- [ ] 10.1 Reconcile and check every implementation/companion/validation task whose evidence now exists; compare `openspec list --json` counts with `tasks.md`, leaving merge/archive tasks unchecked until performed.
- [ ] 10.2 Require exact-head local/full CI success and zero unresolved eligible review threads for every child PR; independently verify all actionable feedback and obtain Corwin's explicit merge approval.
- [ ] 10.3 Squash-merge verified CLI, docs, and skills PRs child-first, delete remote feature branches, verify returned merge SHAs/branch deletion, and confirm reviewed surfaces exist on each child `main`.
- [ ] 10.4 On the meta branch, update child revisions/evidence to merged child `main`, rerun the exact coordinated contracts and meta gates, and reconcile all pre-archive evidence/checklist claims truthfully.

## 11. Archive and final meta delivery

- [ ] 11.1 Verify every pre-archive task is complete, run `openspec archive delete-configured-repository --yes`, inspect archive/synced canonical spec output, replace placeholder purpose text if generated, format touched specs, and validate each synced capability directly.
- [ ] 11.2 Reconcile the archived task/evidence files, confirm `openspec list --json` no longer lists this change, run meta tests/typecheck/format/contracts plus `git diff --check`, commit/push the archive, and update the meta PR to the sole `Closes #318` owner with archive/spec paths and merged child links.
- [ ] 11.3 Verify the meta PR exact head is open, non-draft, mergeable, green, zero-thread, includes archive and every synced spec path, and passes the executable final preflight against merged child SHAs; then obtain/confirm Corwin's merge approval and squash-merge the meta PR last.
- [ ] 11.4 Verify the meta merge SHA, originating issue closed state, and remote feature-branch deletion; add a concise issue comment linking the merged child/meta PRs only if closing linkage did not already provide complete traceability.
- [ ] 11.5 From the clean base workspace run `aw pull`, verify every affected repository `main` equals `origin/main`, remove the coordinated worktree with `aw remove issue-318-delete-repository --force`, check all affected remote branches are absent, and finish with clean `aw list` plus `aw status --verbose`.
