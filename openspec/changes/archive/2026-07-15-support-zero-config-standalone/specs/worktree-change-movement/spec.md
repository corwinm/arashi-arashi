## ADDED Requirements

### Requirement: Move supports implicit standalone worktrees
`arashi move` SHALL discover source and target worktrees within the resolved standalone repository and preserve existing validation, conflict, transfer, restoration, and rollback behavior.

#### Scenario: Eligible standalone changes move
- **WHEN** a user selects source and target worktrees of the same implicit standalone repository and the changes are eligible
- **THEN** Arashi transfers the requested uncommitted changes using existing safety semantics
- **AND** does not require or write configured repository entries

#### Scenario: Target is outside the repository
- **WHEN** a candidate target does not belong to the resolved standalone repository
- **THEN** Arashi excludes or rejects it rather than broadening scope

#### Scenario: Standalone move fails
- **WHEN** transfer, apply, cleanup, or restoration fails
- **THEN** Arashi preserves existing rollback and recovery guidance
- **AND** creates no implicit configuration
