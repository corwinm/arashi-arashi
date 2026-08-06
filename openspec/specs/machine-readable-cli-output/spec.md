# machine-readable-cli-output Specification

## Purpose

Define the automation-safe machine-readable output contract for the Arashi CLI, including consistent JSON envelopes, stdout isolation, non-interactive behavior, command support classification, and related documentation and skill guidance.
## Requirements
### Requirement: JSON output envelope

The Arashi CLI SHALL use a consistent JSON envelope for every command invocation that accepts `--json` and reaches command-level execution.

#### Scenario: Command succeeds in JSON mode

- **WHEN** a user runs an Arashi command with `--json` and the command completes successfully
- **THEN** stdout contains exactly one valid JSON document
- **AND** the document contains `ok: true`, the command name, `schemaVersion: 1`, a command-specific `data` object, and a `warnings` array

#### Scenario: Command fails in JSON mode after option parsing

- **WHEN** a user runs an Arashi command with `--json` and the command fails after Arashi has parsed command options
- **THEN** stdout contains exactly one valid JSON document
- **AND** the document contains `ok: false`, the command name, `schemaVersion: 1`, a structured `error` object, and a `warnings` array
- **AND** the process exits with a non-zero exit code

### Requirement: JSON stdout isolation

Commands that accept `--json` SHALL reserve stdout for the final JSON document and SHALL NOT write human-readable progress, spinners, colors, tables, banners, or prompts to stdout while JSON mode is active.

#### Scenario: Command normally prints progress

- **WHEN** a user runs a progress-reporting command with `--json`
- **THEN** stdout contains only the final JSON document
- **AND** progress is suppressed, captured in the JSON result, or emitted to stderr only when explicitly documented for diagnostics

#### Scenario: Verbose diagnostics are requested

- **WHEN** a user runs a command with `--json --verbose` and the command supports diagnostic output
- **THEN** stdout remains exactly one parseable JSON document
- **AND** any non-JSON diagnostic output is written to stderr or included in structured JSON fields

### Requirement: Non-interactive JSON execution

Commands that accept `--json` SHALL NOT trigger interactive prompts and SHALL return a structured error when required input or confirmation is missing.

#### Scenario: Required selection is ambiguous

- **WHEN** a user runs a JSON-mode command that would normally prompt the user to choose among multiple candidates
- **THEN** the command exits non-zero with a JSON error code such as `INTERACTIVE_INPUT_REQUIRED` or a more specific ambiguity code
- **AND** the error details include enough information for automation to retry with explicit arguments or flags

#### Scenario: Required confirmation is missing

- **WHEN** a user runs a JSON-mode command that would normally ask for confirmation before mutating state
- **THEN** the command exits non-zero with a structured error explaining the required confirmation flag or non-mutating mode
- **AND** the command does not perform the mutation

### Requirement: Command support audit

The Arashi CLI SHALL audit every user-facing command and explicitly classify JSON behavior as supported, unsupported for a specific mode, or not applicable.

#### Scenario: Automation-relevant command has structured results

- **WHEN** a user runs an automation-relevant command such as `clone`, `create`, `doctor`, `init`, `install`, `prune`, `pull`, `setup`, `status`, `sync`, or `update` with `--json`
- **THEN** the command either returns a structured JSON success/failure envelope or documents and emits a structured unsupported-mode error for the requested mode

#### Scenario: Existing JSON command is audited

- **WHEN** a user runs an existing JSON-capable command such as `list`, `add`, or `remove` with `--json`
- **THEN** the command participates in the same envelope and stdout-isolation contract as newly supported commands

### Requirement: Unsupported JSON modes

Commands or modes whose primary purpose is shell-code emission, external app launch, or interactive session control SHALL either return a structured non-interactive plan/result or reject JSON mode with a structured unsupported-mode error.

#### Scenario: Shell integration code emission is requested as JSON

