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

### Requirement: JSON commands preserve configured-base roles and outcomes

Configured `status`, `pull`, `push`, `handoff`, and `doctor` JSON output SHALL represent configured-base policy without conflating it with current-branch upstream or remote-default roles. Comparison records SHALL include the logical branch, source, concrete remote/ref when known, ahead/behind counts when available, state, and machine-readable unavailable reason/details when comparison was requested but could not complete. Command-specific records SHALL additionally expose their pull, publishability, handoff, or finding outcome through the existing single-document envelope.

#### Scenario: Status JSON exposes all comparison roles

- **WHEN** configured status can evaluate upstream, configured base, and remote default
- **THEN** its repository record contains distinct structured role objects with branch, target, state, ahead, and behind values
- **AND** consumers can distinguish configured policy from upstream and remote metadata

#### Scenario: Shared base/default target remains role-complete

- **WHEN** configured base and remote default resolve to the same remote ref
- **THEN** JSON preserves both role objects and identifies their common target
- **AND** it does not imply that duplicate fetch or comparison work occurred

#### Scenario: Configured base is unavailable

- **WHEN** a configured-base comparison is requested but cannot complete
- **THEN** JSON retains the configured branch and source with unavailable state and stable reason/details
- **AND** it does not replace the record with default-branch data

#### Scenario: Pull and push JSON identify decision baselines

- **WHEN** configured pull selects a base or no-upstream configured push evaluates publishability
- **THEN** each repository outcome identifies the base source, branch, concrete target, comparison state, and mutation/skipped/failed result
- **AND** stdout remains exactly one JSON document

#### Scenario: Handoff and doctor JSON consume the same base state

- **WHEN** handoff or doctor reports a configured-base comparison
- **THEN** its structured data agrees with status for branch, target, counts, and unavailable reason
- **AND** command-specific Markdown or human diagnostics do not contaminate stdout

#### Scenario: Legacy configuration fails structurally

- **WHEN** a JSON-capable command reads configuration containing `defaults.create.baseBranch`
- **THEN** stdout contains one structured pre-mutation configuration error naming the removed path and canonical migration targets
- **AND** no repository result falsely claims inspection or mutation

### Requirement: Configure JSON mode is sanitized inspection only

`aw configure --json` SHALL require a canonically configured valid workspace, SHALL emit exactly one standard JSON envelope on stdout, and SHALL perform sanitized inspection without prompting or mutation. Its command-specific data SHALL use the CLI-owned explicit configure descriptors to report canonical path, scope, configured presence, safely projected configured state, and separately labeled inherited or built-in effective state. Inline command bodies, generated active-file contents, and broad non-interactive mutation controls MUST remain absent.

#### Scenario: Valid configured workspace is inspected

- **WHEN** a user runs `aw configure --json` in a valid configured workspace
- **THEN** stdout contains exactly one success envelope with `command: "configure"`, `schemaVersion: 1`, one command-specific data object, and a warnings array
- **AND** no prompt, progress line, spinner, banner, or other human output is written to stdout
- **AND** configuration bytes and active files remain unchanged

#### Scenario: Configured and effective state are distinct

- **WHEN** a supported field is absent from persisted raw configuration but has an inherited or built-in runtime value
- **THEN** its inspection record reports `Not configured`
- **AND** reports the effective value and source separately
- **AND** does not persist that effective value

#### Scenario: Inline sources are sanitized

- **WHEN** workspace or repository inline lifecycle commands are configured
- **THEN** inspection reports only lifecycle, source kind, and interpreter presence
- **AND** neither stdout nor stderr contains, hashes, truncates, or otherwise derives command bodies

#### Scenario: Workspace configuration is unavailable or invalid

- **WHEN** JSON inspection is invoked from configless or standalone context, or the persisted configuration is malformed or semantically invalid
- **THEN** stdout contains exactly one standard structured failure envelope
- **AND** the command fails before supported-field inspection, prompting, initialization, repair, migration persistence, or any other mutation

#### Scenario: Mutation flags are not exposed

- **WHEN** command help and generated contracts are inspected
- **THEN** configure JSON semantics are classified as sanitized inspection only
- **AND** broad `--set`, `--unset`, or equivalent non-interactive mutation controls are absent

