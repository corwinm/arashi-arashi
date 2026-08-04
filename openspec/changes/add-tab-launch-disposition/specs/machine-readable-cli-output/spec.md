## ADDED Requirements

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
