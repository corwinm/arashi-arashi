## Context

Arashi routes configured create hooks through `repos/arashi/src/core/worktree.ts`, configured remove hooks through `repos/arashi/src/commands/remove.ts`, and standalone create/remove global hooks through `repos/arashi/src/lib/standalone.ts`. All paths converge on `executeHook` in `repos/arashi/src/lib/hooks.ts`, which currently spawns with stdout/stderr pipes and the runtime default stdin pipe. Arashi never writes or closes that pipe, so native reads can wait until the lifecycle timeout. The current line-buffered `streamOutput` also withholds an unterminated prompt until EOF.

The existing lifecycle contract already defines configured/standalone discovery, deterministic scope ordering, native Windows interpreters, a shared timeout, rollback/finalization, and structured outcome ledgers. This change must extend that executor boundary without changing command timing or scope semantics. JSON create/remove already execute hooks quietly and reserve stdout for one envelope, so their stdin policy must be explicit and fail closed.

## Goals / Non-Goals

**Goals:**

- Resolve one command-wide hook-input mode before hook execution: `tty`, `disabled`, or `unavailable`.
- Inherit stdin only when input is eligible, while closing stdin immediately in every other mode.
- Preserve exact captured hook stdout/stderr while displaying interactive bytes immediately.
- Keep every configured and standalone create/remove hook sequential and attributable before it can read input.
- Preserve timeout, signal, failure, rollback, finalization, dry-run, and structured outcome contracts.
- Exercise real Bash, PowerShell, and cmd input paths rather than only asserting spawn options.
- Keep docs, generated command contracts/examples/exports, packaged skills, and meta semantic checks aligned.

**Non-Goals:**

- Persistent `hooks.input` configuration in the initial slice.
- A prompt DSL, declarative questions, stored answers, GUI prompts, or secret handling.
- Parallel hook execution or changes to lifecycle ordering, scope multiplicity, target selection, rollback ownership, or dry-run execution.
- Making JSON or non-TTY automation interactive.

## Decisions

### Resolve input policy once at the command boundary

Create and remove will derive an input policy from explicit command intent and the real terminal:

1. `--json` or `--no-hook-input` selects `disabled`.
2. Otherwise, an available stdin TTY selects `tty`.
3. Otherwise, input is `unavailable`.

The selected policy is passed through configured and standalone orchestration into every `executeHook` call. Dry-run continues not to execute hooks, so no runtime input value exists. This keeps per-hook behavior consistent across scopes and targets and makes JSON authoritative. We will not add persistent configuration in this slice because an ephemeral safety/output-mode decision does not require a stored default.

Alternative considered: let `executeHook` inspect `process.stdin.isTTY` independently. Rejected because lower-level inspection cannot distinguish explicit disabling or reliably enforce JSON policy for direct executor callers.

### Use inherited stdin for TTY mode and the null device for all other modes

`tty` hooks spawn with stdin inherited. `disabled` and `unavailable` hooks spawn with stdin ignored, which connects the platform null device and therefore produces immediate EOF rather than an unwritten pipe. `buildHookEnvironment` receives the resolved mode and always exports `ARASHI_HOOK_INPUT`.

Alternative considered: retain a pipe and call `end()`. Rejected because inherited native terminal behavior is the feature, and null-device stdin is simpler and fail-closed for automation.

### Make native PowerShell invocation input-aware

All `.ps1` hooks use system `powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File <path>`. TTY mode inherits stdin; disabled and unavailable modes connect stdin to immediate EOF. Omitting `-NonInteractive` in every mode gives `Read-Host` one testable native-input contract: it reads from the terminal in TTY mode and observes EOF otherwise.

Command scripts use the canonical `cmd.exe /d /e:on /v:off /s /c call <encoded-path>` invocation and receive inherited or ignored stdin according to policy. Implementation must reconcile the current runtime with the already-canonical encoded-path contract before claiming interactive cmd support. Interpreter resolution, path escaping, and no-`pwsh` rules remain unchanged.

Alternative considered: retain `-NonInteractive` outside TTY mode. Rejected because it turns native prompt input into a host-policy error rather than the ordinary immediate-EOF behavior shared by Bash and cmd.

### Tee interactive output as raw chunks while capturing the same bytes

The shared hook renderer will have two strategies:

- Non-interactive: retain current prefixed, line-oriented human output; quiet/JSON remains captured only.
- Interactive: print the attribution banner first, then forward stdout and stderr chunks to their corresponding parent streams as they arrive without adding prefixes or newlines, while accumulating those same chunks for the existing `HookResult` strings.

