## 1. Baseline and contract fixtures

- [ ] 1.1 Record the current constructed Commander command/option tree, wrapper-intercepted `install`/`update` behavior, generated CLI contract, configured workspace status, and repository-local validation baseline before production edits.
- [ ] 1.2 Add a deterministic option-audit fixture that enumerates every registered command path and records long option, short alias, value shape, hidden/deprecated state, and typed semantic-policy ownership; prove RED for a missing/stale/colliding alias or policy entry.
- [ ] 1.3 Add generated-contract schema and validator RED cases for compatibility mappings, deprecation state, switch conflicts/implications, selector input forms, and update inspection conflicts before changing the producer.

## 2. Switch behavior strict TDD

- [ ] 2.1 Add failing Commander and pure-resolver matrix tests for omitted, `--cd`, canonical `--launch`, canonical `--ignore-configured-launcher`, legacy synonyms, and synonymous combinations across configured `auto`, `cd`, `launch`, `sesh`, and `herdr`; cover shell integration and managed-context branches.
- [ ] 2.2 Add failing conflict/non-mutation tests for `--cd --launch` and `--cd` with every tab/explicit-launcher class at both Commander action and exported executor boundaries; preserve existing JSON guard precedence.
- [ ] 2.3 Add failing tests proving `--launch` preserves configured `sesh`/Herdr; `--ignore-configured-launcher` preserves `auto`/`cd`/`launch` behavior but converts configured `sesh`/Herdr into generic launch; their combination requests generic automatic launch; and explicit launcher/tab prerequisite/failure/no-fallback policy remains unchanged.
- [ ] 2.4 Add failing help, deprecation, and structured-output tests proving canonical names are preferred, legacy names remain compatible/hidden throughout 1.x, human warnings are isolated to stderr, and no human warning enters JSON stdout.
- [ ] 2.5 Strengthen focused CLI and companion semantic checkers first and record RED against the unchanged failure guidance, canonical docs, generated exports, and packaged skills where unsupported Terminal.app tab guidance still recommends `--no-cd --no-default-launch` instead of `--launch --ignore-configured-launcher`; leave content edits to tasks 5.3, 6.2, and 7.2.
- [ ] 2.6 Implement semantic switch-intent normalization and canonical/compatibility registrations without adding persisted configuration vocabulary; update actionable launch-disposition guidance and satisfy the complete focused switch suite.

## 3. Selector and alias strict TDD

- [ ] 3.1 Add failing shared-selector tests for repeated, comma-separated, mixed, duplicate, blank-segment, explicitly empty, omitted, unknown, and `--only`/`--group` intersection inputs through both long and short forms.
- [ ] 3.2 Add failing command-level selection/non-mutation tests for `create`, `exec`, `pull`, `push`, `setup`, `status`, and `sync`, including configured and standalone restrictions and human/JSON error parity.
- [ ] 3.3 Add failing configured-workspace `status --only` tests for selected/unselected child inspection, group intersection, unknown/empty/no-match failure before fetch, parent reporting, short/verbose output, and one-envelope JSON output; add standalone rejection tests.
- [ ] 3.4 Add failing constructed-tree and representative command tests for all required `-v`, `-f`, `-j`, `-o`, `-g`, and `-n` aliases, command-local uniqueness, exact long-form equivalence, combined `-j --json`, unsupported JSON modes, npm-intercepted `install -j` and `update -j/-n`, and unchanged `add -n/--name` plus long-only `exec --jobs`.
- [ ] 3.5 Implement shared supplied-state selector normalization, migrate all selector registrations to repeated-plus-comma parsing, add fail-closed `status --only`, and add only the approved command-local aliases.
- [ ] 3.6 Implement npm-entrypoint parsing for `install -j`, `install --json`, combined `install -j --json`, and `update -j/-n`; prove identical direct/npm structured output and exit status with exactly one install/update execution and no duplicate mutation.

## 4. Handoff and update strict TDD

