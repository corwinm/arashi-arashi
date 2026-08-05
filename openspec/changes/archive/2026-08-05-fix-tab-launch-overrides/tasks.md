## 1. Contract and RED Coverage

- [x] 1.1 Add switch resolver and command-contract tests proving `--tab` alone bypasses configured sesh/Herdr while explicit launcher composition remains authoritative.
- [x] 1.2 Add Windows environment-normalization tests for mixed-case `PATH` keys, duplicate path casing, and undefined values.
- [x] 1.3 Extend cross-repository tab-policy fixtures with the configured-launcher override and prove missing docs/skills wording is diagnosed.

## 2. CLI Implementation

- [x] 2.1 Make explicit `--tab` opt out of configured launch defaults without changing no-flag behavior.
- [x] 2.2 Canonicalize Windows path-key casing in the shared spawn-environment normalizer before detached launcher processes run.
- [x] 2.3 Update `--tab` help and CLI semantic metadata, then regenerate `contracts/cli-commands.json`.

## 3. Companion Surfaces

- [x] 3.1 Update Arashi docs to state that `--tab` bypasses configured launch defaults and `--no-default-launch` is redundant.
- [x] 3.2 Update the Arashi skill guidance with the same precedence and explicit-launcher composition rules.
- [x] 3.3 Extend docs, skills, and meta-repository policy checks so the configured-launcher override cannot silently drift.

## 4. Verification and Delivery

- [x] 4.1 Run focused and full CLI tests, typecheck, lint, formatting, contract checks, quality checks, and builds.
- [x] 4.2 Build the Windows binary and verify `switch --tab` from Git Bash on `win-test` with configured sesh and an installed Windows Terminal profile.
- [x] 4.3 Run full docs validation, all skill self-tests, strict OpenSpec validation, and meta-repository tests/typecheck/contracts.
- [x] 4.4 Commit child repositories, open linked child PRs, update the coordination PR, and verify CI status.

## 5. Create Tab Consistency Follow-up

- [x] 5.1 Add RED resolver and contract tests proving `create --tab` bypasses configured launchers while explicit create launcher selectors remain authoritative.
- [x] 5.2 Update create resolution, help, generated metadata, docs, skill guidance, and cross-repository drift checks.
- [x] 5.3 Rerun complete child/meta validation, push the existing PRs, and verify replacement CI on every updated head.
