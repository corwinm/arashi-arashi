# Worktree file materialization implementation evidence

## Approved baseline

- Approval: Corwin authorized apply in Discord message `1538626342201983067` on 2026-08-16.
- Coordinated branch: `issue-273-worktree-materialization`.
- Meta proposal head: `c9e5bf7a597763c60a0f80a836f8184d7eff0ae0`.
- CLI start: `ab016c99e54a32291336a98beaa147e65410b495`.
- Docs start: `cab06971b0ba50fa87f29e328e568190655b8451`.
- Skills start: `2ae32053830b8217d08e325a46173cb13d4017ed`.
- HTTPS refresh verified every affected child `HEAD == origin/main`; all affected worktrees were clean.
- `arashi pull` was attempted first and failed before mutation because this host's SSH key was unavailable. Public HTTPS fetches established the current `origin/main` revisions without pushing untouched branches.

## RED/GREEN acceptance ledger

This table is completed with exact file names, commands, observed RED causes, GREEN results, and native/CI reachability before production implementation advances.

| Contract boundary | RED test/command | Native/CI reachability | RED evidence | GREEN evidence |
| --- | --- | --- | --- | --- |
| Repository config, normalization, persistence, schema | `CI=true corepack pnpm --ignore-workspace exec vitest run tests/unit/config.materialization.test.ts tests/unit/config-materialization-schema.test.ts --reporter=dot`; `... exec tsc --noEmit --pretty false` | CLI test matrix | RED: configuration/schema suite exits 1 for unknown direct fields and missing generated properties; typecheck exits 2 only for missing `RepoConfig.copy`/`symlink` | GREEN: focused configuration/schema/projection/planner/preflight coverage included in final focused materialization/lifecycle slice (10 files, 125/125 tests); typecheck and post-commit `schema:check` passed |
| Git-primary source projection and path planner | `... vitest run tests/integration/materialization-repository-projection.test.ts`; `... vitest run tests/unit/materialization-planner.test.ts` | CLI test matrix | RED: projection 4/4 fails at missing config/source projection; planner 15 tests fail at missing `planRepositoryMaterialization` export | GREEN: final focused materialization/lifecycle slice passed 125/125 including unusable primary, linked-worktree rejection, containment, cycle, and target-tree cases |
| Portable path aliases and target-tree conflicts | config/planner focused suites plus `tests/unit/commands/create-materialization-precedence.test.ts` | Exact-head macOS/Linux/Windows validation and native-materialization matrix | RED: portable alias expectations receive unknown-field diagnostics; target-tree/planner export absent; precedence test reaches managed create and returns 0 instead of `MATERIALIZATION_PLAN_BLOCKED` before ignore mutation | GREEN: portable aliases/collisions and fail-before-managed-ignore precedence passed in the final focused materialization/lifecycle slice (10 files, 125/125 tests) |
| Native copy/symlink and ownership ledger | `CI=true corepack pnpm --ignore-workspace exec vitest run tests/integration/materialization-runtime.test.ts --reporter=dot`; `node --experimental-strip-types tests/native/materialization-native.ts bin/arashi.bin` | New `materialization-native` job consumes built Linux x64, macOS arm64, and Windows x64 artifacts | RED: 18 runtime cases fail only at missing `materializeRepository` / `materializationToDoctorFindings` exports; built macOS CLI reaches one canonical JSON `CONFIG_VALIDATION_ERROR` for absent direct fields after fixture Git signing was disabled | GREEN: runtime ownership/materializer suite passed, built macOS acceptance passed, and Linux/macOS/Windows built-artifact execution is wired in CI |
| Configured create lifecycle, hooks, dry-run, output, rollback/removal | `... vitest run tests/integration/materialization-create-output-doctor.test.ts --reporter=dot`; native built-CLI script | Existing CLI process suites plus three-platform built-artifact matrix | RED: 7 process cases reach the real CLI and fail at the absent direct config contract; precedence fixture separately proves create currently mutates past the missing preflight seam | GREEN: real configured create/output/doctor suite passed, including lifecycle order, `--no-hooks`, human/JSON, partial failure, rollback, and removal safety |
| Doctor finding contract | runtime closed-finding fixtures plus create/output/doctor real-process suite | CLI matrix plus native exact-link doctor check | RED: helper fixtures fail at missing `materializationToDoctorFindings`; real doctor reports only `CONFIG_LOAD_FAILED` because materialization fields are absent | GREEN: exact closed finding mapper and real doctor process tests passed, including unavailable primary and exact-target/containment diagnostics |
| CLI maintained documentation | `corepack pnpm --ignore-workspace quality:changed`; complete CLI test command | CLI aggregate | GREEN: CLI README/configuration guidance shipped in CLI commit `21fd994` and changed-file lint/full CLI validation passed | GREEN: coordinated contract and stable-entrypoint fixtures passed 39/39 and the live checker passed against final child heads |
| Website docs and generated agent exports | `node scripts/check-worktree-materialization-docs.ts --self-test-only`; `pnpm validate:worktree-materialization-docs`; `pnpm validate:semantic-docs`; `pnpm validate` | Registered docs aggregate/CI | Checker fixtures/registration GREEN; unchanged canonical/generated content RED only at the new checker | GREEN: focused checker, 16-checker aggregate, sync/export freshness, lint, build (47 pages), internal links, accessibility, domain, and README-link gates passed after final docs/generator edit |
| Authored and extracted-package skills guidance | `node scripts/materialization-guidance-selftest.mjs`; `node scripts/validate-guidance.mjs`; extracted archive aggregate with `--skill-root` | Registered source/package aggregates | 2 valid controls and 20 drift controls GREEN; unchanged source and extracted package each RED exactly at the new checker | GREEN: source and extracted package aggregates 15/15, canonical 22-member archive/path boundary, workflow composition, and security gate (0 findings) passed |
| Coordinated schema/guidance parity | `corepack pnpm exec vitest run tests/worktree-materialization-contracts.test.ts tests/semantic-validation-entrypoints.test.ts --reporter=dot`; `node --experimental-strip-types scripts/check-worktree-materialization-contracts.ts --json` | Registered meta stable aggregate plus local/CI runners | Checker/self-test GREEN: 28 tests; real coordinated RED: schema plus six maintained/generated/source/package guidance surfaces report exact `MATERIALIZATION_*` diagnostics | GREEN: coordinated contract and stable-entrypoint fixtures passed 39/39; live cross-repository checker and strict OpenSpec validation passed against final child heads |

