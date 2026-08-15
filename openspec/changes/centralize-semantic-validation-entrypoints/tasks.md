## 1. Skills Registration, Aggregate, and Package RED Coverage

- [ ] 1.1 Add focused registration tests that fail for omitted, stale, duplicate, escaping, symlinked, malformed, and non-bytewise-sorted `scripts/<basename>-guidance-selftest.mjs` identities; record RED against the missing registry.
- [ ] 1.2 Add source and package aggregate tests proving registration is a mandatory preflight in both modes and no child runs after a registration defect; record RED against the missing aggregates.
- [ ] 1.3 Add aggregate process tests proving deterministic order/headings, inherited diagnostics, complete collection of startup/signal/nonzero failures, completed counts, and direct focused-checker availability; record RED.
- [ ] 1.4 Add extracted-package tests that mutate only the extracted `skills/arashi` root and prove every registered checker receives `--skill-root`; record RED showing source correctness cannot mask package drift.
- [ ] 1.5 Add canonical release-archive tests requiring exactly `skills/`, `README.md`, `LICENSE`, and `security/`, rejecting undeclared members, maintainer tooling, and AppleDouble metadata, and proving pull-request/release consumers use the same producer or member policy; record RED against current divergent archive blocks.
- [ ] 1.6 Add skills workflow-composition tests that reject feature-specific enumeration, missing/duplicated source or package aggregates, invalid package ordering, and changed child trigger scope; record RED against current workflows.

## 2. Meta Registration, Local-Path, and Composition RED Coverage

- [ ] 2.1 Add meta registration tests that fail for omitted, stale, duplicate, escaping, symlinked, malformed, and non-bytewise-sorted `scripts/check-<basename>-contracts.ts` identities; prove both local and CI modes require the same preflight and record RED against hard-coded package scripts.
- [ ] 2.2 Add meta runner tests requiring `contracts:check` and `contracts:check:ci` to consume the same deterministic registry, with CI mode differing only by explicit prevalidated-child execution policy; record RED.
- [ ] 2.3 Add documented-local-path alignment tests requiring docs, skills source, canonical skills package, and meta aggregate stages to match the authoritative workflow exactly once; record RED against current documentation and duplicate docs generation.
- [ ] 2.4 Add workflow-composition RED tests requiring stable docs, skills source, canonical skills package, and registry-backed meta aggregates, exact child revision reporting, and retained trigger inputs while forbidding feature-specific checker commands.
- [ ] 2.5 Add dedicated executable RED fixtures proving registered skills failures propagate through source and canonical extracted-package aggregates with checker-specific diagnostics, and that ordinary mutation fixtures may skip repeated child execution only while dedicated stages remain reachable.
- [ ] 2.6 Update feature-era reachability fixtures to require aggregate registration plus executable acceptance rather than literal feature-specific YAML lines; record the existing failures before child production entrypoints are added.

## 3. Skills Aggregate and Canonical Package Implementation

- [ ] 3.1 Add the explicit sorted guidance-checker manifest and focused fail-closed registration guard outside the installable skill tree.
- [ ] 3.2 Add the stable aggregate runner with mandatory registration preflight, source and `--skill-root` modes, deterministic headings, complete child-failure collection, and checker-specific diagnostics.
- [ ] 3.3 Add one dependency-free canonical release-archive producer or producer-owned member policy and exact boundary validation shared by pull-request, tag-release, and meta consumers.
- [ ] 3.4 Remove literal feature-specific workflow and cross-repository wiring assertions from focused guidance checkers while retaining semantic, deliberate-drift, source, package, and direct-execution coverage.
- [ ] 3.5 Migrate authoritative skills workflows to one source aggregate and one canonical-package aggregate, remove separate registration and checker-specific YAML steps, and preserve existing triggers, security scanning, package ordering, and release upload behavior.
- [ ] 3.6 Run every focused checker directly, registration mutations, both aggregates, canonical archive/boundary tests, security gate/self-test, workflow-composition tests, syntax checks, and `git diff --check` after the final edit.
- [ ] 3.7 Perform an exact staged-diff review against the approved contracts, commit the skills repository, push normally, open the child PR with `Tracks corwinm/arashi-arashi#283`, and verify live files and exact-head CI.

## 4. Skills Child Delivery

- [ ] 4.1 Reconcile only verified Corwin/Codex review findings against the approved contracts and rerun the complete skills matrix after the final edit.
- [ ] 4.2 Obtain exact-head green CI, merge the skills child PR, remove its remote feature branch, and verify the canonical aggregate/package entrypoints on child `main` before meta finalization.

## 5. Meta Registry, Local Path, and Workflow Integration

- [ ] 5.1 Add the explicit coordinated-checker manifest, registration guard, and registry-backed meta runner; route both `contracts:check` and `contracts:check:ci` through it without allowing CI skip mode to bypass registration.
- [ ] 5.2 Implement or document the complete local coordinated path and align package scripts/coordinator, documentation, and workflow stage sets through the RED alignment tests.
- [ ] 5.3 Remove standalone docs `sync:content` from coordinated CI so `validate:semantic-docs` is the sole docs content/export generation owner and remains ordered before consumers.
- [ ] 5.4 Replace feature-specific skills source/package steps with stable source and canonical-package aggregates, using the merged child producer/member policy and one same-job create/verify/extract/validate sequence.
- [ ] 5.5 Retain CLI generation/freshness, meta tests/typecheck, exact revision reporting, path-trigger reachability, one registry-backed `contracts:check:ci`, and actionable stage boundaries while removing duplicate or feature-specific execution.
- [ ] 5.6 Run meta registration/runner tests, local/CI alignment, workflow composition, dedicated aggregate acceptance, focused mutation fixtures, full meta tests, typecheck, contract checks, format check, OpenSpec strict validation, and `git diff --check` after the final edit.
- [ ] 5.7 Perform an exact staged-diff review against the approved contracts, commit and push normally, update the coordinating PR with the merged skills PR and `Tracks #283`, and verify live files and exact-head CI.

## 6. Coordinated Review and Active-Change Completion

- [ ] 6.1 Reconcile verified Corwin/Codex feedback on the coordinating PR, retain only approved-contract fixes, and rerun every affected focused and aggregate gate after the final edit.
- [ ] 6.2 Obtain exact-head green CI for the meta PR and verify it resolves child repositories from merged `main` rather than an unpublished feature branch.
- [ ] 6.3 Mark every verified implementation task through this item complete, validate the still-active `centralize-semantic-validation-entrypoints` change strictly, and commit the completed active checklist before archive.

## 7. Archive, Merge, and Cleanup

- [ ] 7.1 Archive and sync `centralize-semantic-validation-entrypoints`, replace generated placeholder purpose text, validate the archived change and synced canonical specifications directly, and commit the archive separately.
- [ ] 7.2 Update the meta PR to be the sole `Closes #283` owner with archive paths, exact validation evidence, and related PR links; obtain exact-head green CI and merge it last.
- [ ] 7.3 Verify issue #283 is closed, synchronize the base coordinated workspace, remove coordinated worktrees/branches, verify remote feature branches are absent, and confirm final verbose status is clean on `main`.
