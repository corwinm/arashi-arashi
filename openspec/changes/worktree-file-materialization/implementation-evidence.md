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
| Repository config, normalization, persistence, schema | `CI=true corepack pnpm --ignore-workspace exec vitest run tests/unit/config.materialization.test.ts tests/unit/config-materialization-schema.test.ts --reporter=dot`; `... exec tsc --noEmit --pretty false` | CLI test matrix | RED: configuration/schema suite exits 1 for unknown direct fields and missing generated properties; typecheck exits 2 only for missing `RepoConfig.copy`/`symlink` | GREEN: focused configuration/schema/projection/planner/preflight coverage included in final 72/72 materialization suite; typecheck and post-commit `schema:check` passed |
| Git-primary source projection and path planner | `... vitest run tests/integration/materialization-repository-projection.test.ts`; `... vitest run tests/unit/materialization-planner.test.ts` | CLI test matrix | RED: projection 4/4 fails at missing config/source projection; planner 15 tests fail at missing `planRepositoryMaterialization` export | GREEN: final focused materialization suite passed 72/72 including unusable primary, linked-worktree rejection, containment, cycle, and target-tree cases |
| Portable path aliases and target-tree conflicts | config/planner focused suites plus `tests/unit/commands/create-materialization-precedence.test.ts` | macOS/Linux/Windows matrix pending native freeze | RED: portable alias expectations receive unknown-field diagnostics; target-tree/planner export absent; precedence test reaches managed create and returns 0 instead of `MATERIALIZATION_PLAN_BLOCKED` before ignore mutation | GREEN: portable aliases/collisions and fail-before-managed-ignore precedence passed in the final 72/72 suite |
| Native copy/symlink and ownership ledger | `CI=true corepack pnpm --ignore-workspace exec vitest run tests/integration/materialization-runtime.test.ts --reporter=dot`; `node --experimental-strip-types tests/native/materialization-native.ts bin/arashi.bin` | New `materialization-native` job consumes built Linux x64, macOS arm64, and Windows x64 artifacts | RED: 18 runtime cases fail only at missing `materializeRepository` / `materializationToDoctorFindings` exports; built macOS CLI reaches one canonical JSON `CONFIG_VALIDATION_ERROR` for absent direct fields after fixture Git signing was disabled | GREEN: runtime ownership/materializer suite passed, built macOS acceptance passed, and Linux/macOS/Windows built-artifact execution is wired in CI |
| Configured create lifecycle, hooks, dry-run, output, rollback/removal | `... vitest run tests/integration/materialization-create-output-doctor.test.ts --reporter=dot`; native built-CLI script | Existing CLI process suites plus three-platform built-artifact matrix | RED: 7 process cases reach the real CLI and fail at the absent direct config contract; precedence fixture separately proves create currently mutates past the missing preflight seam | GREEN: real configured create/output/doctor suite passed, including lifecycle order, `--no-hooks`, human/JSON, partial failure, rollback, and removal safety |
| Doctor finding contract | runtime closed-finding fixtures plus create/output/doctor real-process suite | CLI matrix plus native exact-link doctor check | RED: helper fixtures fail at missing `materializationToDoctorFindings`; real doctor reports only `CONFIG_LOAD_FAILED` because materialization fields are absent | GREEN: exact closed finding mapper and real doctor process tests passed, including unavailable primary and exact-target/containment diagnostics |
| CLI maintained documentation | Pending semantic checker command | CLI aggregate | GREEN: CLI README/configuration guidance shipped in CLI commit `21fd994` and changed-file lint/full CLI validation passed | GREEN: coordinated fixture/entrypoint suite passed 39/39 and live checker returned `{ diagnostics: [], ok: true }` against final child heads |
| Website docs and generated agent exports | `node scripts/check-worktree-materialization-docs.ts --self-test-only`; `pnpm validate:worktree-materialization-docs`; `pnpm validate:semantic-docs`; `pnpm validate` | Registered docs aggregate/CI | Checker fixtures/registration GREEN; unchanged canonical/generated content RED only at the new checker | GREEN: focused checker, 16-checker aggregate, sync/export freshness, lint, build (47 pages), internal links, accessibility, domain, and README-link gates passed after final docs/generator edit |
| Authored and extracted-package skills guidance | `node scripts/materialization-guidance-selftest.mjs`; `node scripts/validate-guidance.mjs`; extracted archive aggregate with `--skill-root` | Registered source/package aggregates | 2 valid controls and 20 drift controls GREEN; unchanged source and extracted package each RED exactly at the new checker | GREEN: source and extracted package aggregates 15/15, canonical 22-member archive/path boundary, workflow composition, and security gate (0 findings) passed |
| Coordinated schema/guidance parity | `corepack pnpm exec vitest run tests/worktree-materialization-contracts.test.ts tests/semantic-validation-entrypoints.test.ts --reporter=dot`; `node --experimental-strip-types scripts/check-worktree-materialization-contracts.ts --json` | Registered meta stable aggregate plus local/CI runners | Checker/self-test GREEN: 28 tests; real coordinated RED: schema plus six maintained/generated/source/package guidance surfaces report exact `MATERIALIZATION_*` diagnostics | Pending |

## Delivered child revisions and pull requests

- CLI: `21fd994609571e5fd51ee72571891755e0616311` — https://github.com/corwinm/arashi/pull/144
- Website/docs: PR https://github.com/corwinm/arashi-docs/pull/80 (open, mergeable, docs checks green at evidence refresh)
- Skills: `41acd58676321cb1bb81070543be71ed3a4f091d` — https://github.com/corwinm/arashi-skills/pull/63
- Proposal/meta: https://github.com/corwinm/arashi-arashi/pull/296

## Final local validation before child delivery

- CLI focused materialization: 7 files, 72/72 tests passed.
- CLI full suite: 162 files passed, 2 skipped; 2140 tests passed, 16 skipped.
- CLI typecheck, changed-file lint (0 errors), build, post-commit schema freshness, and built native macOS acceptance passed.
- Skills source aggregate and extracted canonical package aggregate passed 15/15; archive, workflow-composition, and security gates passed with zero findings.
- Coordinated checker/entrypoint suite passed 39/39; live checker passed; `openspec validate worktree-file-materialization` passed.
