## 1. CLI configuration contract

- [x] 1.1 Add failing config unit/integration tests for every unified switch mode, unsupported-mode rejection before mutation, absent-mode compatibility, all `launch_mode`/`launchMode` mappings (including duplicate equal/conflicting aliases and unified explicit modes combined with legacy fields), ambiguous/conflicting rejection, exact migration diagnostics, and JSON stdout isolation.
- [x] 1.2 Add failing generated-schema and maintained-contract checks that require the unified switch mode set, forbid canonical `defaults.switch.launchMode`, and preserve unchanged create defaults.
- [x] 1.3 Replace the canonical switch-default type with the unified mode enum, implement legacy raw-field normalization and diagnostic propagation, preserve `defaults.create` plus editor-scoped create behavior, then regenerate and verify the config schema and maintained contracts.

## 2. Managed-context and switch resolution

- [x] 2.1 Add failing shared-launcher tests for a pure managed-context detector covering strict tmux, exact Herdr, cmux workspace/surface, Cursor, Kiro, and VS Code evidence; weak signals; and precedence collisions.
- [x] 2.2 Add failing switch tests for every configured mode; explicit CLI precedence/conflicts; `--no-cd`; `--no-default-launch`; shell active/inactive behavior; each managed-context branch; weak-signal `cd`; auto-detected IDE CLI-unavailable fallback versus IDE execution failure; generic/platform fallback; and no-fallback tmux/Herdr/cmux failures.
- [x] 2.3 Add failing real temporary-workspace integration tests proving configured and standalone legacy loading, non-mutation on ambiguous config, shell directives, launcher argv safety, and cross-platform path handling.
- [x] 2.4 Extract the shared managed-context detector, make automatic launcher selection consume the same classification, and refactor switch resolution to derive internal behavior and launcher preference from the unified mode while preserving subprocess protocols, configured/standalone selection, human warnings, Herdr source resolution, and machine-readable restrictions.
- [x] 2.5 Run the focused detector, switch-command, configuration, and temporary-workspace tests after implementation and reconcile any exact-object or cross-platform regressions.

## 3. CLI documentation and generated contracts

- [x] 3.1 Add failing source-content tests for the unified vocabulary, auto precedence, fallback behavior, migration table, diagnostic guidance, and unchanged create-default model across README and maintained CLI docs.
- [x] 3.2 Update CLI help/diagnostics and authored README/configuration/switch/shell guidance, including the bounded legacy compatibility window and exact replacements.
- [x] 3.3 Regenerate the semantic command contract and run focused schema, command-contract, formatting, lint, typecheck, build/help, and full CLI test gates after the final CLI edit.

## 4. Canonical docs and agent exports

- [x] 4.1 Add or update failing docs-source/export checks for switch/config/shell, tmux/sesh, Herdr, cmux, generated Markdown routes, `llms.txt`, and `llms-full.txt` so stale two-field examples or inverted auto precedence fail validation.
- [x] 4.2 Update the smallest canonical docs sources to explain unified modes, CLI precedence, strict managed contexts, `cd` and platform fallback, legacy migration, and unchanged create defaults.
- [x] 4.3 Regenerate docs content and agent-readable exports, then run the complete docs validation and inspect each affected generated surface by content.

## 5. Skill package and cross-repository enforcement

- [x] 5.1 Add or update failing skill checks for unified switch-mode examples, `--no-default-launch`, automatic context ordering, migration guidance, and removal of canonical switch `launchMode` advice.
- [x] 5.2 Update the smallest affected Arashi skill references and package metadata without changing unrelated workflow policy.
- [x] 5.3 Run skill formatting, security, package-boundary, and complete repository validation; inspect the built package rather than source paths alone.
- [x] 5.4 Update and run the canonical cross-repository contract checker so disagreement among CLI, schema, docs, exports, and skill guidance fails; verify it with one controlled out-of-repository semantic mismatch.

## 6. Final review and delivery

- [x] 6.1 Run strict OpenSpec validation and reconcile the implementation against every requirement/scenario and issue #225 acceptance criterion.
- [x] 6.2 Run one independent read-only spec-compliance review followed by a code-quality/integration review; fix all blocking findings and rerun affected tests after the final source edit.
- [x] 6.3 Run final complete validation in every changed repository, verify clean coordinated status, commit each repository separately, and open cross-linked child PRs with non-closing issue references.
- [x] 6.4 After child PRs are green and approved, archive/sync the OpenSpec change, directly validate the archived spec, update the meta PR to be the sole closing reference, and complete child-first merge plus coordinated cleanup.
