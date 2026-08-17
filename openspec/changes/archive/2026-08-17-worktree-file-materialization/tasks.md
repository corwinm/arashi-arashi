## 1. Proposal approval and implementation baseline

- [x] 1.1 Obtain approval for the proposal, design, capability deltas, and constrained configured-only API before production implementation
- [x] 1.2 Refresh the coordinated worktree and affected child repositories from current `main`, then record exact starting revisions and a clean status
- [x] 1.3 Map every acceptance criterion to a strict RED command and native/CI reachability entry in an implementation evidence ledger

## 2. CLI configuration and shared resolver RED

- [x] 2.1 Add focused failing configuration tests for direct `copy`/`symlink` types, normalization, persistence, unknown/invalid values, portable unsafe paths, duplicates, and cross-array collisions
- [x] 2.2 Add failing schema generation/freshness and compile-time contract tests for the optional repository fields without changing the checked-in schema first
- [x] 2.3 Add failing repository-projection tests proving Git-primary canonical source checkout, configuration root, and active execution/worktree paths remain distinct for linked parents, nested/absolute child paths, bare-parent layouts, and missing child primary checkouts
- [x] 2.4 Add failing shared resolver/planner tests for missing sources, operational inspection errors, immutable target-tree tracked destination/ancestor conflicts, filesystem destination conflicts, symlink/junction ancestors, source-link containment/cycles, Windows aliases/case collisions, declaration order, and non-mutating dry-run plans
- [x] 2.5 Add failing real filesystem and built-CLI native acceptance for macOS/Linux/Windows, wire the suite into all three CI paths before GREEN, and prove the unchanged runtime fails for the intended missing materialization behavior
- [x] 2.6 Add failing command-layer precedence tests proving a materialization blocker occurs before managed-ignore reconciliation and leaves ignore files/preferences unchanged
- [x] 2.7 Run the complete focused and native-reachability RED suite and record expected missing-contract failures rather than setup, import, fixture, or generated-artifact errors

## 3. CLI configuration and resolver GREEN

- [x] 3.1 Implement typed `RepoConfig` fields, strict platform-neutral/Windows-alias normalization, persistence, and configured repository policy plus Git-primary source projection
- [x] 3.2 Regenerate the canonical JSON Schema and prove schema freshness, normalized configuration, and existing-config compatibility
- [x] 3.3 Implement the shared typed path resolver and exact ordered dry-run/executed outcome schemas with bounded diagnostics, source-cycle detection, and explicit absence-versus-operational-error handling
- [x] 3.4 Run focused configuration/schema/projection/resolver tests GREEN, then sabotage the new guards to prove the regressions bite

## 4. Native materializer and rollback RED/GREEN

- [x] 4.1 Add failing real-filesystem tests for exclusive file/directory copies, deterministic recursive order, spaces/metacharacters, nested parents, contained source-link dereference, broken/escaping source links, self/ancestor/multi-link cycles, repeated non-ancestor targets copied independently, and no content leakage
- [x] 4.2 Add failing native link tests for exact absolute targets, file/directory kinds, no junction/copy/hard-link fallback, unavailable capability, and source disappearance
- [x] 4.3 Add failing ownership-ledger tests for partial recursive failures, reverse cleanup before whole-worktree rollback, link-object cleanup, empty invocation-created parent cleanup, preservation of pre-existing objects, and rollback-error reporting
- [x] 4.4 Implement the native ledgered materializer with no shell composition, exclusive no-overwrite operations, per-object partial-materialization ownership, contained source dereference/cycle detection, and link-safe reverse cleanup before existing whole-worktree rollback
- [x] 4.5 Run focused materializer/rollback tests GREEN and sabotage no-overwrite, containment, and link-safe cleanup individually to prove coverage

## 5. Configured create integration RED/GREEN

- [x] 5.1 Add failing real configured create tests for command-layer fail-before-managed-ignore/workspace-hook preflight, Git → repository pre-create → copy → symlink → repository post-create ordering, copy-before-symlink declaration order, and `--no-hooks` independence
- [x] 5.2 Add failing create tests for refreshed post-hook inspection, missing-source skips, existing destinations, multi-repository partial failure, later post-create failure, ordinary removal source-target safety, and complete rollback outcomes
- [x] 5.3 Add failing human/dry-run/JSON process tests for exact outcome field paths/status/reason enums, actionable success versus blocked nonzero dry-run envelopes, planned-versus-executed separation, materialization-specific versus command-wide rollback details, partial error details, exactly one JSON stdout document, and no file-content/hash/environment leakage
- [x] 5.4 Wire materialization into configured create after repository pre-create and before post-create, preserving standalone and file/inline-hook behavior
- [x] 5.5 Project the shared ledger into dry-run, human, JSON success/failure, partial-result, rollback, and summary surfaces
- [x] 5.6 Run focused create lifecycle, dry-run, JSON, rollback, removal, and existing hook compatibility suites GREEN, then prove the lifecycle-order and `--no-hooks` regressions fail against sabotaged behavior

