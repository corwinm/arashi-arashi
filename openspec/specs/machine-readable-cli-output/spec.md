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

User and agent documentation SHALL explain one-document JSON behavior, stable base-policy source values, per-repository create/clone results, and structured selector/resolution failures without recommending human-output parsing.

#### Scenario: Automation needs base-policy evidence

- **WHEN** automation consumes configured create or clone with base policy
- **THEN** canonical docs and packaged skill guidance identify the stable JSON fields and source vocabulary
- **AND** direct automation to stderr/exit status and the JSON envelope rather than human text

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

### Requirement: JSON lifecycle hook execution is non-interactive

Configured and standalone create and remove SHALL execute lifecycle hooks with `ARASHI_HOOK_INPUT=disabled` and immediate-EOF stdin whenever JSON mode is active, including when the parent process has terminal stdin. No interactive attribution banner, prompt byte, prefixed hook line, progress output, or recovery prose SHALL be written to stdout. The existing one-document envelope discriminant, exit convention, hook outcome locations, and captured diagnostic behavior SHALL remain authoritative.

#### Scenario: JSON hook attempts to read

- **WHEN** a create or remove hook performs a native stdin read during `--json`
- **THEN** the hook receives EOF immediately rather than waiting for the lifecycle timeout
- **AND** its environment reports `ARASHI_HOOK_INPUT=disabled`

#### Scenario: JSON runs from a terminal

- **WHEN** create or remove runs with `--json` while parent stdin is a TTY
- **THEN** terminal availability does not enable hook input
- **AND** stdout contains exactly one parseable JSON document

#### Scenario: Hook emits an unterminated prompt in JSON mode

- **WHEN** a JSON-mode hook writes prompt text without a newline before attempting to read
- **THEN** no prompt text or interactive attribution is streamed to stdout
- **AND** internal `HookResult` capture remains available to existing classification and diagnostics without adding stdout or stderr fields to the public hook-outcome schema

#### Scenario: JSON hook fails after EOF

- **WHEN** a hook treats immediate EOF as an error and exits nonzero
- **THEN** create or remove reports the existing structured hook failure with evaluated outcomes
- **AND** no human hook output contaminates stdout

### Requirement: JSON dry-run remains input-channel-free

Create and remove dry-run JSON SHALL continue not to spawn lifecycle hooks and SHALL NOT fabricate `ARASHI_HOOK_INPUT`, interactive attribution, or execution outcomes for previewed hook locations.

#### Scenario: Dry-run previews an input-capable hook

- **WHEN** `--dry-run --json` discovers a hook that could request input during a real human invocation
- **THEN** the existing preview describes the hook without executing it
- **AND** stdout remains one structured preview document

### Requirement: Add JSON results identify canonical and active materialization roles

`arashi add --json` SHALL preserve the standard single-document JSON envelope and existing config-relative repository path while reporting deterministic canonical clone, linked worktree, default branch, and coordinated branch roles.

#### Scenario: Coordinated linked add JSON succeeds

- **WHEN** `arashi add --json` succeeds from a configured non-bare linked parent worktree
- **THEN** stdout contains exactly one valid envelope with `ok: true` and `command: "add"`
- **AND** `data.repository.path` contains the config-relative child repository path
- **AND** `data.repository.materialization` is `"coordinated-worktree"`
- **AND** `data.repository.canonicalPath` contains the normalized absolute canonical clone path
- **AND** `data.repository.worktreePath` contains the normalized absolute active child worktree path
- **AND** `data.repository.defaultBranch` contains the detected child default branch
- **AND** `data.repository.coordinatedBranch` contains the active parent branch
- **AND** `data.repository.setupScript` is the config-relative setup-script path or `null` and `setupScriptCreated` remains boolean
- **AND** stdout contains no spinner, prompt, warning prose, or human summary

#### Scenario: Direct add JSON succeeds

- **WHEN** `arashi add --json` succeeds without creating a linked child worktree
- **THEN** `data.repository.materialization` is `"clone"`
- **AND** `data.repository.canonicalPath` contains the normalized absolute clone path
- **AND** `data.repository.worktreePath` is `null`
- **AND** `data.repository.coordinatedBranch` is `null`
- **AND** the existing repository name, Git URL, config-relative `path`, default branch, setup script, setup-created, and managed-ignore fields remain available