- **WHEN** a user requests JSON output for a mode whose normal stdout is shell integration code
- **THEN** the command exits non-zero with `ok: false` and an error code such as `JSON_UNSUPPORTED_FOR_MODE`
- **AND** the human shell integration output is not mixed into JSON stdout

#### Scenario: External application launch is requested as JSON

- **WHEN** a user requests JSON output for a mode that would launch an editor, terminal, tmux session, or similar external application
- **THEN** the command either returns a structured plan/result without launching unexpectedly or exits non-zero with a structured unsupported-mode error

### Requirement: JSON output documentation and skill guidance

Arashi documentation and the Arashi skill package SHALL describe the JSON envelope, error shape, command support matrix, stdout/stderr contract, and handoff-report JSON payload for automation consumers.

#### Scenario: User looks up JSON mode support

- **WHEN** a user reads the CLI documentation for automation or command output
- **THEN** the documentation identifies which commands support `--json`, which modes are unsupported, and the shape of success and failure envelopes

#### Scenario: Agent uses Arashi skill guidance

- **WHEN** an agent consults the Arashi skill package for command guidance
- **THEN** the skill references identify when to prefer `--json` for automation-safe command output
- **AND** the guidance explains that unsupported launch, shell integration, or interactive modes return structured JSON errors rather than human prompts

#### Scenario: User writes a parser from documentation

- **WHEN** a user follows the documented JSON mode contract
- **THEN** they can parse stdout as a single JSON document and inspect `ok`, `data`, `warnings`, and `error` without scraping human-readable output

#### Scenario: User looks up handoff JSON support

- **WHEN** a user reads the CLI documentation for handoff-report automation
- **THEN** the documentation identifies `arashi handoff --json` as a JSON-capable command
- **AND** the documentation describes the workspace metadata, per-repository status records, caller-supplied context arrays, warnings, and generated next-command hints included in the handoff payload

### Requirement: Prune JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi prune --json` and `arashi prune --dry-run --json`.

#### Scenario: Dry-run prune JSON succeeds

- **WHEN** a user runs `arashi prune --dry-run --json`
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "prune"`
- **AND** the data object includes per-repository prunable worktree entries, paths, reasons when available, and totals
- **AND** no human-readable dry-run text is mixed into stdout

#### Scenario: Mutating prune JSON succeeds

- **WHEN** a user runs `arashi prune --json` and prune operations complete successfully
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "prune"`
- **AND** the data object includes per-repository prune results and totals for pruned or skipped repositories

#### Scenario: Prune JSON reports partial failure

- **WHEN** a user runs `arashi prune --json` and one or more repository prune operations fail
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "prune"`
- **AND** the error or data details identify each failed repository and underlying failure message
- **AND** the process exits non-zero

### Requirement: Exec JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi exec --json` using the standard single-document JSON envelope and per-repository execution details.

#### Scenario: Exec JSON succeeds for all repositories

- **WHEN** a user runs `arashi exec --json -- git status --short` and all selected repository commands exit successfully
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "exec"`
- **AND** the data object includes the child command arguments, effective execution options, selected repository list, per-repository results, and aggregate totals
- **AND** each per-repository result includes repository name, path, execution status, child exit code, stdout, stderr, and duration information
- **AND** no grouped human output, progress text, or prompts are mixed into stdout

#### Scenario: Exec JSON reports child command failure

- **WHEN** a user runs `arashi exec --json -- bun run test` and one or more selected repository commands exit non-zero
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "exec"`
- **AND** the data or error details identify each failed repository and its child exit code
- **AND** successful and skipped repository results remain available in the JSON payload
- **AND** the Arashi process exits non-zero

#### Scenario: Exec JSON reports selection or validation error

- **WHEN** a user runs `arashi exec --json` with invalid options, missing child command arguments, missing selected repositories, or an invalid `--jobs` value
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "exec"`
- **AND** the structured error identifies the validation or selection problem
- **AND** no repository child command is executed

#### Scenario: Exec JSON with fail-fast leaves repositories unstarted

- **WHEN** a user runs `arashi exec --json --fail-fast --jobs 2 -- bun run test` and fail-fast prevents one or more selected repositories from starting
- **THEN** the JSON payload distinguishes successful, failed, skipped, and not-started repository results
- **AND** the payload identifies that fail-fast caused the not-started results

### Requirement: Push JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi push --json` and `arashi push --dry-run --json` using the standard JSON envelope and stdout-isolation contract.

