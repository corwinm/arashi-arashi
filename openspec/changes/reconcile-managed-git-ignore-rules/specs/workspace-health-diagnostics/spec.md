## ADDED Requirements

### Requirement: Doctor reports managed ignore health without mutation
The system SHALL inspect configured managed ignore state during `arashi doctor`, SHALL emit stable findings for actionable problems, and SHALL NOT repair ignore files or clone-local Git configuration.

#### Scenario: Safe managed path is not ignored
- **WHEN** doctor finds a safe configured `reposDir` or `worktreesDir` with no effective tracked, repository-local, or global ignore rule
- **THEN** doctor reports a managed-ignore finding that identifies the path and effective scope
- **AND** the finding suggests an appropriate lifecycle command or explicit ignore-scope repair
- **AND** doctor does not modify any ignore file

#### Scenario: Stored ignore scope is invalid
- **WHEN** doctor finds an unsupported clone-local Arashi ignore-scope value
- **THEN** doctor reports a stable configuration finding with a command or Git-config repair suggestion
- **AND** doctor does not replace the stored value automatically

#### Scenario: Arashi-owned rule is stale
- **WHEN** doctor finds an entry inside an Arashi-managed ignore block that no longer corresponds to a current safe configured path
- **THEN** doctor reports a non-mutating stale managed-ignore finding identifying the rule and source file
- **AND** doctor preserves the entry and unrelated user-authored rules

#### Scenario: Configured path is unsafe to auto-ignore
- **WHEN** doctor finds a managed path that resolves to repository root, an absolute location, or parent traversal
- **THEN** doctor reports that Arashi will not automatically add an ignore rule for that path
- **AND** the finding distinguishes the safety skip from a missing safe rule

#### Scenario: Managed ignore state is healthy
- **WHEN** all safe configured managed paths have effective ignore rules and any stored scope is valid
- **THEN** doctor emits no managed-ignore warning or blocking finding
