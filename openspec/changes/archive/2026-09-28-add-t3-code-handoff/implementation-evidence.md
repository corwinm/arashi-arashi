# Implementation Evidence

## Delivered surfaces

- `repos/arashi` implements the optional `aw create --t3` adapter, pre-mutation input and compatibility validation, explicit full-access/no-UI bridge arguments, private prompt staging, structured outcomes, and durable retry receipts.
- `repos/arashi-docs` documents the command contract, bridge compatibility, main-to-feature workflow, result stages, and recovery procedure.
- `repos/arashi-skills` packages focused command and workflow guidance plus source/package validation for the safety-critical handoff contract.
- The meta-repository audits the new permission choice and retains the proposal, design, capability deltas, tasks, and this evidence. No `repos/arashi-vscode` change was needed because the existing command-contract ownership policy already covers `create` without exposing its CLI-only options as editor commands.

## Compatibility evaluation

The published `@bvdm/t3code-cli@0.1.2` archive was inspected rather than installed at runtime. Its declared Node range is `^22.16 || ^23.11 || >=24.10`; the package reports bridge version `0.1.0`, and its stable JSON handover contract supports the required folder/current-checkout, project policy, open mode, permission mode, prompt-file, and working-directory arguments. Arashi accepts the compatible reported `0.1.x` line and gives pinned installation guidance; it never downloads a moving dependency during `aw create`.

## Validation

### Arashi CLI

- Formatting and diff checks passed.
- Lint passed with the repository's pre-existing warning set and no errors.
- Typecheck, command-contract freshness, completion freshness, and build passed.
- Focused handoff/create tests passed: 67 tests.
- The broader affected surface passed: 443 tests, with 89 repository-defined skips.
- The complete suite was run with color-forcing removed so output assertions match the normal environment: 3,372 passed, 107 skipped, and one failed across 224 files. The only failure is the existing macOS `tests/integration/finish.test.ts` case `projects a real partial descendant removal without leaking a Git error`; the same status-code mismatch reproduces from the clean original `main` checkout.

### Documentation

- `pnpm validate` passed, including formatting, semantic documentation checks, external-link validation, Astro checking/build, link/a11y checks, domain validation, and README validation.

### Packaged guidance

- Source guidance validation passed: 21/21 checkers.
- The security gate passed with zero findings.
- Canonical release archive creation and verification passed with 28 members.
- Guidance validation against the freshly extracted package passed: 21/21 checkers, including the T3 handoff checker.

### Meta and cross-repository checks

- Meta formatting, typecheck, and unit tests passed: 377 tests.
- Strict OpenSpec validation passed.
- The applicable cross-repository command-contract assessment passed.
- The aggregate meta contract command is environment-limited in this coordinated workspace because `repos/arashi-presentation` was not included; the failing provenance check passes in the original complete checkout. Meta integration tests are unavailable for the same missing repository and report that requirement explicitly.

## End-to-end coverage boundary

No new live bridge dispatch was performed because `t3code` is not installed in this validation environment. The available manual spike establishes successful coordinated workspace creation and T3 project/thread dispatch on macOS with Arashi 1.36.0 and T3 server 0.0.42; it also establishes that browser opening can fail independently with an unpaired-browser screen. Windows, Linux, and mobile end-to-end behavior remains untested and is not claimed.

## CI and review follow-up

The CLI review identified eight cases addressed by commits `1c8fa64`, `99aebb2`, `ad7d69f`, and `12135ad`: optional-valued completion parsing, preserving proven remote success after receipt-storage failure, preserving bridge failures after receipt-storage failure, keeping prompt cleanup errors separate from the dispatch outcome, blocking dispatch after move failures, syncing receipt-directory metadata before dispatch on POSIX, reporting retained prompts after setup errors, and reporting lock-release failures with automatic retry disabled. Regression coverage includes generated shell completion behavior and injected filesystem failures. Human output and JSON recovery details retain actionable cleanup information without losing known project/thread IDs.

Native Windows execution exposed a PowerShell security-module autoload failure in `Get-Acl`. The adapter now uses the Windows PowerShell .NET filesystem ACL methods directly, avoiding that module dependency while preserving owner-only permissions. A native-permissions dispatch test exercises the real platform implementation.

The focused completion/handoff suite passed 322 tests (93 platform skips), and the final handoff/create suite passed 77 tests. Lint, typecheck, build, and canonical documentation validation passed. The full local suite after rebasing passed 3,361 tests with 111 skips and the same previously documented macOS `finish` failure.

## Delivery state

The change is delivered as separate pull requests for the [CLI implementation](https://github.com/corwinm/arashi/pull/202), [canonical documentation](https://github.com/corwinm/arashi-docs/pull/117), [packaged guidance](https://github.com/corwinm/arashi-skills/pull/82), and coordinating meta-repository artifacts. Each pull request references the originating issue and the complete related set.

All four PRs passed their required checks before archive preparation, including Linux and Windows tests and builds/native acceptance on Linux, macOS, and Windows. The eight Codex review findings were addressed and resolved.

The user explicitly requested archiving and pushing this change before merge after validation was complete, superseding the original post-merge archive timing. The implementation PRs remain open; archiving does not imply they have merged.
