## 1. Semantic Contract and Shared Executor RED

- [x] 1.1 Extend meta command/hook semantic checker fixtures first so controlled mismatches fail for option ownership, invocation-only policy, `tty|disabled|unavailable`, JSON precedence, immediate EOF, native-shell coverage, public-outcome stability, and the no-secrets warning; record RED before producer or consumer edits.
- [x] 1.2 Add failing typed CLI/help/contract/completion tests proving only create and remove expose `--no-hook-input`, the option is persisted false, does not skip hooks, remains distinct from `--no-hooks` and create `--interactive`, and generated `contracts/cli-commands.json` is stale until regenerated.
- [x] 1.3 Add failing unit tests for command-boundary input resolution covering TTY, `--no-hook-input`, `--json` precedence, non-TTY `unavailable`, dry-run non-execution, and direct executor callers.
- [x] 1.4 Add failing configuration/schema guards proving this slice does not accept or publish `hooks.input`.
- [x] 1.5 Add failing shared hook-environment tests proving every configured/standalone execution receives authoritative `ARASHI_HOOK_INPUT=tty|disabled|unavailable` and operation data cannot overwrite it.
- [x] 1.6 Add failing spawn tests proving `tty` inherits stdin, disabled/unavailable stdin produces immediate EOF, PowerShell omits `-NonInteractive` in every mode, cmd is reconciled to `/d /e:on /v:off /s /c call <encoded-path>`, and interpreter/path validation remains fail-closed.
- [x] 1.7 Add failing renderer tests proving interactive unterminated stdout/stderr is forwarded immediately to the corresponding parent stream while internal `HookResult` capture preserves exact stream bytes and ordinary shell text including blank lines and trailing newline runs; preserve public `LifecycleHookOutcome`, prefixed non-interactive, and capture-only quiet behavior.
- [x] 1.8 Add failing interruption/timeout tests proving input wait time is included in the existing timeout, no hook child survives timeout or signal termination, and current result/reason mapping remains intact.

## 2. Configured, Standalone, Wrapper, and Native RED

- [x] 2.1 Add failing configured create tests for workspace and repository-specific hook policy propagation, pre-input attribution fields, sequential prompts, no false workspace target, nonzero refusal, Ctrl-C cleanup, terminal reuse, and existing rollback boundaries.
- [x] 2.2 Add failing standalone create tests for targeted-before-shared global hooks, sequential attribution, TTY input, immediate EOF in disabled/unavailable modes, refusal, timeout, and rollback.
- [x] 2.3 Add failing configured remove tests across repository/workspace/global-targeted/global-shared scopes and multiple targets, proving exact target attribution, sequential input, pre-remove gate behavior, post-remove finalization/partial failures, timeout, Ctrl-C cleanup, terminal reuse, and no changed scope multiplicity.
- [x] 2.4 Add failing standalone remove tests for native input, explicit/non-TTY EOF, pre-remove gate, post-remove finalization, timeout, interruption, and unchanged confirmation/selection semantics.
- [x] 2.5 Add failing wrapper/entrypoint tests for `bin/arashi`, `bin/arashi.js`, `bin/arashi.ps1`, and `bin/arashi.bat`, proving eligible create/remove stdin survives packaging and forced remove with piped stdout while the existing list/fzf workaround remains intact.
- [x] 2.6 Add failing real built-CLI POSIX PTY tests proving an unterminated Bash prompt is visible before input, `read` accepts and refuses answers, Ctrl-C restores a usable terminal, timeout kills the hook, and exact stdout/stderr capture survives the command path.
- [x] 2.7 Add failing real CLI non-TTY and JSON tests proving accidental Bash reads receive EOF promptly, `--no-hook-input` still executes hooks, JSON from a TTY remains disabled, stdout is one document, internal capture remains correct, and no prompt byte or banner is streamed.
- [x] 2.8 Add failing Windows-native built-CLI tests for PowerShell `Read-Host`, cmd `set /p`, disabled/unavailable immediate EOF, timeout/interruption cleanup, and paths containing spaces plus `%`, `!`, `&`, and parentheses.
- [x] 2.9 Add or strengthen CI reachability checks so the terminal-capable Windows fixture runs on `windows-latest` and installed payload/wrapper acceptance runs where practical rather than silently skipping for non-TTY Actions stdin.

## 3. Core Implementation