### Requirement: Configured create JSON reports the authoritative destination plan

Configured `create --json` success, dry-run, invalid-naming-configuration, and destination-collision failure envelopes SHALL preserve the established one-document stdout-isolation contract while reflecting the effective configured naming policy. Success, dry-run, and collision destinations MUST come from the same immutable authoritative configured plan used by human output, collision preflight, and execution. The plan order SHALL be the configured parent first when selected, followed by selected child repositories in deterministic discovery/filter order; excluding the parent SHALL leave selected children in that same relative order. Successful execution SHALL preserve that order and the existing `data.repositories[]` record shape, reporting each destination at `data.repositories[].worktreePath`. Dry-run SHALL preserve `data.repositories` as the execution-result list and report prospective records in that same order at `data.dryRunOutcome.plannedWorktrees[]`, where every record contains `branchName`, `planStatus`, `repositoryName`, and `worktreePath`; `worktreePath` is an absolute string or `null` only when planning cannot resolve one. Destination preflight SHALL traverse this order. A resolved collision SHALL use error code `WORKTREE_DESTINATION_COLLISION` and report exactly the first colliding plan record at `error.details.conflict` with `repositoryName` and absolute `worktreePath`; later collisions SHALL NOT replace or reorder that record. Invalid `worktreeNaming` SHALL instead use the established invalid-configuration envelope before a destination plan exists and SHALL NOT be mislabeled as a collision. No replacement destination field or duplicate plan is introduced. Destination values SHALL follow omission/default corrected topology, `branch`, or `repo-branch` style plus `preserve` or `flatten` slash policy exactly, while `branchName` continues reporting the unmodified Git branch.

#### Scenario: Bare create JSON reports corrected destination

- **WHEN** configured bare create for repository component `example` and branch `feature/auth` succeeds with `--json` under omitted policy or explicit `default` and `preserve`
- **THEN** `data.repositories[].worktreePath` reports the parent destination beneath the effective base as `example/feature/auth`
- **AND** `branchName` remains `feature/auth`
- **AND** child records in `data.repositories[]` report destinations rooted at that exact parent destination plus each configured child path

#### Scenario: Non-bare dry-run JSON matches human preview

- **WHEN** configured non-bare create for branch `feature/auth` is previewed in human and `--dry-run --json` modes under omitted policy or explicit `default` and `preserve`
- **THEN** human preview and `data.dryRunOutcome.plannedWorktrees[].worktreePath` report the same parent destination ending in `feature/auth`
- **AND** neither reports a repository-prefixed destination
- **AND** each prospective JSON record contains exact `branchName: "feature/auth"`, `planStatus`, `repositoryName`, and `worktreePath`, while `data.repositories` remains the execution-result list
- **AND** dry-run performs no mutation

#### Scenario: Every configured naming policy changes values but not shape

- **WHEN** configured create success and dry-run render the same repository `example` and Git branch `feature/auth` under every supported style and slash-policy combination
- **THEN** destination values are respectively `feature/auth` or `example/feature/auth` for compatibility topology as applicable, `feature/auth` for `branch` preserve, `feature-auth` for `branch` flatten, `example-feature/auth` for `repo-branch` preserve, and `example-feature-auth` for `repo-branch` flatten
- **AND** the existing envelope, record field names, record order, omission/null rules, and exact `branchName: "feature/auth"` remain unchanged
- **AND** human preview, JSON dry-run, JSON success, and execution consume the same policy-specific plan

#### Scenario: JSON collision result uses the planned destination

- **WHEN** configured create JSON mode detects a parent or child destination collision, including a flattened-slash alias
- **THEN** stdout contains exactly one failure envelope with code `WORKTREE_DESTINATION_COLLISION`
- **AND** `error.details.conflict.repositoryName` and `error.details.conflict.worktreePath` identify the same resolved destination used by preflight
- **AND** stderr is empty and tests confirm that managed-ignore files, hooks, branches, worktrees, directories, and other filesystem state were not mutated

#### Scenario: Invalid naming config is distinct from collision JSON