## 6. Doctor and native platform acceptance

- [x] 6.1 Add failing human/JSON doctor tests for the exact materialization code/severity/category/scope/detail/suggested-command and exit-status contract across Git-primary source checkout availability, optional missing sources, collisions, destination containment, provable copy destination missing/kind mismatch, copy ownership/freshness non-claims, exact healthy links, broken/misdirected links, unavailable/unknown capability evidence, and standalone exclusion
- [x] 6.2 Implement shared non-mutating doctor diagnostics without reading/hashing contents, executing hooks, repairing state, or creating capability probes
- [x] 6.3 Run the already-wired native built-CLI materialization acceptance on macOS/Linux/Windows for aliases/case collisions, files/directories, spaces/metacharacters, nested parents, missing/conflicting/cyclic sources, source/destination link escapes, symlink availability, lifecycle order, dry-run, JSON, multi-repository rollback, and removal target safety
- [x] 6.4 Run focused doctor tests, CLI lint/type/build gates, the complete CLI test suite, and CI workflow-reachability self-tests after the final CLI edit
- [x] 6.5 Perform a read-only staged CLI diff review against every approved requirement, reconcile concrete findings, commit, push, and open the CLI child PR with non-closing issue linkage

## 7. Canonical CLI documentation companion

- [x] 7.1 Strengthen the CLI repository's maintained configuration/create documentation contract tests first and record RED for missing field, lifecycle, safety, output, and copy-versus-symlink guidance
- [x] 7.2 Add concise CLI README/docs guidance for direct arrays, configured-only scope, canonical same-path sources, dry-run/doctor, no-overwrite/no-fallback behavior, and hooks as the custom-setup escape hatch
- [x] 7.3 Run CLI documentation checks and full required CLI validation after the final docs edit; include the docs in the CLI child PR

## 8. Website docs and generated exports companion

- [x] 8.1 Add/register a focused docs semantic checker with controlled RED fixtures for field names, configured-only scope, source/lifecycle ownership, safety/fallback boundaries, copy-versus-symlink advice, and unsupported-feature exclusions
- [x] 8.2 Add proportionate canonical configuration/create guidance and regenerate deterministic agent-readable exports plus `/llms.txt` discovery
- [x] 8.3 Run the focused checker, docs stable aggregate, export freshness, lint/type/build, and production rendering verification after the final docs edit
- [x] 8.4 Review the exact staged docs diff, commit, push, and open the docs child PR with non-closing issue and sibling links

## 9. Packaged skill guidance companion

- [x] 9.1 Add/register a focused skills guidance checker and controlled RED fixtures for authored source plus extracted canonical package behavior
- [x] 9.2 Update the smallest linked configuration/create references with canonical copy/symlink selection, lifecycle, safety, platform, dependency-sharing, standalone, and hook escape-hatch guidance while keeping `SKILL.md` minimal
- [x] 9.3 Build and verify the canonical release archive, then run focused, source aggregate, extracted-package aggregate, package-boundary, and existing skills validation after the final edit
- [x] 9.4 Review the exact staged skills diff, commit, push, and open the skills child PR with non-closing issue and sibling links

## 10. Coordinated semantic contracts and delivery

- [x] 10.1 Add/register meta contract RED fixtures consuming the generated CLI schema as the sole machine-readable field producer and comparing it plus maintained CLI guidance with website docs/exports and authored/extracted skills guidance, without a second contract artifact or feature-specific workflow steps
- [x] 10.2 Implement the coordinated materialization semantic checker and prove fail-closed registration, stable aggregate reachability, controlled mismatch detection, and unchanged real worktrees
- [x] 10.3 Run the complete local coordinated validation path once against final child heads and record exact revisions/results
- [x] 10.4 Update every related PR body with the complete sibling set; verify child heads, files, closing-keyword ownership, checks, review surfaces, and unresolved threads
- [x] 10.5 After approved child PRs are green and reviewed, merge CLI first, then docs and skills companions; verify reviewed surfaces on each child `main` and delete remote child branches

## 11. OpenSpec archive and final closeout

- [x] 11.1 Reconcile all completed implementation/validation evidence into this checklist and require every pre-archive task above to be checked with live PR/CI evidence
- [x] 11.2 Re-run the exact meta head against merged child `main` revisions, validate the change, and run the atomic exact-head checks/review-thread guard
- [x] 11.3 Archive `worktree-file-materialization`, inspect and format synced specs, replace generated placeholder purposes if any, and directly validate every touched canonical capability
- [x] 11.4 Commit and push archive output in a focused follow-up meta PR with the sole `Closes #273` linkage; list archive paths, validation, the merged child PRs, and the already-merged proposal/meta PR #296
- [ ] 11.5 Merge the green follow-up archive PR after all implementation and proposal PRs, verify issue #273 closed, synchronize `main`, remove the coordinated worktree, delete any surviving remote feature branches, and verify final clean coordinated status