#### Scenario: Push JSON succeeds

- **WHEN** a user runs `arashi push --json` and all selected repositories are pushed or skipped without failures
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "push"`
- **AND** the data object includes per-repository results, effective options, aggregate totals, and warnings if any repositories were skipped
- **AND** no human-readable progress, spinners, or summaries are mixed into stdout

#### Scenario: Push JSON reports partial failure

- **WHEN** a user runs `arashi push --json` and one or more selected repository pushes fail
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "push"`
- **AND** the data or error details identify each failed repository and preserve successful or skipped repository results
- **AND** the process exits non-zero

#### Scenario: Push dry-run JSON is non-mutating

- **WHEN** a user runs `arashi push --dry-run --json --set-upstream`
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "push"`
- **AND** the data object includes `dryRun: true`, effective options, planned push operations, skipped repositories, and aggregate totals
- **AND** no remote branch is created or updated

#### Scenario: Push JSON remains non-interactive

- **WHEN** a user runs `arashi push --json` and required repository selection or upstream information is ambiguous
- **THEN** the command exits non-zero with a structured error or skipped repository result that explains how automation can retry with explicit flags such as `--only` or `--set-upstream`
- **AND** the command does not prompt for interactive input

### Requirement: Remove dry-run JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi remove --dry-run --json` that describe a non-mutating removal plan in the standard JSON envelope.

#### Scenario: Dry-run remove JSON succeeds

- **WHEN** a user runs `arashi remove <target> --dry-run --json`
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "remove"`
- **AND** the data object identifies the invocation as dry-run preview mode
- **AND** the data object includes planned worktree removals, planned branch deletions, skipped main worktrees, missing branches, blockers or dirty details, hook preview context, effective options, and totals
- **AND** no human-readable preview text is mixed into stdout

#### Scenario: Dry-run remove JSON requires explicit target

- **WHEN** a user runs `arashi remove --dry-run --json` without a target and interactive selection would be required
- **THEN** stdout contains exactly one valid JSON error envelope
- **AND** the error explains that an explicit target is required for JSON mode
- **AND** no prompt is shown

#### Scenario: Dry-run remove JSON reports no-op keep flags

- **WHEN** a user runs `arashi remove <target> --dry-run --json --keep-worktrees --keep-branches`
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true`
- **AND** the plan totals show zero planned worktree removals and zero planned branch deletions
- **AND** the effective options show both keep flags were supplied

#### Scenario: Dry-run remove JSON is non-mutating

- **WHEN** a user runs `arashi remove <target> --dry-run --json`
- **THEN** the JSON plan describes pending operations only
- **AND** no operation in the plan is reported as successfully executed
- **AND** worktrees, branches, and hooks remain unmodified by the preview

### Requirement: Handoff JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi handoff --json` from configured coordinated or implicit standalone workspaces using the standard single-document JSON envelope and stdout-isolation contract.

#### Scenario: Configured handoff JSON succeeds

- **WHEN** a user runs `arashi handoff --json` from a configured coordinated workspace
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "handoff"`
- **AND** the data object includes configured workspace metadata, effective options, per-repository status records, caller-supplied links, validations, todos, risks, next commands, and aggregate status totals
- **AND** no Markdown report, progress text, prompts, or color control sequences are mixed into stdout

#### Scenario: Standalone handoff JSON succeeds

- **WHEN** a user runs `arashi handoff --json` from an implicit standalone workspace
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "handoff"`
- **AND** data identifies standalone mode, main repository root, caller worktree, branch, and worktree status without inventing configured child repositories

#### Scenario: Handoff JSON preserves supplied context

