## 1. Reconfirm scope and establish evidence

- [ ] 1.1 Re-read live issues #274 and #316, this proposal/design/delta set, current `add` transaction/rollback/prompt/config/materialization/hook modules, generated CLI/config contracts, all affected repository `AGENTS.md` files, and current docs/skill semantic aggregate registries before editing production or guidance.
- [ ] 1.2 Create an implementation evidence ledger that maps every #274 acceptance criterion and every delta requirement to an owning repository, focused RED command, expected missing-behavior failure, GREEN task, native/applicable CI job, sanitized-output assertion, and final aggregate; reject any criterion without explicit pre-implementation evidence.
- [ ] 1.3 Capture clean baseline results for focused existing add/config/prompt/materialization/inline-hook tests and each affected child/meta aggregate; record pre-existing failures separately and do not mark them as feature evidence.
- [ ] 1.4 Inventory every maintained onboarding/add/configuration guidance and generated-export surface plus authored/extracted skill package boundary; identify the existing fail-closed manifests and stable aggregate entrypoints that will own new semantic checks without workflow-specific stages.

## 2. Establish CLI RED behavior before production edits

- [ ] 2.1 Add pure-model RED tests for explicit repository descriptors, canonical paths/scopes, configured-versus-unset state, unrelated-field preservation, approved onboarding subset, and rejection of generic schema-driven field exposure; run them and record expected failures for the absent editor model.
- [ ] 2.2 Add pure-model RED tests for copy/symlink declaration order, canonical normalization, duplicate and cross-field portable collisions, manual dependency-directory warnings, complete-config validation, and field-attributed retry results; prove the tests load real canonical validators and fail only because the editor adapters are absent.
- [ ] 2.3 Add hook-model RED tests for all four lifecycles, Bash shorthand, explicit interpreter maps, empty/unsupported values, selected-only persistence, setup-script non-inference, and lifecycle/interpreter-only sanitized projection; use a unique canary and prove no test snapshot or diagnostic serializes the body.
- [ ] 2.4 Add bounded-discovery RED tests using real temporary repositories for root-only ignored `.env`/approved local candidates, deterministic ordering/limits, unselected results, manual fallback, non-recursion into large ignored trees, `node_modules` exclusion, outside-path exclusion, and spies/permissions proving candidate contents are never opened, hashed, or printed.
- [ ] 2.5 Add prompt-controller RED tests with injected handlers for centralized TTY/`--json`/`--force` eligibility, default-no minimal decline, selected-section-only prompts, configured/unset display, recoverable validation retry, mixed candidate collection, final sanitized confirmation, final decline cancellation, and controlled Ctrl+C at every stage.
- [ ] 2.6 Add executor/transaction RED tests proving onboarding begins only after clone/topology/setup inspection, performs no discovery in suppressed modes, saves exactly once with the complete candidate, preserves expected-byte concurrency failure, and routes post-opt-in cancellation through existing rollback while top-level decline remains success.
- [ ] 2.7 Add rollback RED tests proving complete-entry ownership includes `copy`, `symlink`, and exact in-memory hooks; a concurrent change to any repository field is preserved rather than deleted based only on `path`/`gitUrl`; every final-state diagnostic remains hook-body-free.
- [ ] 2.8 Add regression RED tests for direct-main, configured-bare, linked-parent coordinated add, duplicate clone fallback, `--create-setup`, setup detection, `--force`, `--json`, non-TTY, JSON stdout isolation, exit codes, and human output so onboarding cannot change existing contracts outside eligibility.
- [ ] 2.9 Add real PTY RED journeys driven by raw terminal bytes for top-level decline, copy-only, symlink-only, hook-only, mixed selection, suggestion plus manual entry, validation retry, final decline, and Ctrl+C at every prompt stage; prove they fail for missing onboarding rather than timeouts or symbolic key misuse.
- [ ] 2.10 Add CLI guidance/contract RED checks for prompt eligibility, canonical repository field subset, suggestion secrecy, user-supplied hooks, sanitized summaries, one final save, cancellation, and #316 separation; register them through existing CLI aggregate paths before production/guidance GREEN.

## 3. Implement the shared repository editor and onboarding GREEN