- **WHEN** configured create JSON loads malformed `worktreeNaming` or an unsupported nested value
- **THEN** stdout contains exactly one established invalid-configuration failure envelope
- **AND** the code is not `WORKTREE_DESTINATION_COLLISION` and `error.details.conflict` is absent
- **AND** stderr is empty and no destination plan or mutation is produced

#### Scenario: JSON ordering and multi-collision selection are deterministic

- **WHEN** the configured parent and multiple selected child repositories are planned for JSON create under any supported naming policy
- **THEN** success `data.repositories[]` and dry-run `data.dryRunOutcome.plannedWorktrees[]` place the selected parent first and preserve deterministic selected-child discovery/filter order
- **AND WHEN** more than one destination in that ordered plan collides
- **THEN** `error.details.conflict` identifies the first colliding plan record and later collisions do not change the reported record

#### Scenario: Existing worktree JSON preserves registered path

- **WHEN** a JSON-capable lifecycle command reports an existing worktree created under a prior layout or a different configured naming policy
- **THEN** it reports the exact Git-registered path without rewriting it according to the current effective policy
- **AND** the envelope does not claim migration or rename activity

### Requirement: Delete JSON uses one closed sanitized payload contract

Explicit-key `aw delete <repository> --json` and `--dry-run --json` SHALL use the standard schema-version-1 single-document envelope. JSON SHALL NOT run omitted-target interactive selection and SHALL remain single-target. A successful delete `data` object SHALL contain exactly `workspace`, `repositoryKey`, `dryRun`, `force`, `confirmation`, `plan`, and `result`. `workspace` SHALL contain exactly `mode`, `repositoriesBase`, `workspaceRoot`, and `worktreesBase`. `repositoryKey` SHALL be the exact configured key; `dryRun` and `force` SHALL be booleans; `confirmation` SHALL be `not-required`, `confirmed`, `declined`, or `required`. JSON SHALL use only `not-required` or `required` because it never prompts.

The closed delete payload type SHALL be reused in delete-specific `error.details`: all seven fields are present, `workspace` may be `null` only when configured workspace resolution failed, `plan` may be `null` only when no complete plan exists, and `result` may be `null` only when execution never created a ledger. The omitted-key JSON `DELETE_SELECTION_REQUIRED` error SHALL instead have exact details `{command: "delete", reason: "repository-required"}` because no repository payload can exist. The existing standalone `CONFIGURED_WORKSPACE_REQUIRED` error SHALL retain its canonical exact details `{command: "delete", mode: "standalone"}` rather than pretending a configured workspace payload exists. Canonical CLI parse errors retain their existing standard details.

#### Scenario: JSON invocation omits repository

- **WHEN** a user runs `aw delete --json` or `aw delete --dry-run --json`, with or without `--force`
- **THEN** stdout contains exactly one `DELETE_SELECTION_REQUIRED` exit-`2` error envelope with exact details `{command: "delete", reason: "repository-required"}`
- **AND** no prompt, target inference, topology planning, lock, or mutation occurs

#### Scenario: JSON dry-run succeeds

- **WHEN** a user runs `aw delete api --dry-run --json`
- **THEN** stdout contains exactly one success envelope whose `data` has only the seven closed fields
- **AND** `confirmation` is `not-required`, `plan` is complete, `result` is `null`, and no prompt/progress/human summary is emitted

#### Scenario: Clean JSON mutation omits force

- **WHEN** a clean plan is produced for `aw delete api --json` without `--force`
- **THEN** stdout contains exactly one `DELETE_CONFIRMATION_REQUIRED` error envelope
- **AND** `error.details` has the exact seven-field delete payload with `confirmation: "required"`, complete `plan`, and `result: null`

#### Scenario: Planning fails after configured context exists

- **WHEN** topology, path, hook, Git inspection, or config validation fails before a complete plan exists
- **THEN** one delete-specific error envelope contains the exact seven-field details with `plan: null` and `result: null`
- **AND** no open-ended diagnostic fields or secret source content are appended

#### Scenario: Partial mutation fails

- **WHEN** irreversible work completes before a later phase fails
- **THEN** one `DELETE_PARTIAL_FAILURE` envelope contains the exact seven-field details with the accepted plan and complete result ledger
- **AND** no second JSON document or human output is written to stdout

