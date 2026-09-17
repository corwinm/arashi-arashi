# Implementation Evidence

This evidence is for child commit `acc262462709ce2d3bc549b84f22647c1b201816` in `repos/arashi`. It does not claim a pushed branch, child PR, remote CI, independent exact-head review, merge, or archive; tasks 5.2, 5.3, and 5.4 remain open.

## Final blocker TDD

Preserved RED evidence: `/private/tmp/issue372-final-blockers-red.log`.

The first blocker run failed exactly three tests (**3 failed, 43 passed**):

- `status --local cannot read or reveal a file remote's bare HEAD` exposed the remote bare repository's `secret-default` branch through production `file://`-remote filesystem parsing.
- `an explicit configured base stays available while symbolic default HEAD remains unresolved` showed the configured base being relabeled as the remote default, with freshness incorrectly `true`.
- `status fixture retains the exact base topology with local symbolic remote HEADs` showed fixture definition v4 where v5 local remote-tracking symbolic HEAD state was required.

A separate RED source guard failed (**1 failed, 6 passed**) on `default detection contains no Git-internal filesystem parser`, identifying direct `.git/refs`, `.git/HEAD`, and conventional-branch filesystem inspection in `detectDefaultBranch()`.

Additional harness REDs in the same log proved that fixture-owned `baseBranch: "main"` and the fixture-v5 measured baseline could not yet pass the strict probe-budget validator. The production and harness corrections followed those failures; no failing assertion was weakened to normalize or remove a status field.

Focused GREEN evidence:

- `/private/tmp/issue372-final-blockers-green.log`: **6 files, 79 tests passed** for the production parser/default-resolution corrections.
- Final benchmark-focused run at child HEAD: **14 files, 61 tests passed**.
- The regression now proves `status --local` neither reveals the remote bare repository's secret default nor modifies/touches its storage; the complete probe audit ledger is asserted.
- Configured base and remote default remain independent: a valid explicit base is available while an absent symbolic remote default remains unresolved and freshness stays `false`.

## Production static audit

The final production search found **zero** direct content reads/parsers of `.git`, gitfiles, `commondir`, `HEAD`, `refs/`, `packed-refs`, or `objects`. It also found **zero** occurrences of `if (!defaultRef && base)` or `defaultRef = base`.

Repository-marker existence checks (`stat(..., ".git")` / `.exists()`) and initialization paths remain outside this prohibition and do not parse Git storage. No production code reads Git internal files to derive repository identity, refs, objects, or default branches. Remote default resolution is ledgered Git plumbing only: `git symbolic-ref --quiet --short refs/remotes/<remote>/HEAD`, plus the already captured local ref/config snapshot.

## Final verification

- Full suite: **220 files passed, 2 skipped; 3093 tests passed, 17 skipped; 281.58 s** (`/private/tmp/issue372-final-full-test-green-v6.log`).
- `pnpm lint` completed successfully with repository warnings and no errors (`/private/tmp/issue372-final-lint-v6.log`).
- `pnpm format:check`, `pnpm typecheck`, `pnpm contract:check`, `pnpm schema:check`, `pnpm completion:check`, and `git diff --check` passed.
- Native build and Windows x64 cross-build passed.
- Built smoke passed: `./bin/arashi.bin --version` returned `1.36.0`; `./bin/arashi.bin status --local --json` exited zero (`/private/tmp/issue372-built-smoke-v6.json`).

## Immutable full-field probe comparison

Artifact: `/private/tmp/issue372-final-probe-comparison-v6.json`
SHA-256: `fb21c806347c532a0b5c646a910927a97183b130eb6a38ee554f06316fbc54b8`

| Fixture | Mode | Measured base | Candidate | Candidate named | Cap |
|---|---:|---:|---:|---:|---:|
| small | normal | 27 | 18 | 6 / repository | 7 |
| small | verbose | 30 | 21 | 7 / repository | 8 |
| large | normal | 57 | 54 | 6 / repository | 7 |
| large | verbose | 66 | 63 | 7 / repository | 8 |

The adapter compared every behavior-bearing status field without deleting or normalizing `baseBranch` or `defaultBranch`. Normal and verbose semantic parity passed. The verbose native-output hashes matched for each base/candidate pair. Named plus unattributed counts reconcile to every aggregate; candidate unattributed is zero in all four cases.

Fixture v5 gives both independently built binaries the same valid local `refs/remotes/origin/HEAD -> refs/remotes/origin/main` state and `baseBranch: "main"` before measurement. It does not mutate state between binaries. The stricter accepted budget remains pinned to the approved immutable v4 baseline (small 39/42, large 93/102; named main 13/14 and child 9/10): every candidate aggregate and named count is strictly lower and satisfies the 7/8 cap. The v5 measured base is also recorded rather than relabeled or normalized.

Provenance:

- immutable base commit: `b648825295a5c342b6920be0585711678377b452`
- base binary SHA-256: `315247f34a8efa5ffa73def37b7c3df557f2fb4075b77978fb8259c1440674d1`
- candidate commit: `acc262462709ce2d3bc549b84f22647c1b201816`
- candidate binary SHA-256: `41b3e599ca179ef75e38aa094d714baf73db991dce384d125701d06d90a3d479`
- adapter SHA-256: `ead8f74a083910fe15eade8e97f6991e4fba2d561a1aa4acb9a803b1b7b6eb14`
- fixture definition: v5, source SHA-256 `565a5a1299f407a823f0344514a4254c8119618589808dfddeddf0d7ec4c2fdd`
- boundary: independently built compiled public CLI executables, `status [--verbose] --json`, same adapter process and same fixture instance, one warm-up and one traced sample per binary/case
- symbolic HEAD setup: every `file://` bare remote `HEAD` is `refs/heads/main`, and every local repository has `refs/remotes/origin/HEAD -> refs/remotes/origin/main`, before either binary runs
- toolchain: Bun 1.3.14, Git 2.54.0 (Apple Git-157), Node v24.21.0, pnpm 11.22.0, Darwin arm64 27.0.0

## Changed child files

- `scripts/benchmark/compare-probe-budget.ts`
- `scripts/benchmark/fixtures.ts`
- `scripts/benchmark/probe-budget.ts`
- `scripts/benchmark/run.ts`
- `src/core/repository.ts`
- `src/lib/git-probe-context.ts`
- `src/lib/status-probe.ts`
- `tests/benchmarks/fixtures.test.ts`
- `tests/benchmarks/probe-budget.test.ts`
- `tests/benchmarks/probe-comparison.test.ts`
- `tests/benchmarks/runner.test.ts`
- `tests/integration/handoff.test.ts`
- `tests/integration/json-cli-output.test.ts`
- `tests/unit/core/repository.test.ts`
- `tests/unit/status-probe-context.test.ts`

Exact-head independent review remains outstanding, so task 5.2 is intentionally unchecked. Tasks 5.3 and 5.4 also remain unchecked.