- [ ] 3.1 Implement a pure typed repository-configuration editor module with explicit field/scope descriptors, configured/unset state, immutable candidate mutation, sensitivity metadata, complete-candidate canonical normalization, field-attributed diagnostics, and sanitized summary projection; make tasks 2.1–2.3 GREEN without exposing unrelated fields.
- [ ] 3.2 Implement canonical copy/symlink adapters by delegating to existing materialization normalization/collision semantics, retain declaration order and manual dependency warnings, and remove any duplicated prompt-local parsing found during GREEN.
- [ ] 3.3 Implement canonical repository hook adapters for lifecycle selection, Bash shorthand, explicit interpreter variants, and selected-only values; centralize sensitive projection so raw/masked/truncated/encoded/hashed/length-derived hook data cannot reach public output.
- [ ] 3.4 Implement deterministic bounded canonical-checkout suggestion discovery using root metadata and Git ignore classification only; enforce explicit likely-local patterns, hard limits, no recursion/content reads, unselected results, non-fatal fallback, and `node_modules` exclusion.
- [ ] 3.5 Implement an injectable cancellation-aware onboarding controller on `lib/prompts.ts` outcomes with one eligibility predicate, default-no entry prompt, concise section selection, relevant-section retry, setup-script context without inference, and one final sanitized confirmation.
- [ ] 3.6 Integrate onboarding into `executeAdd` after repository/setup inspection and before config persistence; construct one complete normalized `RepoConfig`, preserve minimal behavior in every suppressed/declined mode, and keep prompt/discovery side effects outside JSON/non-TTY/force paths.
- [ ] 3.7 Refactor the expected-byte config persistence boundary only as far as needed for the concrete add consumer and #316 reuse; retain add transaction-lock ownership and ensure one save, no prompt-time writes, and exact unowned-byte preservation.
- [ ] 3.8 Update rollback ownership and final observation to compare the complete invocation-persisted repository entry and clean invocation-owned setup state in dependency order without weakening linked-worktree/branch/clone/managed-ignore safety.
- [ ] 3.9 Make all focused pure, discovery, controller, executor, transaction, rollback, regression, PTY, and secrecy REDs GREEN; run canary searches over captured output/contracts and perform sabotage runs against the pre-feature/minimal path to prove new tests fail without the intended behavior.

## 4. Update CLI guidance and generated contracts

- [ ] 4.1 Update maintained CLI add/configuration guidance and command help/contracts with concise optional-onboarding eligibility, default-no/minimal decline, canonical repository-only sections, content-free unselected suggestions, manual validation/warnings, user-supplied hooks, sanitized summaries, single-save/cancellation behavior, and #316 boundary.
- [ ] 4.2 Regenerate every owned CLI command/config/completion artifact through canonical generators, verify deterministic second-generation cleanliness, and keep JSON/config schema shapes unchanged except for approved metadata needed to describe existing command behavior.
- [ ] 4.3 Run CLI format, lint, typecheck/build, focused tests, complete test suite, generated-artifact checks, package checks, and applicable native POSIX/Windows test paths; record exact commands and results in the evidence ledger.

## 5. Establish and deliver docs RED/GREEN

- [ ] 5.1 Add and register docs semantic RED fixtures/checks for all onboarding invariants, generated Markdown/LLM discovery coverage, field/scope ownership, content secrecy, atomic/cancellation behavior, and #316 separation; prove existing stable docs aggregates reach the new checker and fail before prose changes.
- [ ] 5.2 Update canonical website onboarding, add-workflow, and configuration guidance proportionately; route detailed materialization/hook/rollback semantics to owning references and avoid generic schema-editor or existing-entry claims.
- [ ] 5.3 Regenerate agent-readable Markdown routes, `/llms.txt`, and `/llms-full.txt`; make focused and aggregate docs checks GREEN and verify a deterministic second generation leaves the worktree clean.
- [ ] 5.4 Run the docs repository's complete formatting, linting, type/build, package/deploy, freshness, and semantic aggregate gates; record exact results and hook-body canary absence.

## 6. Establish and deliver skills RED/GREEN