#### Scenario: Coordinated add JSON fails and rolls back completely

- **WHEN** coordinated `arashi add --json` fails after one or more mutations and rollback completes
- **THEN** stdout contains exactly one valid envelope with `ok: false` and `command: "add"`
- **AND** `error.details.phase` is the original failing phase, one of `"clone"`, `"branch"`, `"worktree"`, or `"config"`
- **AND** `error.details.rollback.complete` is `true` and `error.details.rollback.failures` is an empty array
- **AND** `error.details.rollback.finalState.canonical` is `{ path: <normalized absolute canonical path>, exists: <boolean or null> }`
- **AND** `error.details.rollback.finalState.worktree` is `{ path: <normalized absolute active path>, exists: <boolean or null>, metadataPresent: <boolean or null> }` in coordinated mode
- **AND** `error.details.rollback.finalState.coordinatedBranch` is `{ name: <branch>, exists: <boolean or null>, createdByInvocation: <boolean> }`
- **AND** `error.details.rollback.finalState.configEntryPresent` is boolean or `null`
- **AND** `error.details.rollback.finalState.managedIgnore` is `{ changed: <boolean>, restored: <boolean or null> }`, where `restored` is `null` when no invocation-owned ignore change existed
- **AND** any `null` observation is paired with an ordered `final-state-observe` failure record
- **AND** no human cleanup guidance is written to stdout

#### Scenario: Coordinated add JSON reports incomplete rollback

- **WHEN** coordinated `arashi add --json` cannot remove or restore one or more invocation-owned resources
- **THEN** the same error envelope preserves the original failing `error.details.phase` and sets `error.details.rollback.complete` to `false`
- **AND** `error.details.rollback.failures` contains ordered `{ phase, message }` records for every failed cleanup/restoration/observation operation, where `phase` is one of `"worktree-remove"`, `"branch-delete"`, `"clone-remove"`, `"config-restore"`, `"managed-ignore-restore"`, or `"final-state-observe"`
- **AND** `error.details.rollback.finalState` uses the same exact canonical, worktree, coordinated-branch, config-entry, and managed-ignore object fields to report surviving state
- **AND** the process exits non-zero without emitting a second JSON document

### Requirement: Create JSON reports requested and effective base resolution

When configured or explicit base policy applies, `arashi create --json` SHALL expose each selected repository's normalized effective branch, exact policy source, canonical repository identity/path, resolved full ref, captured commit OID, and created/reused target action. Base-resolution errors SHALL use a stable code and include every affected repository with its independently effective branch and exact attempted refs. When no base policy applies, legacy result shapes SHALL remain unchanged.

#### Scenario: JSON success has per-repository branches and sources

- **WHEN** create resolves meta and child repositories from mixed repository CLI, invocation CLI, repository config, and workspace config sources
- **THEN** stdout contains exactly one success document
- **AND** every selected repository record reports its own normalized branch and exact source

#### Scenario: JSON failure aggregates different missing bases

- **WHEN** selected repositories cannot resolve different effective bases
- **THEN** stdout contains exactly one structured error document covering every affected repository
- **AND** each record contains that repository's requested branch and attempted local/origin refs
- **AND** no human text appears on stdout

#### Scenario: Existing target is reused

- **WHEN** create retains an existing target under `REUSE_EXISTING`
- **THEN** JSON reports the independently resolved policy and `reused` action
- **AND** does not claim that the existing target was created from or ancestry-validated against that base

### Requirement: Lifecycle records identify source kind and owner without disclosure

Every public create/remove hook outcome record SHALL add `sourceKind`, `sourceOwnerKind`, and `sourceOwnerName`. `sourceKind` SHALL be `file` or `inline-config`; `sourceOwnerKind` SHALL be `workspace`, `repository`, or `user-global`; and `sourceOwnerName` SHALL be the canonical repository name for repository-owned locations and `null` otherwise. Existing `sourceScriptPath` SHALL be the absolute path for a file and `null` for inline config. No outcome field, message, warning, error, or diagnostic SHALL contain or derive inline snippet text. Existing success `data.hookOutcomes` and failure `error.details.hookOutcomes` locations, status/reason vocabulary, duration rules, ordering, and fail-fast evaluated-prefix behavior SHALL remain unchanged.

