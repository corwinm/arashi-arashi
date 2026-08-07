## ADDED Requirements

### Requirement: Hook input availability is explicit and fail-closed
Create and remove SHALL resolve one lifecycle-hook input mode for the command. A normal human invocation with terminal stdin and no disabling mode SHALL use `tty` and inherit terminal stdin. `--json` and `--no-hook-input` SHALL use `disabled` and connect every hook to immediate EOF. An invocation without terminal stdin SHALL use `unavailable` and connect every hook to immediate EOF. `--json` SHALL take precedence over every other input condition. Dry-run SHALL continue not to execute hooks.

#### Scenario: Human TTY enables native hook input
- **WHEN** a user runs create or remove from a terminal without `--json` or `--no-hook-input`
- **THEN** each executed lifecycle hook inherits terminal stdin
- **AND** its effective hook-input mode is `tty`

#### Scenario: Explicit disabling provides EOF
- **WHEN** a user runs create or remove with `--no-hook-input`
- **THEN** each executed hook receives immediate EOF on stdin
- **AND** its effective hook-input mode is `disabled`

#### Scenario: JSON overrides terminal availability
- **WHEN** create or remove runs with `--json` while stdin is a TTY
- **THEN** each executed hook receives immediate EOF rather than inherited terminal input
- **AND** its effective hook-input mode is `disabled`

#### Scenario: Non-TTY automation provides EOF
- **WHEN** create or remove runs without terminal stdin and without an explicit disabling flag
- **THEN** each executed hook receives immediate EOF rather than an open unwritten pipe
- **AND** its effective hook-input mode is `unavailable`

#### Scenario: Dry-run does not create an input channel
- **WHEN** create or remove runs in dry-run mode
- **THEN** no lifecycle hook process is spawned
- **AND** no hook-input mode is reported as though execution occurred

### Requirement: Create and remove expose a dedicated input opt-out
Configured and standalone create and remove SHALL accept `--no-hook-input` as an invocation-only hook-input opt-out. The option SHALL NOT disable hook execution, change hook ordering, or change create's existing `--interactive` repository-selection semantics. The typed command registry, generated command contract, help, and shell completions SHALL identify the option on exactly create and remove.

#### Scenario: Input is disabled while hooks still execute
- **WHEN** an eligible create or remove invocation includes `--no-hook-input` and a hook does not require input
- **THEN** the hook executes with immediate-EOF stdin
- **AND** all existing success, failure, timeout, and outcome behavior remains active

#### Scenario: Create interactive selection remains distinct
- **WHEN** configured create uses `--interactive --no-hook-input`
- **THEN** `--interactive` continues to control repository selection
- **AND** `--no-hook-input` controls only lifecycle-hook stdin

#### Scenario: Option contract stays generated and bounded
- **WHEN** the CLI command contract and completions are generated
- **THEN** create and remove advertise `--no-hook-input` with hook-input semantics
- **AND** no unrelated command advertises or accepts the option

### Requirement: Interactive hook execution is attributable before input
Before a `tty` hook can read inherited stdin, Arashi SHALL print a human-only attribution banner that identifies the logical lifecycle, scope, absolute source script path, and applicable workspace or target repository/worktree. Configured and standalone hook execution SHALL remain sequential across lifecycle points, scopes, and targets so no two hook processes compete for terminal input.

#### Scenario: Configured repository hook asks a question
- **WHEN** a configured repository-specific hook starts in `tty` mode
- **THEN** the completed banner identifies its lifecycle, repository scope, source, target repository, and target worktree before the child can read stdin

#### Scenario: Workspace hook has no false target
- **WHEN** an untargeted configured workspace hook starts in `tty` mode
- **THEN** the banner identifies the workspace scope and source
- **AND** does not borrow a child repository or worktree merely for attribution

#### Scenario: Multiple scopes and targets prompt sequentially
- **WHEN** remove evaluates interactive hooks across multiple scopes or repository targets
- **THEN** each hook exits before the next hook starts
- **AND** each prompt is preceded by attribution for that exact scope and target

### Requirement: Interactive output is immediate and exactly captured
For `tty` execution, Arashi SHALL forward each stdout and stderr chunk to the corresponding parent terminal stream as it arrives without adding prefixes or newlines, while retaining the exact per-stream bytes in the internal `HookResult` capture path. An unterminated prompt MUST be visible before input is supplied. The existing string projection MUST preserve ordinary shell text exactly, including internal blank lines and all trailing newline bytes. Public `LifecycleHookOutcome` schemas and reporting behavior SHALL remain unchanged. Non-interactive human execution MAY retain the existing prefixed line renderer, and quiet/JSON execution SHALL remain capture-only.

#### Scenario: Prompt has no trailing newline
- **WHEN** a hook writes a prompt to stdout or stderr without a newline and then reads input
- **THEN** the prompt is visible before the user supplies an answer
- **AND** captured output contains the exact prompt without an added prefix or newline