- **WHEN** a user runs `arashi handoff --json --link <link> --validation <entry> --todo <item> --risk <item> --next-command <command>`
- **THEN** the JSON payload preserves each supplied value in structured arrays
- **AND** the payload distinguishes user-supplied validation evidence from commands that Arashi itself executed

#### Scenario: Handoff JSON reports workspace resolution errors

- **WHEN** a user runs `arashi handoff --json` outside configured and implicit standalone Arashi workspaces
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "handoff"`
- **AND** the structured error explains configured initialization and zero-config standalone preparation where applicable
- **AND** the process exits non-zero

#### Scenario: Handoff JSON remains non-interactive and non-mutating

- **WHEN** a user runs `arashi handoff --json` in a dirty configured or standalone workspace
- **THEN** the command does not prompt for confirmation
- **AND** the command does not stage, commit, push, delete, create config, write ignore state, write report files, or run validation commands
- **AND** dirty repository details are represented in the JSON payload for automation to inspect

### Requirement: JSON-capable lifecycle commands report managed ignore reconciliation

JSON-capable `init`, `pull`, `clone`, `add`, and `create` workflows SHALL report managed ignore inspection and reconciliation through their existing single-document JSON envelopes.

#### Scenario: Existing effective rule is reported

- **WHEN** a JSON-capable lifecycle command finds that a managed path is already ignored
- **THEN** the command data identifies the normalized path, effective source type, matched rule when available, and unchanged status
- **AND** stdout remains exactly one JSON document

#### Scenario: Local or tracked rule is applied

- **WHEN** a JSON-capable lifecycle command writes a missing safe rule
- **THEN** the command data identifies the effective scope, target type, normalized rule, applied status, and changed state
- **AND** no human progress or ignore-file text is mixed into stdout

#### Scenario: Dry-run previews reconciliation

- **WHEN** a user runs a supported lifecycle command in dry-run and JSON mode
- **THEN** the JSON data identifies planned ignore changes without modifying ignore files or clone-local preference state

#### Scenario: None scope leaves a path unignored

- **WHEN** a JSON-capable lifecycle command encounters an unignored safe path while scope is `none`
- **THEN** the JSON envelope includes a structured warning identifying the path and non-mutating scope

#### Scenario: Unsafe path is skipped

- **WHEN** reconciliation classifies a managed path as unsafe for automatic ignore rules
- **THEN** the JSON data identifies the path, skip status, and safety reason

#### Scenario: Reconciliation fails before command mutation

- **WHEN** managed-ignore inspection or apply fails before the lifecycle command materializes or updates workspace state
- **THEN** the JSON error details identify the reconciliation phase, affected path or target when available, and underlying failure
- **AND** final `changed` state reflects the observed filesystem rather than the attempted plan

#### Scenario: Downstream failure restores reconciliation

- **WHEN** a lifecycle command writes ignore state, later fails, and successfully restores the prior state
- **THEN** the JSON error details report `attempted: true`, `restored: true`, and final `changed: false`
- **AND** preserve partial command results when the command contract supports them

#### Scenario: Partial success retains reconciliation

- **WHEN** a lifecycle command retains a successful repository, worktree, or pulled configuration after another operation fails
- **THEN** the JSON error or partial-result data reports retained command results and final `changed: true` when reconciliation remains applied

#### Scenario: Reconciliation rollback fails

- **WHEN** restoration of managed-ignore state fails after a downstream command failure
- **THEN** the JSON error includes both failures, reports `restored: false`, and describes final observed state without claiming rollback success

### Requirement: Doctor JSON includes managed ignore findings

`arashi doctor --json` SHALL represent managed ignore findings through the existing stable diagnostics envelope.

#### Scenario: Doctor reports a managed ignore finding

- **WHEN** doctor detects missing, unsafe, or invalid managed ignore state in JSON mode
- **THEN** each finding retains the stable `code`, `severity`, `category`, `message`, and `scope` fields
- **AND** additive details identify the managed path, effective source or stored preference when available, and suggested repair command

### Requirement: JSON-capable commands identify standalone workspace context

Commands that support `--json` in implicit standalone mode SHALL include stable additive workspace metadata without changing the existing envelope schema version or stdout-isolation contract.

#### Scenario: Standalone command succeeds in JSON mode

- **WHEN** a JSON-capable lifecycle command succeeds in an implicit standalone workspace
- **THEN** stdout contains exactly one JSON envelope
- **AND** command data identifies standalone mode, the main repository root, and `.worktrees` base where relevant
- **AND** no human discovery, progress, warning, or bootstrap text is mixed into stdout

#### Scenario: Invalid persisted config blocks fallback

- **WHEN** `.arashi/config.json` exists but is invalid and a JSON-capable command is invoked beside `.worktrees/`
- **THEN** stdout contains exactly one JSON error envelope preserving the configuration failure
- **AND** error details do not claim standalone fallback

#### Scenario: Configured workspace takes precedence

- **WHEN** valid configuration and `.worktrees/` both exist
- **THEN** JSON workspace metadata identifies configured mode and configured paths
- **AND** does not identify the invocation as implicit standalone

### Requirement: Zero-config bootstrap reports structured plans and results

`arashi init --zero-config --json` and its dry-run variant SHALL report directory and ignore-source actions through the standard single-document JSON envelope.

#### Scenario: Dry-run plans directory and exclude changes

- **WHEN** a user runs `arashi init --zero-config --dry-run --json` in an eligible repository that needs both actions
- **THEN** data identifies `dryRun: true`, main repository root, planned `.worktrees/` creation, planned repository-local exclude target and rule, and unchanged final state
- **AND** no filesystem or Git configuration mutation occurs

#### Scenario: Existing effective rule is reported

- **WHEN** zero-config bootstrap finds a tracked, repository-local, or global rule that already ignores the deterministic `.worktrees/.arashi-ignore-probe` descendant
- **THEN** data identifies the effective source and unchanged ignore action
- **AND** does not claim that Arashi wrote another source

#### Scenario: Bootstrap succeeds

- **WHEN** zero-config bootstrap applies one or more changes
- **THEN** data reports attempted and final changed state for the directory and local exclude separately
- **AND** stdout remains exactly one JSON document

#### Scenario: Incompatible option fails before mutation

- **WHEN** `--zero-config` is combined with an incompatible initialization option in JSON mode
- **THEN** stdout contains one structured usage-error envelope identifying the conflicting option
- **AND** error details report that no zero-config action was applied

#### Scenario: Bootstrap rollback completes

- **WHEN** bootstrap mutates local state, later fails, and restores prior state
- **THEN** error details report attempted and restored actions plus final unchanged state
- **AND** preserve both the original failure and any restoration warning

### Requirement: Standalone create reports ignore blockers structurally

Standalone create and dry-run JSON results SHALL expose effective ignore safety before worktree mutation.

#### Scenario: Dry-run is blocked by unignored destination

- **WHEN** a user runs `arashi create <branch> --dry-run --json` and the exact normalized `.worktrees/<branch>` destination is not effectively ignored
- **THEN** stdout contains one structured blocked/error envelope identifying the exact destination, the missing effective source, and repair commands
- **AND** data or error details confirm that no branch, worktree, ignore, or config mutation occurred

#### Scenario: Create uses an existing effective rule

- **WHEN** standalone create JSON mode succeeds because a tracked, local, or global rule effectively ignores the exact destination
- **THEN** data identifies the effective source and created `.worktrees/<branch>` path
- **AND** does not report configured child repositories or a repository-name path prefix

### Requirement: JSON execution rejects explicit plain tmux launch without side effects

The system SHALL represent explicit plain-tmux launch requests that use JSON mode with the existing structured unsupported-mode contract, SHALL emit exactly one JSON document on stdout, and SHALL NOT switch, create, launch tmux, or emit human progress text on stdout.

#### Scenario: Switch JSON rejects explicit tmux

- **WHEN** the user runs `arashi switch --json --tmux <target>`
- **THEN** Arashi returns a structured `JSON_UNSUPPORTED_FOR_MODE` error with the existing `launch` mode label and does not invoke tmux or mutate repository state

#### Scenario: Create JSON rejects explicit tmux before creation

- **WHEN** the user runs `arashi create <branch> --json --tmux`
- **THEN** Arashi returns the structured unsupported-mode error with the existing `interactive-or-launch` mode label before creating worktrees or running hooks

#### Scenario: JSON rejection precedes launcher conflicts and tmux context validation

- **WHEN** the user combines JSON mode with `--tmux` and another explicit launcher, or runs JSON mode with `--tmux` while `TMUX` is absent, empty, or whitespace-only
- **THEN** Arashi returns the command's structured unsupported-mode envelope before runtime conflict or tmux-context errors
- **AND** the same precedence applies through the Commander action and direct exported executor

### Requirement: Configured init JSON reports the authoritative resolved worktree location
Configured `arashi init --json`, its dry-run variant, and its supported preference-only form SHALL report the normalized authoritative worktree location through the standard single-document JSON envelope.

#### Scenario: Bare configured init JSON uses parent default
- **WHEN** configured init runs with `--json` in a bare repository without `--worktrees-dir`
- **THEN** stdout contains exactly one valid success envelope with `command: "init"`
- **AND** its data reports canonical bare `workspaceRoot` and `worktreesDir: ".."`
- **AND** no human progress, preview, success, or warning output appears on stdout or stderr

#### Scenario: Non-bare configured init JSON retains managed default
- **WHEN** configured init runs with `--json` in a non-bare repository without `--worktrees-dir`
- **THEN** its data reports `worktreesDir: ".arashi/worktrees"`

#### Scenario: Explicit override is reflected in JSON
- **WHEN** configured init runs with `--json --worktrees-dir <path>`
- **THEN** its data reports the normalized explicit path regardless of repository type

#### Scenario: Preference-only result uses config authority
- **WHEN** an existing configured workspace runs the supported preference-only init form with `--json`
- **THEN** its data reports the existing normalized configured `worktreesDir`
- **AND** reports `.arashi/worktrees` only when the existing configuration uses the legacy omitted-field fallback
- **AND** does not substitute a repository-type default

#### Scenario: Bare dry-run JSON is non-mutating
- **WHEN** configured init runs with `--dry-run --json` in a bare repository without an explicit worktree location
- **THEN** its data reports `worktreesDir: ".."` and the bare non-worktree managed-path classifications
- **AND** no config, directory, ignore, preference, hook, repository, linked worktree, temporary worktree, or created worktree mutation occurs
- **AND** stdout contains only the envelope and stderr contains no human output

#### Scenario: Bootstrap dry-run JSON remains non-bare
- **WHEN** configured init previews a new repository bootstrap with `--dry-run --json`
- **THEN** its data reports `.arashi/worktrees` without requiring Git classification of a nonexistent repository
- **AND** no repository or directory is created

### Requirement: Keep launch disposition human-only in machine-readable mode
The system SHALL classify `--tab` as human-only launch behavior on both switch and create, SHALL reject it with each command's existing structured unsupported-mode label and exit convention, and SHALL enforce the rejection at the Commander action and exported executor before any competing option error, human output, discovery with side effects, mutation, directive, or launch.

#### Scenario: Switch JSON tab rejection has existing shape
- **WHEN** `arashi switch --json --tab` is invoked with or without another conflicting launch or behavior flag
- **THEN** stdout contains exactly one `JSON_UNSUPPORTED_FOR_MODE` envelope with command `switch` and mode `launch`
- **AND** the process uses switch's existing JSON usage exit code
- **AND** stderr contains no human progress or error output

#### Scenario: Create JSON tab rejection has existing shape
- **WHEN** `arashi create <branch> --json --tab` is invoked with or without another conflicting launch flag
- **THEN** stdout contains exactly one `JSON_UNSUPPORTED_FOR_MODE` envelope with command `create` and mode `interactive-or-launch`
- **AND** the process uses create's existing JSON error exit code
- **AND** stderr contains no human progress or error output

#### Scenario: Exported executors cannot bypass rejection
- **WHEN** a direct caller passes `json: true` and `tab: true` to the exported switch or create executor
- **THEN** the executor returns that command's existing numeric JSON rejection result
- **AND** invokes no workspace discovery, selector, directive, managed-ignore reconciliation, branch/worktree mutation, hook, or launcher dependency

#### Scenario: General option types preserve overload honesty
- **WHEN** a caller holds the broad switch or create options type with possible JSON and tab values
- **THEN** compile-time return types preserve the existing numeric-versus-human result union
- **AND** do not infer a human launch result for an invocation that can be rejected in JSON mode

### Requirement: JSON lifecycle results expose a stable per-hook outcome schema
Successful JSON create and remove envelopes SHALL expose `data.hookOutcomes`; failed-command envelopes SHALL preserve the canonical error-envelope discriminant and expose the same array at `error.details.hookOutcomes`. Each record SHALL contain `hookName`, `scope`, `workspaceMode`, `hookStatus`, `reasonCode`, `message`, and `repositoryId`; SHALL contain `sourceScriptPath`, `executionPath`, `targetRepositoryName`, `targetRepositoryPath`, and `targetWorktreePath` as strings or `null`; and SHALL contain non-negative integer `durationMs` when execution was attempted. `scope` SHALL be one of `workspace`, `repository`, `global-repository`, or `global-shared`; `workspaceMode` SHALL be `configured` or `standalone`; `repositoryId` SHALL be `workspace` for untargeted configured workspace hooks and the canonical target name otherwise; `hookStatus` SHALL be `success`, `failure`, or `skipped`; and `reasonCode` SHALL be one of `none`, `not_found`, `disabled`, `validation_failed`, `interpreter_unavailable`, `timeout`, `exit_non_zero`, or `not_applicable`.

#### Scenario: Validation fails before execution
- **WHEN** a discovered hook fails file or executable validation
- **THEN** its record has `hookStatus: "failure"` and `reasonCode: "validation_failed"`
- **AND** `durationMs` is omitted because execution was not attempted

#### Scenario: Hook is absent
- **WHEN** a hook location is evaluated and no native script exists
- **THEN** its record has `hookStatus: "skipped"`, `reasonCode: "not_found"`, and `sourceScriptPath: null`

#### Scenario: Fail-fast prevents later evaluation
- **WHEN** a create hook failure stops the lifecycle before later hook locations are evaluated
- **THEN** `hookOutcomes` contains the failed and previously evaluated locations only
- **AND** does not fabricate `not_applicable` records for an execution plan that was never reached

### Requirement: JSON create results include complete evaluated hook outcomes
Successful configured create SHALL order `data.hookOutcomes` as workspace pre-create, each selected repository's pre/post pair in selected-repository order, then workspace post-create. A failed configured create SHALL preserve the evaluated prefix in the same order at `error.details.hookOutcomes`. Standalone create SHALL order targeted-global before shared-global at each lifecycle point. Records SHALL cover every location actually evaluated before success or fail-fast termination without mixing hook, progress, or recovery prose into stdout.

#### Scenario: Configured create succeeds with hooks
- **WHEN** configured `arashi create --json` evaluates workspace and repository-specific hooks successfully
- **THEN** stdout contains one valid create envelope
- **AND** `data.hookOutcomes` follows configured lifecycle order with explicit workspace and target metadata

#### Scenario: Standalone create succeeds with hooks
- **WHEN** standalone `arashi create --json` evaluates targeted and shared user-global hooks
- **THEN** stdout contains one valid create envelope
- **AND** `data.hookOutcomes` identifies standalone mode through its target/execution context and preserves targeted-before-shared order

#### Scenario: Workspace create hook fails
- **WHEN** a workspace create hook fails during JSON create
- **THEN** stdout contains one canonical structured failure envelope with evaluated outcomes at `error.details.hookOutcomes` and rollback information in error details
- **AND** hook stdout, stderr, progress, and human recovery prose do not contaminate JSON stdout

### Requirement: JSON remove results preserve per-hook and operation failures
Configured and standalone remove SHALL use the same record schema at the success/failure envelope locations defined above for each executed scope/target instead of collapsing all hooks into one last-failure summary. Records SHALL follow target selection order and, within each target, repository → workspace → global-repository → global-shared scope order for each lifecycle. Existing aggregate pre/post summary fields MAY remain as compatibility summaries but MUST be derived from the complete records.

#### Scenario: Remove has timeout and nonzero failures
- **WHEN** remove operations continue and evaluated hooks include both timeout and nonzero failures
- **THEN** each record retains its own `timeout` or `exit_non_zero` reason
- **AND** the final command failure preserves removal errors plus all hook records regardless of completion order

#### Scenario: Remove succeeds across multiple targets
- **WHEN** configured remove evaluates hooks for multiple repository targets
- **THEN** records are ordered by target selection and documented scope order
- **AND** each record contains that invocation's target and execution paths

### Requirement: JSON dry-run remains non-executing
Create and remove dry-run JSON SHALL preserve their existing hook-preview contracts and MUST NOT spawn hook processes. This change does not require dry-run to fabricate execution outcome records for locations that normal orchestration has not evaluated.

#### Scenario: Dry-run previews hooks
- **WHEN** create or remove runs with `--dry-run --json`
- **THEN** the existing structured preview identifies applicable discovered hook plans where supported
- **AND** no `success` or `failure` execution record is fabricated and no hook process is spawned

### Requirement: JSON short alias preserves the machine-readable contract
Every command that registers `--json` SHALL also register `-j` as an exact alias, including commands whose requested operation returns a structured unsupported-mode error rather than success.

#### Scenario: JSON-capable command uses short alias
- **WHEN** a user replaces `--json` with `-j` on a JSON-capable command
- **THEN** stdout, envelope schema, warnings, exit code, interactivity, and side effects are identical

#### Scenario: Unsupported JSON mode uses short alias
- **WHEN** a user supplies `-j` for a command or mode that rejects JSON operation
- **THEN** Arashi returns the same one-document structured unsupported-mode error as `--json`
- **AND** does not fall back to human execution

#### Scenario: Json alias and long form are combined
- **WHEN** a user supplies both `-j` and `--json` on one command
- **THEN** Arashi treats them as the same boolean intent
- **AND** emits exactly one JSON document

#### Scenario: Npm wrapper recognizes the JSON alias
- **WHEN** npm-managed `install` or `update` intercepts an invocation containing `-j` before Commander runs
- **THEN** the wrapper applies the same JSON mode, output isolation, envelope, and exit behavior as `--json`
- **AND** does not delegate to an unintended human-mode path

### Requirement: Deprecated option handling preserves structured output isolation
Compatibility spellings accepted during deprecation SHALL NOT add human deprecation prose to JSON stdout and SHALL preserve the command's existing JSON guard and validation precedence.

#### Scenario: Deprecated spelling reaches JSON success
- **WHEN** a deprecated spelling is accepted alongside a successful JSON invocation
- **THEN** stdout contains exactly one success envelope
- **AND** any deprecation signal is represented in the existing structured warnings field or outside stdout according to documented policy

#### Scenario: Deprecated spelling reaches JSON failure
- **WHEN** a deprecated spelling is accepted alongside a JSON invocation that fails or is unsupported
- **THEN** stdout contains exactly one error envelope
- **AND** the original command-specific error/guard precedence remains authoritative

#### Scenario: Human deprecation output is isolated
- **WHEN** a deprecated spelling emits a human migration warning
- **THEN** the warning is written only to stderr
- **AND** it does not alter machine-readable stdout