## Delivered child revisions and pull requests

- CLI: `6cbf536c56ec3a82c0455cb6df942c8a88756554` — https://github.com/corwinm/arashi/pull/144
- Website/docs: `ccb87336257f429734ce711c90325a010f05684b` — https://github.com/corwinm/arashi-docs/pull/80
- Skills: `d54ff4a360438873ff942188d526ffa3447f0283` — https://github.com/corwinm/arashi-skills/pull/63
- Proposal/meta: https://github.com/corwinm/arashi-arashi/pull/296

## Merged child revisions and pre-archive validation

- CLI PR #144 was squash-merged first as `d1372c4f3a17f0d65a71e7584bf017b609d366e0`; its remote feature branch was deleted.
- Website/docs PR #80 was squash-merged second as `7f7fc72369d82f8b93bdc2e2a4d233b48375a88b`; its remote feature branch was deleted.
- Skills PR #63 was squash-merged third as `c3596d73cb9016fe62d30509b8f84b6c0d940330`; its remote feature branch was deleted.
- The coordinated contract fixtures passed 39/39 against those three merged `main` revisions, the live checker returned `diagnostics: []`, and strict validation reported `Change 'worktree-file-materialization' is valid`.
- Meta PR #296 was squash-merged as `d1c60fd6e4099f5c76211f3638659e9b7a815741` before the archive output was committed. Archive output and the sole `Closes #273` linkage are therefore being delivered in a focused follow-up meta PR before final cleanup.

## Final local validation before child delivery

- CLI final focused materialization/lifecycle slice: 10 files, 125/125 tests passed.
- CLI exact-head Ubuntu test matrix: 164 files passed, 2 skipped; 2,226 tests passed, 16 skipped. The final local complete test command also passed.
- CLI typecheck, changed-file quality (0 errors), build, generated schema freshness, and built native macOS acceptance passed.
- Website docs: all 16 registered semantic checkers, Astro diagnostics/build (47 pages), internal links, accessibility, canonical-domain, and README-link validation passed.
- Skills source aggregate and extracted canonical package aggregate passed 15/15; archive, workflow-composition, and security gates passed with zero findings.
- Coordinated contract and stable-entrypoint fixtures passed 39/39; the live cross-repository checker passed; strict OpenSpec validation passed.

## Exact-head automated review reconciliation

- CLI independent bounded reviews passed after correcting local-branch-only reusable target selection, managed-worktree doctor containment (including custom `worktreesDir`), Windows-invalid path characters, missing-repository configuration loading, dry-run conflict parity, and destination-filesystem native-symlink capability preflight with operational-error propagation and fail-closed non-regular source handling. Every verified CLI finding was reproduced or traced against real execution before correction.
- Docs independent bounded reviews passed after the semantic checker gained active/passive standalone detection, contractions and shared negation, materialization-local glob/remapping scope, hard-contrast and elided-subject parsing, and exact-count controls for repeated affirmative contradictions.
- Skills review follow-ups preserve action-local/shared negation and reject contradictory coordinated claims; authored and extracted package aggregates passed.
- Every eligible verified review thread was replied to with commit/test evidence and resolved. Review inspection found zero unresolved eligible CLI threads after `6cbf536`; docs thread resolution was recorded after `ccb8733`.

## Exact-head CI and review gates

- CLI PR #144 passed its exact-head gate at `6cbf536c56ec3a82c0455cb6df942c8a88756554` with zero unresolved review threads. Final local focused validation passed 125/125; the complete local test command, typecheck, changed-file quality, build, schema freshness, and native macOS acceptance passed. Exact-head run `32004433257` passed every Linux/macOS/Windows test, build, validation, installer, hook-input, and native-materialization job; its Ubuntu matrix reported 164 files passed, 2 skipped, with 2,226 tests passed and 16 skipped. It was squash-merged first as `d1372c4f3a17f0d65a71e7584bf017b609d366e0` and its remote feature branch was deleted.
- Docs PR #80 passed its exact-head gate at `ccb87336257f429734ce711c90325a010f05684b` with zero unresolved review threads; complete local validation, final bounded reviews, and exact-head run `32001777954` passed. It was squash-merged second as `7f7fc72369d82f8b93bdc2e2a4d233b48375a88b` and its remote feature branch was deleted.
- Skills PR #63 passed its exact-head gate at `d54ff4a360438873ff942188d526ffa3447f0283` with zero unresolved review threads; source/extracted aggregates and the package security gate passed. It was squash-merged third as `c3596d73cb9016fe62d30509b8f84b6c0d940330` and its remote feature branch was deleted.
- Proposal/meta PR #296 passed its exact-head contract gate at `fb34156f2716f1bb4819933fb4e95edc497344f3` with zero unresolved review threads. It was then squash-merged as `d1c60fd6e4099f5c76211f3638659e9b7a815741` before the archive output was committed, and its remote feature branch was deleted. Its non-closing `Tracks #273` linkage did not close the issue; the focused archive follow-up PR owns the sole `Closes #273` linkage.