#### Scenario: Captured newlines are preserved
- **WHEN** an interactive hook emits internal blank lines and multiple trailing newlines
- **THEN** its captured stdout and stderr preserve those sequences exactly
- **AND** terminal streaming does not duplicate or normalize them

#### Scenario: Interactive streams retain their destinations
- **WHEN** an interactive hook writes to both stdout and stderr
- **THEN** stdout bytes are forwarded only to parent stdout and stderr bytes only to parent stderr
- **AND** each captured stream remains exact independently of cross-stream scheduling

### Requirement: Package entrypoints preserve eligible hook stdin
Installed POSIX, JavaScript, PowerShell, and batch entrypoints SHALL preserve stdin for create and remove invocations that may execute lifecycle hooks. Existing output-pipeline workarounds MUST NOT close otherwise-terminal stdin for a forced remove before lifecycle-hook input policy is resolved. List/fzf behavior unrelated to lifecycle hooks SHALL remain unchanged.

#### Scenario: Forced remove pipes output from a terminal
- **WHEN** a user invokes forced remove with terminal stdin and redirects or pipes stdout
- **THEN** the package entrypoint preserves stdin so lifecycle hooks resolve `tty`

#### Scenario: List output uses the existing fzf workaround
- **WHEN** the list wrapper path requires closed stdin for its existing output-pipeline behavior
- **THEN** that unrelated behavior remains unchanged

### Requirement: Input waiting preserves lifecycle failure and terminal safety
Waiting for inherited input SHALL remain inside the configured lifecycle-hook timeout. Success, nonzero exit, timeout, signal termination, and user interruption SHALL follow the existing command-specific create rollback and remove gate/finalization/partial-success contracts. Arashi SHALL leave no live hook child after timeout or interruption and SHALL leave the parent terminal usable for subsequent input and output.

#### Scenario: Interactive hook times out while waiting
- **WHEN** a hook waits for terminal input past its effective lifecycle timeout
- **THEN** Arashi terminates the hook and classifies the result as the existing timeout outcome
- **AND** applies the existing lifecycle rollback or finalization boundary

#### Scenario: User interrupts an interactive hook
- **WHEN** the user sends Ctrl-C while a hook is waiting for input
- **THEN** Arashi terminates or observes termination of the current hook without starting the next hook
- **AND** preserves existing command failure and rollback/finalization behavior
- **AND** the parent terminal remains usable

#### Scenario: Hook refuses the requested operation
- **WHEN** a native hook receives an answer and exits nonzero
- **THEN** Arashi records the existing nonzero hook failure
- **AND** configured/standalone create or remove observes the same mutation boundary as any other pre/post hook failure

### Requirement: Native shell input is verified through real command paths
The built CLI SHALL support Bash `read` on POSIX, PowerShell `Read-Host` on Windows, and cmd `set /p` on Windows when the effective input mode is `tty`. Acceptance tests MUST use a real PTY or native Windows terminal-capable process path and SHALL also prove immediate EOF for unavailable and disabled modes; mocked argv or source assertions alone are insufficient.

#### Scenario: POSIX shell reads an answer
- **WHEN** a built-CLI POSIX lifecycle hook uses Bash `read` in a real PTY
- **THEN** the hook receives the supplied answer through inherited stdin
- **AND** the CLI observes the resulting success or refusal behavior

#### Scenario: PowerShell reads an answer
- **WHEN** a built-CLI Windows lifecycle hook uses `Read-Host` in an eligible native input session
- **THEN** system PowerShell receives the supplied answer through inherited stdin
- **AND** preserves the documented lifecycle result

#### Scenario: Command script reads an answer
- **WHEN** a built-CLI Windows lifecycle hook uses `set /p` in an eligible native input session
- **THEN** cmd receives the supplied answer through inherited stdin
- **AND** preserves the documented lifecycle result

#### Scenario: Native shells receive EOF in automation
- **WHEN** the same Bash, PowerShell, or cmd fixtures run with disabled or unavailable hook input
- **THEN** their native read primitive receives EOF promptly
- **AND** the command does not wait for the lifecycle timeout merely because no answer exists

### Requirement: Guidance treats hook input as trusted but non-secret
Canonical CLI documentation, website guidance, generated examples/exports, and packaged skill guidance SHALL publish the same `tty`/`disabled`/`unavailable` matrix, JSON precedence, `--no-hook-input` semantics, and immediate-EOF behavior. Guidance SHALL state that lifecycle hooks are trusted executable programs but users MUST NOT enter passwords, tokens, or other secrets into hook prompts.

#### Scenario: User reads interactive hook guidance
- **WHEN** a user or agent follows maintained lifecycle-hook documentation
- **THEN** it can determine when native input is available and how to disable it
- **AND** it is warned not to provide secrets through hook prompts

#### Scenario: Companion guidance drifts
- **WHEN** command metadata, canonical docs, generated exports, or packaged guidance disagrees on mode values, option ownership, or JSON precedence
- **THEN** the cross-repository semantic checker fails