#### Scenario: Inline hook succeeds

- **WHEN** JSON create or remove executes a repository-owned inline hook successfully
- **THEN** its outcome has `sourceKind: "inline-config"`, `sourceOwnerKind: "repository"`, canonical `sourceOwnerName`, and `sourceScriptPath: null`
- **AND** contains no snippet text

#### Scenario: File hook succeeds

- **WHEN** JSON create or remove executes an existing file hook
- **THEN** its outcome has `sourceKind: "file"`, accurate owner metadata, and its absolute `sourceScriptPath`
- **AND** all pre-existing record fields retain their meanings

#### Scenario: Inline failure is preserved at canonical location

- **WHEN** an inline hook fails, times out, or fails preflight and the command fails
- **THEN** the evaluated records appear at `error.details.hookOutcomes` with the exact classified reason
- **AND** stdout remains one JSON document with no human or snippet disclosure

### Requirement: Disabled, quiet, input, and timeout JSON behavior is source-neutral

JSON create SHALL apply its existing `--no-hooks`; JSON create/remove SHALL apply existing `--no-hook-input`, timeout, JSON-owned quiet/progress isolation, and immediate-EOF behavior equally to inline and file sources. Remove MUST NOT acquire `--no-hooks`. No source-neutral policy SHALL add a second JSON document or human hook output to stdout.

#### Scenario: JSON create disables hooks

- **WHEN** JSON create uses `--no-hooks`
- **THEN** no inline/file source is discovered, preflighted, or executed after configuration validation
- **AND** the existing disabled result representation is preserved

#### Scenario: JSON inline hook reads or times out

- **WHEN** an inline hook reads stdin or exceeds the timeout under JSON execution
- **THEN** stdin is immediate EOF and timeout classification remains exact where applicable
- **AND** only the final structured envelope is written to stdout

### Requirement: Inline dry-run JSON preserves each command's existing preview surface

Remove dry-run JSON SHALL describe applicable inline/file plans with source-kind, owner, logical lifecycle, scope, target, selected interpreter, and file path where applicable, while omitting snippet text. It MUST NOT execute hooks or fabricate success/failure outcome records. Configured-create dry-run JSON SHALL preserve its existing no-hook-discovery behavior, empty `hookOutcomes`, and absence of a hook-preview surface for both inline and file configuration.

#### Scenario: Remove dry-run JSON previews inline hook

- **WHEN** `arashi remove --dry-run --json` resolves an inline source
- **THEN** its existing hook preview contains only the normative non-secret metadata
- **AND** no execution outcome or process is produced

#### Scenario: Configured-create dry-run remains source-neutral by omission

- **WHEN** `arashi create --dry-run --json` loads valid inline or file hook configuration
- **THEN** it performs no hook discovery or interpreter preflight and returns the existing empty `hookOutcomes`
- **AND** it does not add a hook-preview field or fabricate source metadata

### Requirement: Configuration and ambiguity failures remain structured and pre-mutation

Invalid inline configuration SHALL use the existing canonical JSON configuration failure. Same-location ambiguity SHALL map to `reasonCode: "validation_failed"`; unavailable interpreter preflight SHALL map to `reasonCode: "interpreter_unavailable"`. Configured-create command failure SHALL retain code `CREATE_FAILED`, configured-remove preflight failure SHALL retain `HOOK_CONFIGURATION_INVALID`, and both SHALL expose structured hook details containing logical source metadata and any file path but no snippet. These failures MUST precede hook discovery for invalid configuration and lifecycle mutation for resolver failures.

#### Scenario: Invalid inline value fails in JSON mode

- **WHEN** a JSON command loads an empty, unknown, unsupported, or wrong-typed inline value
- **THEN** stdout contains one canonical configuration error envelope
- **AND** no discovery, mutation, prompt, or snippet disclosure occurs

#### Scenario: Inline/file ambiguity fails in JSON mode

- **WHEN** enabled JSON create/remove finds a same-location collision
- **THEN** stdout contains one structured failure identifying scope, owner, source kinds, and file path
- **AND** no lifecycle mutation occurs