- [x] 3.1 Add typed hook-input mode/resolution at create and remove command boundaries, register `--no-hook-input`, enforce JSON precedence in exported executors, and propagate policy without adding persistent configuration.
- [x] 3.2 Extend configured create, configured remove, and standalone create/remove orchestration so every `executeHook` receives the same command-wide input policy while preserving dry-run, hook ordering, outcome ledgers, and mutation boundaries.
- [x] 3.3 Extend the shared hook environment and runtime spawn seam for inherited versus immediate-EOF stdin; omit PowerShell `-NonInteractive` in every mode and reconcile cmd execution with the canonical encoded-path invocation.
- [x] 3.4 Implement completed pre-input attribution for TTY hooks and raw per-stream tee/internal capture; preserve existing public outcomes, prefixed non-interactive output, and quiet/JSON capture-only output.
- [x] 3.5 Preserve eligible stdin through POSIX, JavaScript, PowerShell, and batch package entrypoints without regressing the list/fzf workaround.
- [x] 3.6 Implement any shared signal forwarding and cleanup required by the RED tests without adding a new public outcome reason or changing existing create/remove rollback/finalization semantics.
- [x] 3.7 Run focused unit, configured/standalone integration, wrapper, real CLI PTY, JSON, and Windows fixture suites to GREEN, then refactor only while those suites remain green.

## 4. Generated Contracts and Examples

- [x] 4.1 Regenerate and verify the typed CLI contract, JSON export, help snapshots, and Bash/Zsh/Fish completions after option-policy tests are GREEN.
- [x] 4.2 Add failing init-example contract tests for `ARASHI_HOOK_INPUT`, native Bash/PowerShell/cmd input examples, availability checks, and the no-secrets warning before changing generated templates.
- [x] 4.3 Update init-generated configured examples and activation guidance, then exercise activated examples through real temporary configured commands on POSIX and native Windows.
- [x] 4.4 Verify generated artifacts are deterministic and package/release contents include the updated runtime contracts and examples.

## 5. Cross-Repository Guidance TDD

- [x] 5.1 Confirm the checker-first fixtures from 1.1 remain RED against stale CLI metadata, website guidance, generated exports, and packaged skill guidance before editing those consumers.
- [x] 5.2 Add failing `repos/arashi-docs` content/semantic tests for canonical create/remove hook-input guidance, the complete availability matrix, raw prompt behavior, timeout/interruption, JSON isolation, native shell examples, invocation-only policy, and security warning.
- [x] 5.3 Update canonical CLI/website documentation and regenerate agent-readable exports; run docs format, lint, build, link, and semantic checks to GREEN.
- [x] 5.4 Add failing `repos/arashi-skills` source and packaged-archive checks for `--no-hook-input`, `ARASHI_HOOK_INPUT`, immediate EOF, JSON precedence, native-shell examples, no persisted `hooks.input`, and no-secrets guidance.
- [x] 5.5 Update packaged Arashi skill guidance and generated exports, then verify both source and extracted package layouts against the semantic checker.
- [x] 5.6 Review `repos/arashi-vscode` consumers of generated command contracts; update and test only concrete option/help/completion surfaces that consume create/remove metadata.

## 6. Validation, Delivery, and Closeout

- [x] 6.1 Run final post-edit CLI formatting, lint, typecheck, complete tests, build, contract/schema/completion freshness, package smoke, POSIX PTY acceptance, and native Windows acceptance.
- [x] 6.2 Run final docs and skills formatting/lint/build/package gates plus the authoritative cross-repository semantic checker from a clean generated state.
- [ ] 6.3 Perform an independent read-only implementation review against every normative scenario; reconcile only approved-contract blockers and rerun affected final gates.
- [ ] 6.4 Commit and open affected child PRs with non-closing `Tracks corwinm/arashi-arashi#261` references and complete cross-links; require exact-head green CI and resolved review threads.
- [ ] 6.5 Merge CLI and any concrete child companion PRs in dependency order, release and verify the installed CLI supports the new option/environment/input behavior, then prove docs/skills claims against that released contract.
- [ ] 6.6 Mark all pre-archive tasks complete, archive and sync `interactive-hook-input`, replace generated Purpose placeholders, validate synced specs directly, and update the existing meta PR from `Tracks #261` to the sole `Closes #261` reference.
- [ ] 6.7 Merge the meta PR last, verify issue #261 closed, remove remote/local coordinated feature branches and worktrees, and confirm clean `main`/`origin/main` alignment across the configured workspace.