The capture path will accumulate each stream's raw byte chunks without rewriting them and decode once at stream completion for the existing `HookResult` string projection, preserving ordinary shell text exactly, including internal blank lines and trailing newline runs. The display path writes each original chunk immediately, so prompts without a newline appear before input is read. Public `LifecycleHookOutcome` locations and schemas do not gain stdout or stderr fields.

Alternative considered: prefix each chunk. Rejected because prefixes can corrupt unterminated prompts and split multibyte text or terminal control sequences.

### Attribute before yielding input and preserve sequential execution

Before spawning a `tty` hook, Arashi emits a human-only banner containing logical lifecycle, scope, absolute source script path, and target repository/worktree or workspace identity. The banner completes before the child receives inherited terminal stdin. Existing `for`/await orchestration remains sequential; no hook process for a later scope or target starts until the current process exits.

JSON, disabled, and unavailable modes emit no interactive banner. Existing non-interactive summaries/prefixes remain available.

### Preserve eligible stdin through package entrypoints

Input availability is resolved from the stdin that reaches the CLI. POSIX and Windows package wrappers must therefore preserve stdin for create/remove invocations that can execute hooks. The existing list/fzf workaround may still close stdin where required, but forced remove with non-TTY stdout must not discard otherwise-eligible terminal input before hook policy is resolved. Wrapper and built-binary tests cover the shell, JavaScript, PowerShell, and batch entrypoints.

### Keep timeout and interruption inside the existing lifecycle boundary

Inherited-input waiting remains part of the current lifecycle timeout. Timeout, nonzero exit, and signal termination continue through the existing hook result and command-specific rollback/finalization paths. Arashi will detach no terminal mode of its own; PTY/native tests must nevertheless prove parent terminal usability and no surviving hook process after timeout or Ctrl-C. Any necessary signal forwarding will be implemented at the shared executor boundary without inventing a new public hook-outcome reason code in this slice.

### Test the public CLI path on every supported shell family

POSIX tests will spawn the built CLI in a real PTY and prove prompt visibility before input, accepted and declined answers, timeout, Ctrl-C, non-TTY EOF, `--no-hook-input`, JSON isolation, exact output capture, and sequential attribution. Windows-native CI will run built-CLI fixtures for PowerShell `Read-Host` and cmd `set /p`, plus ignored-stdin EOF. Unit tests will cover policy resolution, environment values, interpreter argv, raw capture, and command-option/generated-contract propagation, but cannot substitute for native integration evidence.

### Treat companion artifacts as one semantic contract

The CLI's typed option registry and generated `contracts/cli-commands.json` remain the producer for create/remove option metadata. Init-generated examples, canonical website pages, generated agent exports, and packaged skill guidance will document the same availability matrix and secret warning. A meta-level semantic checker will compare required values, option ownership, JSON precedence, and companion guidance; checker tests must demonstrate RED before consumer edits.

## Risks / Trade-offs

- [Risk] Raw interactive stdout and stderr can interleave nondeterministically. → Mitigation: preserve each stream's exact capture independently, do not promise cross-stream total ordering, and attribute the hook before execution.
- [Risk] A hook can change terminal modes or mishandle Ctrl-C. → Mitigation: avoid modifying terminal state in Arashi, forward/terminate through the shared executor, test parent-terminal recovery, and document hooks as trusted programs.
- [Risk] Inherited stdin lets trusted hooks read whatever the user types. → Mitigation: input is human-TTY-only, can be disabled per invocation, is forbidden in JSON/non-TTY modes, and docs warn against entering passwords or secrets.
- [Risk] Direct executor callers could bypass Commander policy. → Mitigation: represent input policy in exported options/types and resolve/enforce JSON disabling inside create/remove executors before orchestration.
- [Risk] Existing tests inject prompt handlers while no real TTY exists. → Mitigation: separate command-selection prompt injection from lifecycle-hook TTY evidence and add explicit test dependencies for stdin TTY policy where unit seams require them.
- [Risk] Windows behavior may appear green from mocked argv alone. → Mitigation: require native Windows built-CLI tests for both PowerShell and cmd input and unavailable-input EOF.

## Migration Plan

1. Add failing policy, environment, spawn, output-capture, CLI-option, and semantic-checker tests.
2. Implement shared input resolution and executor behavior, then propagate it through configured and standalone create/remove.
3. Add built CLI PTY/native integration coverage and preserve existing lifecycle regression suites.
4. Regenerate command contracts/examples and update docs/exports/skills only after their checkers fail against stale content.
5. Merge and release the CLI child before merging companion guidance that claims the feature is available; archive and sync OpenSpec last.

Rollback removes the new option and shared input-policy propagation. Because there is no persisted configuration migration, rollback leaves no stored-state conversion.

## Open Questions

None for proposal approval. Persistent `hooks.input` policy is intentionally deferred to a separately justified change.