- [ ] 6.1 Add and register authored/extracted-package skill semantic RED fixtures/checks for the complete onboarding contract and source/package parity; prove both stable aggregates fail before guidance changes and retain maintainer fixtures outside the installable tree.
- [ ] 6.2 Update the smallest focused workspace/repository command reference and links to existing materialization/hook references; keep `SKILL.md` a router, use `aw`, avoid duplicated exhaustive semantics, and preserve direct-config guidance until #316 ships.
- [ ] 6.3 Build the canonical release archive, inspect exact membership, extract it through the maintained path, and make all source/package onboarding checks GREEN against the extracted `skills/arashi` subtree.
- [ ] 6.4 Run the skills repository's registration, formatting/linting, source aggregate, archive determinism/membership/extraction, package aggregate, security/publication-boundary, and diff gates; record exact results and canary absence.

## 7. Establish and deliver coordinated meta RED/GREEN

- [ ] 7.1 Add out-of-repository coordinated RED fixtures/checks covering every CLI/docs/export/skill normalized semantic, hook-body canary secrecy, generated-config-schema authority, approved descriptor subset, and #316 separation; prove the current child revisions fail for missing onboarding coverage without mutating child worktrees.
- [ ] 7.2 Register the coordinated checker in the existing fail-closed manifest and stable meta aggregate; add reachability/registry RED only where current topology lacks evidence and do not add feature-specific workflow stages when existing aggregates suffice.
- [ ] 7.3 Make coordinated fixtures/checkers GREEN against exact implementation child revisions, run meta unit/type/format/contracts gates and `openspec validate interactive-add-repository-configuration --strict`, and reconcile ledger coverage with every requirement/scenario family.
- [ ] 7.4 Run an independent semantic review over the complete OpenSpec artifact hash manifest and implementation contract surfaces, independently verify eligible findings, batch supported fixes by invariant, rerun affected RED/GREEN and aggregate gates, and require a fresh review if any reviewed artifact hash changes.

## 8. Open and validate child and proposal PRs

- [ ] 8.1 Self-review each repository diff for scope, security, prompt-injection resistance, hook-body secrecy, canonical-validator reuse, concurrency/rollback correctness, generated artifacts, and absence of drive-by changes before committing.
- [ ] 8.2 Commit and push CLI changes in `repos/arashi`, open a non-draft child PR with `Tracks corwinm/arashi-arashi#274`, cross-link #316 and companion PRs, and verify live head/base/files plus exact-head native/applicable CI and eligible review threads.
- [ ] 8.3 Commit and push docs changes in `repos/arashi-docs`, open a non-draft non-closing child PR with complete cross-links, and verify live head/base/files plus exact-head canonical generation/package/deploy/semantic CI and eligible review threads.
- [ ] 8.4 Commit and push skills changes in `repos/arashi-skills`, open a non-draft non-closing child PR with complete cross-links, and verify live head/base/files plus exact-head source/archive/package/security CI and eligible review threads.
- [ ] 8.5 Commit only OpenSpec/meta checker/evidence files in the coordinated parent, push the proposal/meta branch, open one non-draft proposal PR using `Tracks #274` (never a closing keyword), list #316 and all anticipated child PRs, and verify strict validation, exact head/base/files, coordinated CI, and eligible review threads.

## 9. Merge child PRs and archive safely

- [ ] 9.1 Immediately before each child merge, verify that child is open, non-draft, mergeable, exact-head green, and has zero unresolved eligible current-head review threads; merge children one at a time in dependency-safe order, verify merge SHA/branch deletion, and rerun coordinated evidence after any child-head change.
- [ ] 9.2 Refresh the meta branch against final child `main` revisions, update the evidence ledger and tasks only for completed evidence, rerun strict OpenSpec/meta/coordinated gates, and verify the meta PR remains open/non-draft/mergeable with zero unresolved eligible threads.
- [ ] 9.3 After every pre-archive task is complete, run `openspec archive interactive-add-repository-configuration --yes`, inspect and format synced canonical specs, replace any generated placeholder purpose, validate every touched capability directly, and confirm `openspec list --json` no longer reports the change.
- [ ] 9.4 Commit and push archive/sync output on the existing meta PR, change its sole issue reference from `Tracks #274` to `Closes #274`, rerun exact-head meta/coordinated gates against final child revisions, and recheck eligible review threads.
- [ ] 9.5 Merge the meta PR last, verify #274 closed while #316 remains open and correctly cross-linked, verify remote branch deletion and merged revisions, synchronize `main`, remove the coordinated worktree through `aw remove`, and confirm all base repositories are clean and current.