### Requirement: Delete plans are exact deterministic records

A delete `plan` SHALL contain exactly `id`, `items`, and `warnings`. `id` SHALL be a lowercase 64-hex SHA-256 over the canonical closed projected plan plus non-secret authority digests. `items` SHALL be ordered deterministically and `warnings` SHALL be deduplicated bytewise-sorted strings. Repeated planning over byte/identity-equivalent state SHALL return the same `id`, item IDs/order, and warnings.

#### Scenario: Repeated dry-runs inspect unchanged state

- **WHEN** two JSON dry-runs inspect identical config/Git/filesystem/hook state
- **THEN** their plan objects are byte-equivalent after standard envelope timing fields are excluded

#### Scenario: Authority state changes

- **WHEN** exact config bytes, path identity, worktree registration, ref OID, hook metadata, or receipt state changes
- **THEN** revalidation cannot silently reuse the previous plan identity

### Requirement: Delete items have one exact common projection

Every delete plan/result item SHALL contain exactly `id`, `kind`, `ownership`, `path`, `ref`, `oid`, `planned`, `completed`, `state`, `reasonCode`, and `message`. `kind` SHALL be `resume-receipt`, `canonical-clone`, `linked-worktree`, `worktree-metadata`, `local-ref`, `config-entry`, `workspace-hook`, or `preserved-global-hook`; `ownership` SHALL be `delete` or `preserve`; `path`, `ref`, `oid`, `reasonCode`, and `message` SHALL be strings or `null`; a non-null `oid` SHALL be the full immutable Git object ID. `planned` and `completed` SHALL be booleans. `state` SHALL be `planned`, `completed`, `preserved`, `blocked`, `failed`, or `not-started`. No additional or omitted fields are allowed.

#### Scenario: Owned worktree is planned

- **WHEN** dry-run includes an owned linked worktree
- **THEN** its item has delete ownership, normalized absolute path, nullable ref/OID as applicable, `planned: true`, `completed: false`, `state: "planned"`, and null reason/message when unblocked

#### Scenario: Resume receipt is planned

- **WHEN** a mutating plan may require durable retry provenance
- **THEN** one `resume-receipt` item exposes the exact transaction-receipt path without receipt/config contents

#### Scenario: Preserved global hook is reported

- **WHEN** a repository-specific user-global hook path exists
- **THEN** its item has preserve ownership, `planned: false`, `completed: false`, and `state: "preserved"`
- **AND** path/logical ref may be exposed but bytes are never exposed

#### Scenario: Local branch, stash, or detached commit has no path

- **WHEN** a branch, stash, or detached checked-out commit is represented
- **THEN** `path` is `null`, `ref` is the complete canonical ref/detached identity, and `oid` is the full planned commit ID
- **AND** names containing `/` remain unchanged

#### Scenario: Local tag preserves object and peeled identities

- **WHEN** a local tag is represented
- **THEN** one `local-ref` item uses `ref: "refs/tags/<name>"` with the tag ref's exact object OID
- **AND** one adjacent `local-ref` item uses `ref: "refs/tags/<name>^{}"` with the peeled commit OID; lightweight tags retain both deterministic records even when the OIDs are equal

#### Scenario: Result records failure

- **WHEN** one planned item fails
- **THEN** it retains the same identity/kind/ownership/path/ref/OID and item position as the plan
- **AND** `completed` is false, `state` is `failed`, and reason/message are sanitized strings

### Requirement: Delete item and warning ordering is deterministic

Delete items SHALL be ordered by phase. Linked worktrees SHALL be deepest physical descendant first with normalized-path bytewise ties; refs, hooks, and receipt/config records SHALL use canonical bytewise identity order within their phase. Warnings SHALL be deduplicated and bytewise sorted. Plan and result SHALL retain the same item IDs and order; execution SHALL NOT append an undisclosed destructive target.

#### Scenario: Result is compared with the accepted plan

- **WHEN** mutating execution returns a result
- **THEN** every result item corresponds to the same-position plan item
- **AND** changed targets cause invalidation rather than item insertion

### Requirement: Delete results, phases, errors, and retry are closed

