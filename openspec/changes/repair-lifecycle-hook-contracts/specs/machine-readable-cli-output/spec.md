## ADDED Requirements

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
