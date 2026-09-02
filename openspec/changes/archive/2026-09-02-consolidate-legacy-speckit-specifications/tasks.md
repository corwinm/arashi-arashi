## 1. Canonical Requirement Coverage

- [x] 1.1 Inventory all 39 legacy numbered directories and record one explicit disposition per directory
- [x] 1.2 Author baseline deltas for retained create, list, setup, sync, configuration, interaction, CI, release, documentation-site, add, status, and specification-workflow behavior
- [x] 1.3 Validate the complete change manifest with `openspec validate consolidate-legacy-speckit-specifications --strict`

## 2. Structural Regression Guard

- [x] 2.1 Add a failing structural test that rejects the retired `specs/`, `.specify/`, and `/speckit.*` tracked workflow while requiring canonical OpenSpec assets
- [x] 2.2 Remove retired assets and prove the structural test passes

## 3. Active Documentation

- [x] 3.1 Update the root README layout, workflow, framework summary, and quick path for the consolidated OpenSpec-only repository
- [x] 3.2 Update CONTRIBUTING with the current OpenSpec proposal/apply/archive flow and validation commands
- [x] 3.3 Replace stale Spec Kit process sections in `docs/implementation-workflow.md` and `docs/quick-reference.md` with concise current multi-repo/OpenSpec guidance
- [x] 3.4 Remove stale Spec Kit ignore rules and verify no active tracked documentation references deleted paths or commands
- [x] 3.5 Update the CLI repository's canonical contribution pointer to OpenSpec and add a focused regression test

## 4. Verification and Delivery

- [x] 4.1 Run strict validation for all OpenSpec items and compare delta capability directories with the proposal manifest
- [x] 4.2 Run formatting, typechecking, tests, and cross-repository contract checks; compare failures with the clean-main baseline
- [x] 4.3 Run stale-reference, path-count, and `git diff --check` audits and confirm only intentional archived/canonical history mentions Spec Kit
- [x] 4.4 Independently review both exact repository diffs and the migration matrix, address blockers, commit, push, and open coordinated issue-linked pull requests
