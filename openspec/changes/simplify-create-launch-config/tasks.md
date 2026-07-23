## 1. CLI configuration contract

- [ ] 1.1 Add failing configuration unit/integration tests for canonical `none|auto|sesh|herdr` launch values, absent launch, non-boolean switch rejection, every legacy boolean/launcher mapping, equal and conflicting aliases, canonical-plus-legacy compatibility/conflicts, scope-qualified diagnostics, non-persistent normalization, and JSON stdout isolation across generic and every supported editor scope.
- [ ] 1.2 Add failing generated-schema and maintained-contract checks that require the canonical create launch enum, preserve the independent switch boolean, and forbid canonical create `launchMode` / `launch_mode` while leaving unified switch mode unchanged.
- [ ] 1.3 Replace the canonical create-default type with one launch enum, pass scoped errors/diagnostics through generic and editor normalizers, implement the complete legacy matrix, and regenerate the configuration schema only after focused tests are red.
- [ ] 1.4 Run focused config normalization, schema, diagnostics, and real config-loading tests; verify accepted legacy files remain byte-for-byte unchanged and every rejection precedes discovery or mutation.

## 2. Create default resolution and post-create behavior

- [ ] 2.1 Add failing create-default resolver tests for terminal and all editor hosts, missing-host isolation, each canonical launch choice, absent defaults, `--launch`, `--no-launch`, explicit sesh/Herdr precedence, launcher conflicts, independent switch opt-in/opt-out, launch-implies-switch, and pre-mutation JSON rejection for configured launch.
- [ ] 2.2 Add failing real temporary-workspace tests for configured and standalone create, explicit overrides, automatic/sesh/Herdr launch selection, primary worktree selection, launcher failure preservation, strict environment behavior, source provenance, argv-safe paths, and cross-platform path handling.
- [ ] 2.3 Refactor create resolution to derive existing internal `shouldLaunch` and launcher preference from one configured mode while preserving standalone behavior, shared launcher protocols, automatic ordering, human output, JSON restrictions, and post-create rollback boundaries.
- [ ] 2.4 Run focused create resolver, configured/standalone integration, Herdr, shared-launcher, failure, and temporary-workspace tests after implementation and reconcile exact-object or platform regressions.

## 3. CLI documentation and generated contracts

- [ ] 3.1 Add failing source-content tests for the canonical create launch vocabulary, independent switch, launch-implies-switch, CLI precedence, scope isolation, migration table/diagnostics, and removal of canonical create `launchMode` advice across README and maintained CLI docs.
- [ ] 3.2 Update CLI help/diagnostics and authored README/configuration/create/launcher guidance with the bounded compatibility window and exact replacements without changing unrelated switch behavior.
- [ ] 3.3 Regenerate the semantic command contract and run focused schema, command-contract, formatting, lint, typecheck, build/help, and full CLI test gates after the final CLI edit.

## 4. Canonical docs and agent exports

- [ ] 4.1 Add or update failing docs-source/export checks for create, config, tmux/sesh, Herdr, editor scopes, generated Markdown routes, `llms.txt`, and `llms-full.txt` so stale two-field examples or missing migration/precedence guidance fail validation.
- [ ] 4.2 Update the smallest canonical docs sources to explain one create launch choice, independent switch behavior, explicit override precedence, host-scope isolation, failure preservation, and legacy migration.
- [ ] 4.3 Regenerate docs content and agent-readable exports, run complete docs validation, and inspect each affected generated surface by content.

## 5. Skill package and cross-repository enforcement

- [ ] 5.1 Add or update failing skill checks for canonical create examples, one-off CLI overrides, launch-implies-switch, generic/editor scope behavior, failure preservation, migration guidance, and removal of canonical create `launchMode` advice.
- [ ] 5.2 Update the smallest affected Arashi skill references and semantic contract/package metadata without changing unrelated workflow policy.
- [ ] 5.3 Run skill formatting, security, package-boundary, and complete repository validation; inspect the built package rather than source paths alone.
- [ ] 5.4 Add a failing cross-repository semantic-drift fixture for one controlled out-of-repository create launch mismatch, verify RED against the current checker, then update the checker for the create launch enum and migration rules and prove the fixture fails for the intended mismatch while the aligned configured repositories/exports pass.
- [ ] 5.5 Verify the VS Code extension still passes only supported `--editor-host` context and run its existing contract/tests if cross-repository checks or generated fixtures require an update; do not change extension behavior without a failing parity test.

## 6. Final review and delivery

- [ ] 6.1 Run strict OpenSpec validation and reconcile implementation against every requirement/scenario and issue #227 acceptance criterion.
- [ ] 6.2 Run one independent read-only spec-compliance review followed by a code-quality/integration review; fix every blocking finding and rerun affected tests after the final source edit.
- [ ] 6.3 Run final complete validation in every changed repository, verify clean coordinated status, commit each repository separately, and open cross-linked child PRs with non-closing issue references.
- [ ] 6.4 After child PRs are green and approved, verify all pre-archive tasks are complete, archive/sync the OpenSpec change, directly validate the synced specifications, update the meta PR to be the sole closing reference, and complete child-first merge plus coordinated cleanup.
