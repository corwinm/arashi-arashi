## 1. Baseline and executable contract

- [x] 1.1 Record the current 15-check topology, representative job durations, and historical multi-failure evidence from successful and failed exact-SHA CI runs
- [x] 1.2 Extend the focused CI workflow contract with positive assertions for the nine-check topology, distinct three-platform build/acceptance matrices, retained acceptance commands, platform ownership, build dependency, and artifact mapping
- [x] 1.3 Add controlled mutations for obsolete job restoration, platform omission/mismatch, acceptance relocation/removal, missing setup/dependency/artifact reachability, matrix fail-fast drift, sibling short-circuiting, and hidden failure semantics; prove each fails through the real checker

## 2. Consolidate post-build acceptance

- [x] 2.1 Preserve the existing three-platform native build matrix and named artifact uploads
- [x] 2.2 Replace the five post-build acceptance job definitions with one Linux/macOS/Windows `native-acceptance` matrix depending on `build`
- [x] 2.3 Run version/completion and materialization acceptance on all three platform artifacts
- [x] 2.4 Run installed-wrapper/built-hook acceptance on Linux and installer plus native hook-input acceptance on Windows without removing or rewriting their maintained commands
- [x] 2.5 Set matrix `fail-fast: false`; guard major sibling acceptance groups with `always()` and true setup/artifact prerequisites; reject `continue-on-error` and failure-bypassing conditions

## 3. Local verification and review

- [x] 3.1 Run the focused CI contract test and every controlled mutation against the real checker
- [x] 3.2 Run `actionlint`, formatting, lint, typecheck, build, full tests, platform-practical native smoke tests, and `git diff --check`
- [x] 3.3 Confirm docs/skills need no companion update because platform support, commands, installation behavior, and user workflow are unchanged
- [x] 3.4 Obtain an independent exact-head review of the cumulative child diff, including matrix expansion count, filesystem reachability, failure continuation, artifact dependencies, cross-platform behavior, and checker blind spots

## 4. Remote delivery

- [x] 4.1 Open the child PR from the reviewed exact head and verify its base/head/files/body
- [x] 4.2 Verify exact-head PR CI reports exactly nine successful `CI` workflow checks with three builds and three native acceptance platforms; inspect every applicable acceptance step for `success`, not `skipped`
- [x] 4.3 From a disposable unmerged fixture commit, force an early Windows acceptance failure and verify later Windows installer/hook groups plus Linux/macOS acceptance still execute; revert the fixture normally and require a clean final-head run
- [x] 4.4 Merge the child PR, then verify the default-branch `push` run against the child merge SHA reports the same nine successful outcomes and three artifacts; recheck ruleset `16155709`
- [x] 4.5 Strictly validate the active OpenSpec change before archive; only after default-branch proof, archive it, strictly validate all resulting canonical specs, commit the meta repository at the exact merged child head, open the meta PR, and merge it after exact-head checks pass
- [x] 4.6 Define rollback so a pre-archive rollback reverts and revalidates the child change, while a post-archive rollback reverts both the child change and archived canonical/meta change and strictly revalidates both repositories
