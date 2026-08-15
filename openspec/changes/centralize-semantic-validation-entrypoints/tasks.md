## 1. Skills Registration and Aggregate RED Coverage

- [ ] 1.1 Add focused registration tests that fail for omitted, stale, duplicate, malformed, and unsorted maintained guidance checker entries, and record the expected RED evidence before adding the registry.
- [ ] 1.2 Add source aggregate acceptance tests that prove deterministic checker order, inherited diagnostics, startup/nonzero failure propagation, and direct focused-checker availability; record RED against the missing aggregate.
- [ ] 1.3 Add extracted-package acceptance tests that mutate only the extracted skill root and prove every registered checker receives `--skill-root`; record RED showing source correctness cannot mask package drift.
- [ ] 1.4 Add workflow-composition tests that reject feature-specific checker enumeration or missing registration/source/package aggregate stages while preserving current child trigger scope and package creation/extraction; record RED against current workflows.

## 2. Skills Aggregate Implementation

- [ ] 2.1 Add the explicit sorted guidance-checker manifest and fail-closed registration guard outside the installable skill tree.
- [ ] 2.2 Add the stable aggregate runner with default source mode, explicit `--skill-root` package mode, optional coordinated `--meta-root` context, deterministic headings, and fail-fast checker-specific diagnostics.
- [ ] 2.3 Remove literal feature-specific workflow invocation assertions from focused guidance checkers and retain their semantic, deliberate-drift, source, package, and direct-execution coverage.
- [ ] 2.4 Migrate authoritative skills source and release-package workflows to stable registration/source/package aggregate invocations and remove redundant checker-specific YAML steps.
- [ ] 2.5 Run every focused checker directly, the registration guard, source aggregate, release-shaped extracted-package aggregate, security gate/self-test, and workflow-composition tests; confirm maintainer tooling is excluded from the package.
- [ ] 2.6 Perform an exact staged-diff review against the approved contracts, commit the skills repository, push normally, open the child PR with `Tracks corwinm/arashi-arashi#283`, and verify its live files and CI head.

## 3. Meta Aggregate RED Coverage

- [ ] 3.1 Add workflow-composition RED tests requiring the stable docs aggregate, skills source aggregate, skills extracted-package aggregate, coordinated contract aggregate, exact child revision reporting, and meta trigger paths for child checker, manifest/runner, guidance, generated-contract, package-boundary, and workflow inputs.
- [ ] 3.2 Add dedicated executable RED fixtures proving a registered skills checker failure propagates through source and extracted-package aggregates with checker-specific diagnostics.
- [ ] 3.3 Update feature-era workflow reachability fixtures to require aggregate registration plus executable acceptance rather than literal feature-specific YAML lines, and preserve explicit CI skip semantics only for ordinary mutation fixtures.

## 4. Meta Workflow and Contract Integration

- [ ] 4.1 Replace feature-specific skills source steps in the coordinated workflow with the stable source aggregate and pass coordinated context without duplicating checker execution.
- [ ] 4.2 Replace feature-specific extracted-package steps with one release-shaped package creation/extraction and stable package aggregate invocation.
- [ ] 4.3 Keep the stable docs semantic aggregate, CLI generation/freshness stages, meta test/typecheck stages, and `contracts:check:ci` reachable once each with actionable failure boundaries.
- [ ] 4.4 Run focused workflow-composition and aggregate acceptance tests, then complete meta tests, typecheck, contract checks, format check, `git diff --check`, and full coordinated semantic validation after the final edit.
- [ ] 4.5 Perform an exact staged-diff review against the approved contracts, commit the meta repository, push normally, open/update the coordinating PR with links to the skills child PR and `Tracks #283`, and verify its live files and CI head.

## 5. Coordinated Delivery and Closeout

- [ ] 5.1 Reconcile verified Corwin/Codex feedback on all related PR surfaces, retain only approved-contract fixes, and obtain complete exact-head green CI for the skills and meta PRs.
- [ ] 5.2 Merge the skills child PR first, remove its remote feature branch, and rerun the exact meta head against the merged child `main` fallback.
- [ ] 5.3 Mark all verified implementation tasks complete, archive and sync `centralize-semantic-validation-entrypoints`, replace any generated placeholder purpose, and validate the synced specifications directly.
- [ ] 5.4 Update the meta PR to be the sole `Closes #283` owner with archive paths, validation evidence, and related PR links; obtain exact-head green CI and merge it last.
- [ ] 5.5 Verify issue #283 is closed, synchronize the base coordinated workspace, remove the coordinated feature worktree/branches, verify remote feature branches are absent, and confirm final verbose status is clean on `main`.