A delete `result` SHALL contain exactly `items`, `phases`, `retry`, and `warnings`. `warnings` SHALL be deduplicated bytewise-sorted strings. Every phase SHALL contain exactly `name`, `state`, `itemIds`, `error`, `startedOrder`, and `completedOrder`. Phase `name` SHALL be one of `provenance`, `worktrees`, `metadata`, `canonical-clone`, `workspace-hooks`, `configuration`, or `verification`; phases SHALL occur in that exact order. Phase `state` SHALL be `not-started`, `started`, `completed`, or `failed`; `itemIds` SHALL be ordered strings; `error` SHALL be `null` or contain exactly string `code` and `message`; order fields SHALL be non-negative integers or `null`.

`retry` SHALL contain exactly `safe`, `argv`, and `guidance`. `safe` SHALL be boolean; `argv` SHALL be an array of literal strings or `null`; `guidance` SHALL be sanitized prose. A safe human retry vector SHALL be exactly `["aw", "delete", repositoryKey, "--force"]`; a safe JSON retry vector SHALL be exactly `["aw", "delete", repositoryKey, "--force", "--json"]`. No shell-interpolated retry command string is permitted.

#### Scenario: All phases complete

- **WHEN** deletion and receipt cleanup succeed
- **THEN** every phase is `completed`, non-applicable phases have empty `itemIds`, all delete-owned lifecycle items are completed, and retry is not required

#### Scenario: Phase failure blocks dependents

- **WHEN** a worktree phase fails
- **THEN** that phase is failed and later phases remain not-started with null order fields
- **AND** retry is safe only when the exact durable receipt remains valid/current

#### Scenario: Receipt persistence becomes unsafe

- **WHEN** receipt creation/update is malformed, ambiguous, permission-unsafe, or fails after irreversible work
- **THEN** `retry.safe` is false, `argv` is null, and guidance requires manual inspection

#### Scenario: No-mutation failure occurs

- **WHEN** revalidation or provenance creation fails before irreversible work
- **THEN** no owned destructive item is completed and the specific error is used rather than partial failure

### Requirement: Delete error precedence and exit vocabulary are stable

After canonical CLI parsing, delete SHALL apply this precedence: configured workspace/config loading; target selection (explicit exact-key lookup, human-TTY checkbox outcome, or omitted non-TTY/JSON refusal); topology/path/hook/Git inspection for every selected key; complete ordered plan-set construction; Git-loss refusal; dry-run success; confirmation requirement/prompt; post-lock plan-set invalidation or concurrent change; execution failure; partial failure after irreversible completion anywhere in the batch. It SHALL use existing `CONFIGURED_WORKSPACE_REQUIRED` for standalone refusal and delete-specific `DELETE_SELECTION_REQUIRED`, `DELETE_REPOSITORY_NOT_FOUND`, `DELETE_CONFIG_INVALID`, `DELETE_TOPOLOGY_INVALID`, `DELETE_PATH_UNSAFE`, `DELETE_HOOK_AMBIGUOUS`, `DELETE_GIT_DATA_LOSS`, `DELETE_CONFIRMATION_REQUIRED`, `DELETE_CANCELLED`, `DELETE_CONCURRENT_CHANGE`, `DELETE_EXECUTION_FAILED`, or `DELETE_PARTIAL_FAILURE`.

Successful dry-run, mutation, and receipt-proven idempotent completion SHALL exit `0`. Empty/cancelled selection, omitted target outside a human TTY, decline/cancel, and clean non-interactive missing confirmation SHALL exit `2`. Every other listed failure SHALL exit `1`. `DELETE_PARTIAL_FAILURE` SHALL replace the initiating code whenever any irreversible item in the selected batch completed.

#### Scenario: Configuration is invalid before key lookup

- **WHEN** active configured state exists but cannot be parsed/validated
- **THEN** delete returns `DELETE_CONFIG_INVALID` exit `1` before key-not-found, plan, Git-loss, or confirmation handling

#### Scenario: Exact key is absent

- **WHEN** valid active configuration lacks the key and no valid receipt proves a completed config-removal phase
- **THEN** delete returns `DELETE_REPOSITORY_NOT_FOUND` exit `1` without destructive discovery/mutation

#### Scenario: Dirty mutation omits force

