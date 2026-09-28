## ADDED Requirements

### Requirement: Create T3 handoff JSON results

`aw create --t3 --json` SHALL use the standard one-document create envelope and include separate workspace creation, project, thread, prompt dispatch, UI, permission, bridge compatibility, receipt, and recovery fields without raw bridge output, prompt text, task-derived titles, credentials, or authenticated URLs.

#### Scenario: JSON handoff succeeds

- **WHEN** a JSON-mode create successfully hands the exact parent workspace to T3
- **THEN** stdout contains exactly one valid `command: "create"` success envelope
- **AND** data contains the exact workspace path, branch, effective permission, compatible bridge version, sanitized environment/project/thread identifiers, successful dispatch, and UI mode `none`

#### Scenario: JSON handoff fails after workspace creation

- **WHEN** JSON-mode create succeeds but T3 handoff fails or is indeterminate
- **THEN** stdout contains exactly one valid `command: "create"` error envelope
- **AND** error details preserve the complete successful creation data plus sanitized handoff stage, receipt, and recovery guidance
- **AND** the process exits nonzero without human text on stdout

#### Scenario: JSON validation fails before mutation

- **WHEN** JSON-mode handoff has invalid prompt, permission, bridge, or conflicting launch input
- **THEN** stdout contains exactly one valid structured error envelope
- **AND** no workspace, receipt, project, or thread mutation occurs
