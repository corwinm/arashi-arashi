## 1. Complete CLI RED matrix

- [x] 1.1 Add failing repository-local tests that enumerate the root plus current Commander tree and require completion metadata for every public command path, subcommand, option, built-in help/version option, alias, argument, description, declared choice, conflict, dynamic candidate classification, and hidden-surface exclusion.
- [x] 1.2 Add failing deterministic generation/freshness tests for Bash, Zsh, and Fish artifacts, including a fixture that changes canonical CLI metadata and proves stale completion output is rejected.
- [x] 1.3 Add failing real-process command tests for `arashi completion <bash|zsh|fish>`, unsupported/missing shell errors, stdout isolation, sourceability, and direct-versus-wrapper registration.
- [x] 1.4 Add failing clean-shell acceptance tests outside any Arashi workspace for root/nested commands, long options, short aliases, canonical descriptions with native display where supported, clean Bash candidate values, declared choices, declared conflicts, positional slots, `--`, hidden-surface exclusion, and shell-sensitive candidate insertion in Bash, Zsh, and Fish.
- [x] 1.5 Add failing protocol tests for exact argv/cursor transport and alternating NUL-terminated value/description records containing spaces, tabs, quotes, backslashes, glob characters, and newlines.
- [x] 1.6 Add failing read-only resolver tests for repeated/comma-segment `--only` repositories and `--group` groups; `switch [filter]` and `remove [target]` with and without `--path`; `move --from/--to`; supported-shell arguments; `create --conflict`; unclassified-slot rejection; prefix filtering; and one-query discovery reuse.
- [x] 1.7 Add failing real temporary-workspace tests proving outside/broken-workspace empty success, empty stdout/stderr on dynamic failure, no banners/prompts/warnings, no network or hooks, the documented 200 ms whole-query budget, and no tracked/untracked/ref/worktree/config mutation.
- [x] 1.8 Add a failing real-shell dynamic matrix for Bash, Zsh, and Fish that proves equivalent canonical candidate records inside a temporary workspace, native description display where supported, clean Bash candidate values, direct and wrapper invocation, static fallback outside a workspace, and no wrapper recursion.
- [x] 1.9 Add failing tests for exact Bash, Zsh, and Fish managed blocks with separate wrapper/completion activation lines, wrapper-only `shell init` output, wrapper-only and stale-pair block upgrades, repeated-install idempotency, outside-block preservation, actionable manual-setup errors, and parity between CLI-managed and release-installer-produced blocks.
- [x] 1.10 Add failing acceptance tests that build the standalone binary and install the packed npm artifact in clean fixtures, then exercise all three public completion commands from each distribution; the npm fixture MUST begin without a platform binary, use the canonical first-use installer against a local release fixture, and prove installer output cannot contaminate completion stdout.

## 2. Canonical model and static completion implementation

- [x] 2.1 Extend the typed command contract and schema with root/built-in, hidden, choice, conflict, and candidate policy; implement the shell-neutral completion model; and regenerate `contracts/cli-commands.json` until task 1.1 passes.
- [x] 2.2 Implement native Bash, Zsh, and Fish renderers, including conditional non-resetting Zsh `compsys` activation, until the static model and real-shell assertions in tasks 1.2 and 1.4 pass.
- [x] 2.3 Implement the deterministic artifact generator and build/check scripts, embed generated artifacts through the runtime build, and prove two unchanged runs are byte-identical and non-writing in check mode.
- [x] 2.4 Implement top-level `completion` registration, supported-shell validation, semantic classifications, and help/JSON policy as one coherent change until the pre-existing model and real-process assertions in tasks 1.1 and 1.3 pass.
- [x] 2.5 Regenerate and verify the CLI contract represents the public completion command and policy while explicitly excluding non-applicable VS Code mapping.

## 3. Dynamic completion implementation

- [x] 3.1 Implement the hidden internal query, alternating NUL record writer, and shell-neutral context parser until the exact transport and lossless protocol tests in task 1.5 pass.
- [x] 3.2 Implement memoized repository/group/worktree/branch/choice candidate resolvers by reusing existing read-only configuration, workspace, and local Git discovery helpers until task 1.6 passes.
- [x] 3.3 Add whole-query timeout handling and silent unavailable/discovery-failure boundaries, and prove the safety/performance/non-mutation matrix in task 1.7 passes.
- [x] 3.4 Extend each native adapter to invoke `command arashi` only for classified dynamic contexts until the pre-existing real-shell matrix in task 1.8 proves equivalent candidate sets and descriptions for direct and wrapper invocations without recursion.

## 4. Shell installation and distribution implementation

- [x] 4.1 Update `buildShellInstallBlock()`, installer messaging, `scripts/install.sh`, and related shell integration code so both block producers own the same wrapper and completion activation lines without changing parent-shell directive behavior.
- [x] 4.2 Run existing shell integration and switch directive regression suites alongside task 1.9 and confirm startup-file fixtures are fully restored.
- [x] 4.3 Wire completion generation/freshness and machine-only first-use completion handling into the applicable package/build/release paths and make task 1.10 prove npm-installed and standalone representative static/dynamic behavior agree.
- [x] 4.4 Inspect packed npm contents and compiled outputs, then verify generated-source ownership, no missing runtime artifact, and no unintended package files.

## 5. Coordinated docs and skills RED matrix

- [x] 5.1 Extend `tests/command-contracts.test.ts` and the meta command-contract checker with failing fixtures for supported shells, command shape, separate activation syntax, safety/dynamic scope, generated artifact identity, companion coverage, and intentional VS Code exclusion.
- [x] 5.2 Add failing CI reachability and deliberate-mismatch self-tests that prove the authoritative coordinated workflow must run CLI generation/freshness plus focused docs and packaged-skills completion checks without mutating real worktrees.
- [x] 5.3 Add or extend repository-local docs and skills semantic checkers so unchanged pre-feature guidance fails before content edits, including checks against generated and extracted release artifacts rather than source paths alone.

## 6. Coordinated docs and skills implementation

- [x] 6.1 Update the CLI README, `repos/arashi-docs/docs/commands/shell.md`, command index/navigation as required, and generated agent-readable exports with explicit Bash/Zsh/Fish manual and installed activation, dynamic scope, and troubleshooting guidance.
- [x] 6.2 Update the smallest owning `repos/arashi-skills/skills/arashi/references/*.md` surfaces, regenerate/package the skill artifact, and make source plus extracted-package checks pass.
- [x] 6.3 Implement the focused coordinated completion checker and workflow wiring until the deliberate mismatches fail for the intended diagnostics and the aligned source/release artifacts pass.

## 7. Final validation and delivery

- [x] 7.1 Run Arashi focused completion/shell/contract suites followed by format check, lint, typecheck, full tests, contract freshness, package inspection, and native plus cross-compiled standalone builds after the final CLI edit.
- [x] 7.2 Run `pnpm validate` and completion-specific source/generated checks in `arashi-docs`, plus repository-local and extracted-package validation in `arashi-skills`, after their final edits.
- [x] 7.3 Run meta formatting/diff checks, the focused completion contract suite, the complete command-contract suite, CI reachability self-tests, and strict `openspec validate add-shell-completions` after the final artifact edit.
- [x] 7.4 Open and cross-link the CLI, docs, skills, and meta PR set; verify each affected PR head and complete CI/review surfaces, with child PRs ready to merge before final OpenSpec archive and meta closeout.
