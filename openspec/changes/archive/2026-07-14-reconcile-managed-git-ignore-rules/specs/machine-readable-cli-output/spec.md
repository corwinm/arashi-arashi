## ADDED Requirements

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