- **WHEN** a TTY, non-TTY, or JSON mutation plan has Git-loss blockers and omits `--force`
- **THEN** delete returns `DELETE_GIT_DATA_LOSS` exit `1` before prompt/confirmation-required handling
- **AND** the complete blocked plan is present when JSON details are available

#### Scenario: Dirty dry-run omits force

- **WHEN** JSON dry-run has Git-loss blockers and omits `--force`
- **THEN** it succeeds exit `0` with the complete blocked plan and no result/mutation

#### Scenario: Clean JSON mutation omits force

- **WHEN** a clean JSON mutation omits `--force`
- **THEN** delete returns `DELETE_CONFIRMATION_REQUIRED` exit `2`

#### Scenario: TTY user declines

- **WHEN** a clean TTY plan is declined or cancelled
- **THEN** delete records `DELETE_CANCELLED`, exits `2`, and leaves all state unchanged

#### Scenario: Concurrent state invalidates execution

- **WHEN** exact config/Git/filesystem/hook/receipt identity changes after confirmation and before irreversible work
- **THEN** delete returns `DELETE_CONCURRENT_CHANGE` exit `1` with no completed destructive item

#### Scenario: Unexpected executor failure occurs before irreversible work

- **WHEN** execution fails after provenance setup but before a destructive target completes
- **THEN** delete returns `DELETE_EXECUTION_FAILED` exit `1` and removes the receipt when safely possible

#### Scenario: Irreversible work precedes failure

- **WHEN** any destructive target completes before a later failure
- **THEN** delete returns `DELETE_PARTIAL_FAILURE` exit `1` with the exact plan/result and truthful safe/unsafe retry

### Requirement: Delete JSON is sanitized and stdout-isolated

Delete JSON SHALL expose paths, refs/OIDs, lifecycle names, receipt path/state, phase/error codes, and sanitized warnings needed for automation. It SHALL NOT expose hook contents, inline hook commands, inline environments, config bytes, receipt bytes, commit messages/bodies, credentials, or shell snippets. Spinner/progress/prompt/human summary output SHALL be suppressed in JSON mode; diagnostics SHALL remain inside the one envelope.

#### Scenario: Secret canaries exist

- **WHEN** config, hook, inline environment, commit, or receipt fixtures contain unique secret canaries
- **THEN** success, refusal, planning failure, concurrent failure, partial failure, stdout, stderr, and retry guidance omit every canary

### Requirement: Configured create JSON reports fitted paths and path-budget overflow

Configured create human, dry-run, JSON, and execution surfaces SHALL consume the same authoritative fitted destination plan. Existing success and dry-run record shapes SHALL remain unchanged. A path budget that cannot fit fixed topology SHALL return one standard failure envelope with code `WORKTREE_PATH_LENGTH_EXCEEDED`, exact details `repositoryName`, `worktreePath`, `maxPathLength`, and `minimumPathLength`, and empty stderr in JSON mode.

#### Scenario: JSON dry-run reports fitted destinations

- **WHEN** configured create with `maxPathLength` shortens an authoritative parent destination and runs with `--dry-run --json`
- **THEN** `data.dryRunOutcome.plannedWorktrees[].worktreePath` contains the exact final fitted absolute paths in deterministic plan order
- **AND** each `branchName` remains the exact requested Git branch
- **AND** human dry-run and later execution consume the same values

#### Scenario: JSON overflow is structured and mutation-free

- **WHEN** fixed selected topology cannot leave nine UTF-16 units for collision-resistant generated naming
- **THEN** stdout contains exactly one failure envelope with code `WORKTREE_PATH_LENGTH_EXCEEDED`
- **AND** `error.details` contains exactly `repositoryName`, `worktreePath`, `maxPathLength`, and `minimumPathLength`
- **AND** stderr is empty and no configuration, ignore, hook, branch, worktree, directory, or registration mutation occurs

#### Scenario: Existing collision contract uses the fitted path

- **WHEN** the final fitted destination is occupied or registered incompatibly
- **THEN** configured create retains `WORKTREE_DESTINATION_COLLISION`
- **AND** collision details identify the exact fitted destination rather than the ordinary over-budget candidate
