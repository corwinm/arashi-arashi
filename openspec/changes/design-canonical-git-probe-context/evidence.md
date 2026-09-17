# Implementation Evidence

This evidence is for child commit `4740d71962e5b93a23517df7545338d7a93e3bd7` in `repos/arashi`. It does not claim a pushed branch, child PR, remote CI, merge, or archive; tasks 5.3 and 5.4 remain open.

## TDD corrections

The preserved RED log is `/private/tmp/issue372-final-corrections-red.log`. Its exact summary was:

```text
Test Files  4 failed (4)
Tests  6 failed | 89 passed (95)
```

The six failures proved the intended corrections before implementation:

- `rejects full semantic status drift in baseBranch`: validator did not throw.
- `rejects full semantic status drift in defaultBranch`: validator did not throw.
- `configured tracking refresh does not become a guessed remote default`: expected freshness `false`, received `true`.
- `audit serialization is secret-free, append-only, and cleared on disposal`: the public entry lacked the `eventType: "probe"` discriminant.
- `no symbolic remote HEAD is not guessed from conventional branch names`: expected freshness `false`, received `true`.
- `ambiguous remaining symbolic remote HEADs are not guessed`: expected freshness `false`, received `true`.

A later full-suite RED caught an invalid remote-HEAD fallback design rather than being waived:

```text
Test Files  3 failed | 217 passed | 2 skipped (222)
Tests  4 failed | 3088 passed | 17 skipped (3109)
```

The failing cases were `dangling remote HEAD retains its intended missing default target`, `successful fetch with unresolved default stays false in JSON and human command output`, `status --local starts no transport or credential helper on the actual CLI path`, and `status preserves remote/default relationships, caller worktree, and verbose details`. The correction was narrowed to fixture `file://` remotes, leaving production unresolved/dangling and `--local` behavior unchanged.

## GREEN verification

- Focused status/context/JSON/standalone/benchmark matrix: **7 files, 198 tests passed**.
- Full suite: **220 files passed, 2 skipped; 3091 tests passed, 17 skipped; 280.82 s** (`/private/tmp/issue372-final-full-test-green.log`).
- `pnpm format:check`, `pnpm typecheck`, `pnpm contract:check`, `pnpm schema:check`, `pnpm completion:check`, native build, and Windows x64 cross-build passed.
- `pnpm lint` completed with **0 errors** (repository warnings remain).
- Child signature: `Good "git" signature for corwinm@users.noreply.github.com with ED25519 key SHA256:JcKdan5ZSo/Y2aTemQC5Z9eonUz27FF3y/OVB88YY3A`.

## Immutable full-field probe comparison

Artifact: `/private/tmp/issue372-final-probe-comparison.json`
SHA-256: `10712fe2f4374d6d2f2ebf6cbc6d89ee59123258793f50039c239c1cc5fff747`

| Fixture | Mode | Base | Candidate | Candidate cap |
|---|---:|---:|---:|---:|
| small | normal | 39 | 18 | 7 per named repository |
| small | verbose | 42 | 21 | 8 per named repository |
| large | normal | 93 | 54 | 7 per named repository |
| large | verbose | 102 | 63 | 8 per named repository |

The adapter compared complete semantic behavior without deleting or normalizing `baseBranch` or `defaultBranch`; normal and verbose semantic parity passed, and verbose native-output hashes matched for each pair. Named plus unattributed counts reconcile to every aggregate; candidate unattributed count is zero. Every candidate aggregate and named count is below base and within the cap.

Provenance:

- immutable base: `b648825295a5c342b6920be0585711678377b452`, binary SHA-256 `315247f34a8efa5ffa73def37b7c3df557f2fb4075b77978fb8259c1440674d1`
- candidate: `4740d71962e5b93a23517df7545338d7a93e3bd7`, binary SHA-256 `a8a72f2eb4c6e685e41bfda95c1e6023990dcaec0f02c0e46830c2c412e34a6b`
- adapter SHA-256: `83ff8fd594facb96eac8e2446e188d01b45e11c69219535ffb62d83d53930123`
- fixture definition: v4, source SHA-256 `41fb84a19dfaa9ddb9d8429df0ffccedf1a5718b919ae02b9d59c2a94737a7da`
- boundary: independently built compiled public CLI executables, `status [--verbose] --json`, same adapter process and same fixture instance, one warm-up and one traced sample per binary/case
- symbolic HEAD setup: fixture v4 sets every `file://` bare remote `HEAD` to `refs/heads/main` before push; neither binary receives a mutated local `refs/remotes/origin/HEAD`
- toolchain: Bun 1.3.14, Git 2.54.0 (Apple Git-157), Node v24.21.0, pnpm 11.22.0, Darwin arm64 27.0.0

## Changed child files

- `scripts/benchmark/compare-probe-budget.ts`
- `scripts/benchmark/fixtures.ts`
- `src/lib/git-probe-context.ts`
- `src/lib/status-probe.ts`
- `tests/benchmarks/probe-comparison.test.ts`
- `tests/integration/git-probe-context.test.ts`
- `tests/integration/json-cli-output.test.ts`
- `tests/integration/workspace-context.test.ts`
- `tests/unit/git-probe-context.test.ts`
- `tests/unit/status-probe-context.test.ts`

Exact-head independent review remains outstanding, so task 5.2 is intentionally unchecked.