- [ ] 4.1 Add failing handoff tests proving omitted format remains Markdown, hidden/deprecated `--markdown` remains behaviorally compatible, preferred help omits it, and `--json --markdown` emits one clean envelope.
- [ ] 4.2 Implement the handoff compatibility registration and migration warning policy without changing Markdown generation or JSON schema.
- [ ] 4.3 Add failing human and JSON tests for `update --check --dry-run` and `update --check -n` rejection before network lookup or mutation in both the compiled Commander path and npm entrypoint/delegated wrapper path.
- [ ] 4.4 Implement one shared update inspection-mode conflict policy across native and npm-managed entrypoints while preserving independent `--check`, `--dry-run`, and `--yes` behavior.

## 5. CLI contracts and repository-local guidance

- [ ] 5.1 Extend typed CLI option-policy production and validation to encode aliases, compatibility/deprecation mappings, switch semantics, selector forms, and update conflicts; regenerate the deterministic command contract only after producer tests pass.
- [ ] 5.2 Strengthen CLI-local semantic drift tests first and record RED for stale preferred switch names, alias/help mismatch, selector syntax mismatch, or handoff/update policy mismatch.
- [ ] 5.3 Update CLI help, README, command docs, and release/migration notes to prefer `--launch` and `--ignore-configured-launcher`, omit deprecated `handoff --markdown`, and document consistent aliases/selectors without implementing the separately tracked native completion feature.
- [ ] 5.4 Run focused CLI behavior/contract tests, then the complete post-edit CLI test, typecheck, lint, generated-contract freshness, formatting, changed-file quality, build, native cross-build, and `git diff --check` gates.

## 6. Canonical docs and agent exports

- [ ] 6.1 Strengthen the nearest docs semantic checker and record RED for one stale alias, preferred deprecated switch spelling, incorrect selector form, or missing update conflict before editing canonical content.
- [ ] 6.2 Update canonical command/configuration/workflow docs and examples with the final option matrix, compatibility migrations, selector forms, status filtering, and update conflict.
- [ ] 6.3 Regenerate agent-readable docs exports deterministically and run docs semantic checks, export freshness, links, accessibility, build, packaging, and `git diff --check` after the final docs edit.

## 7. Packaged skill guidance

- [ ] 7.1 Strengthen source and extracted-package skill validators and record RED for guidance that prefers a deprecated spelling or disagrees with canonical alias/switch/selector policy.
- [ ] 7.2 Update the smallest affected Arashi skill references to teach canonical switch intent and migration syntax while retaining CLI help as the parameter source of truth.
- [ ] 7.3 Run all repository-local and extracted-package skill self-tests, package-boundary inspection, and `git diff --check` after the final skill edit.

## 8. Cross-repository semantic enforcement

- [ ] 8.1 Extend the meta contract checker fixtures first and record RED for deliberate alias, compatibility mapping, deprecation, conflict, selector-shape, docs, export, or packaged-skill drift without mutating real child worktrees.
- [ ] 8.2 Update normalized cross-repository policy comparison and CI generation steps so source and extracted artifacts are checked against the canonical CLI contract.
- [ ] 8.3 Run strict OpenSpec validation, complete cross-repository command-contract tests, workflow/checker self-tests, and `git diff --check` after the final meta edit.

## 9. Coordinated delivery and readiness

- [ ] 9.1 Commit verified CLI, docs, skills, and meta/OpenSpec slices separately; open and cross-link child PRs with non-closing references to `corwinm/arashi-arashi#250`, keeping the meta PR as the sole eventual closing owner.
- [ ] 9.2 Verify every child PR is non-draft, mergeable, latest-head green, and free of unresolved actionable review threads; merge child PRs before final meta archive work.
- [ ] 9.3 Reconcile merged child heads into the coordinated meta contract, rerun final strict validation and complete replacement CI, and confirm all pre-archive implementation tasks are complete before preparing the OpenSpec archive and final meta closeout.