### Requirement: Configured create JSON reports repository materialization outcomes

Configured `create --json` success, dry-run, and failure envelopes SHALL expose ordered per-repository materialization outcomes without changing the existing envelope schema version or stdout-isolation contract. Executed records at `data.repositoryResults[].materializationOutcomes`, or at `error.details.repositoryResults[].materializationOutcomes` on failure, SHALL contain `action`, normalized repository-relative `path`, `status`, `reasonCode`, and bounded `message`; status SHALL be `copied`, `linked`, `skipped`, `failed`, or `rolled-back`. Dry-run records SHALL appear at `data.dryRunOutcome.materializationPlans[]` as `{ repositoryId, outcomes }`, with outcome status `would-copy`, `would-link`, `skipped`, or `blocked`, and MUST NOT populate executed repository results. `reasonCode` SHALL be one of `none`, `source_missing`, `source_checkout_unavailable`, `source_inspection_failed`, `source_link_broken`, `source_escape`, `source_cycle`, `destination_exists`, `destination_ancestor_unsafe`, `destination_inspection_failed`, `symlink_unsupported`, `copy_failed`, `symlink_failed`, `rolled_back`, or `rollback_failed`. Failed-command details SHALL preserve the existing command-wide rollback summary independently and SHALL add `materializationRollback: { attempted, complete, failureCount, failures }` for materialization cleanup only; each materialization failure entry SHALL identify `repositoryId`, `action`, `path`, `reasonCode: "rollback_failed"`, and bounded `message`. Branch, worktree, and generic directory rollback failures remain in the existing command-wide rollback shape and MUST NOT be forced to invent materialization fields.

#### Scenario: JSON create succeeds with materialization

- **WHEN** configured create copies, links, or skips declared paths and otherwise succeeds with `--json`
- **THEN** stdout contains exactly one `ok: true`, `command: "create"` envelope
- **AND** each repository result contains its outcomes in copy-then-symlink declaration order

#### Scenario: Actionable JSON dry-run previews materialization

- **WHEN** configured create runs with `--dry-run --json` and no materialization blocker exists
- **THEN** stdout contains one `ok: true` envelope, the process exits zero, and ordered plans appear at `data.dryRunOutcome.materializationPlans`
- **AND** no record falsely claims a file was copied or link was created
- **AND** each plan status is exactly `would-copy`, `would-link`, or `skipped`
- **AND** no hook, Git, managed-ignore, directory, file, or link mutation occurs

#### Scenario: Blocked JSON dry-run reports an error plan

- **WHEN** configured create runs with `--dry-run --json` and one or more materialization outcomes are `blocked`
- **THEN** stdout contains one `ok: false` envelope with `error.code: "MATERIALIZATION_PLAN_BLOCKED"` and the process exits nonzero
- **AND** ordered plans appear at `error.details.dryRunOutcome.materializationPlans` with at least one `blocked` status
- **AND** executed `repositoryResults` and `materializationOutcomes` are absent

#### Scenario: JSON materialization fails

- **WHEN** a destination conflict, path-containment problem, source-checkout failure, copy failure, or symlink capability failure blocks create
- **THEN** stdout contains exactly one structured failure envelope
- **AND** `error.details.repositoryResults` preserves affected and previously completed repository results with their materialization ledgers
- **AND** `error.details.materializationRollback` reports whether materialization cleanup was attempted, complete, and which bounded materialization cleanup failures remain
- **AND** existing command-wide rollback details retain branch/worktree/directory cleanup failures without invented action/path fields

#### Scenario: Later lifecycle failure rolls materialization back

- **WHEN** materialization succeeds but a later create hook or repository operation fails and rollback removes owned destinations
- **THEN** the failure envelope reports confirmed removed outcomes as `rolled-back`
- **AND** uses `rolled_back` for confirmed cleanup and `rollback_failed` plus `materializationRollback.complete: false` for incomplete materialization cleanup

#### Scenario: Materialization output protects contents

- **WHEN** human or JSON output reports a configured source or destination
- **THEN** it includes only bounded repository identity, action, relative path, status, and diagnostics
- **AND** includes no file contents, hashes, environment values, or copied data
