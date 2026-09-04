## 1. Contract and RED coverage

- [ ] 1.1 Record approval of the proposal contract before implementation edits.
- [ ] 1.2 Extend CLI and meta semantic contract tests first so stale repository-remove filename, ownership, ambiguity, onboarding, docs, and packaged guidance surfaces fail.
- [ ] 1.3 Add focused CLI RED tests proving qualified workspace repository files are currently absent from runtime, dry-run, and doctor plans on POSIX and Windows.
- [ ] 1.4 Add RED tests for inline/qualified-file, legacy/qualified-file, and Windows multi-candidate collisions before mutation.
- [ ] 1.5 Add onboarding and delete RED tests for the canonical qualified active path, exact ownership, no-overwrite, compatible-source publication races, and preservation of lookalikes.
- [ ] 1.6 Add direct non-bare, configured bare, ordinary linked, and bare-backed linked RED topology tests that compare the planned onboarding destination with runtime discovery and independently assert configuration authority, canonical clone versus active worktree, selected source path, and target-checkout cwd.

## 2. CLI implementation

- [ ] 2.1 Add one shared configured repository-remove candidate planner for workspace-owned qualified and compatible repository-local native files.
- [ ] 2.2 Route real remove and dry-run through the shared planner while preserving scope order, plain lifecycle identity, target-checkout cwd/context, input, timeout, JSON, gating, and finalization.
- [ ] 2.3 Route doctor through the same candidates, validation, interpreter preflight, and bounded ambiguity metadata.
- [ ] 2.4 Change repository hook onboarding to create safe active remove scaffolds at `.arashi/hooks/<lifecycle>.<repo><ext>` and block every competing claim.
- [ ] 2.5 Include only exact qualified repository remove files in configured delete planning and transactional cleanup.
- [ ] 2.6 Update generated CLI/inline contracts and deterministic freshness artifacts without changing workspace config version.

## 3. Companion guidance

- [ ] 3.1 Update maintained CLI hooks, remove, configuration, configure/add, and delete guidance with canonical and compatible locations plus collision/cwd behavior.
- [ ] 3.2 Update website canonical sources and regenerate checked agent-readable exports.
- [ ] 3.3 Update the packaged Arashi skill source and release-shaped guidance checks.
- [ ] 3.4 After affected child changes are committed, prove meta cross-repository checks execute the CLI, docs, and extracted-skill validations at those exact immutable revisions.

## 4. Verification and delivery

- [ ] 4.1 Prove each regression test fails against pre-change behavior and passes with the implementation.
- [ ] 4.2 Run focused POSIX runtime/dry-run/doctor/onboarding/delete tests and native Windows discovery/execution/ambiguity acceptance.
- [ ] 4.3 Run CLI format, lint, typecheck, build, full tests, contract/schema freshness, and built-binary smoke tests.
- [ ] 4.4 Run docs checks/build and skill source/archive checks, then commit every affected child repository and record its immutable head.
- [ ] 4.5 Run complete meta cross-repository validation against those exact child heads with clean lockfiles and status.
- [ ] 4.6 Push each affected child repository, open coordinated PRs linked to #354, and require independent review plus exact-head CI.
- [ ] 4.7 Merge child PRs only after approval and green exact-head gates; verify the released/installed CLI exposes the new contract before meta dogfood depends on it.

## 5. Archive and cleanup

- [ ] 5.1 Reconcile implementation evidence, merged child revisions, installed-version/native acceptance, review threads, and every task before archive.
- [ ] 5.2 Archive and sync the completed change, validate canonical specs and meta gates, then update the existing meta PR with exact child pointers and sole closing linkage for #354.
- [ ] 5.3 Merge the meta PR after the atomic archive/readiness guard, verify issue closure, remove coordinated worktrees/branches, and confirm clean `aw status --verbose`.
