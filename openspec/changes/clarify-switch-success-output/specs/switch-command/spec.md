## ADDED Requirements

### Requirement: Report the selected switch target unambiguously

After a successful human-readable switch, the system SHALL identify the selected branch before any repository context, SHALL label repository identity explicitly, and SHALL report the selected absolute worktree path. The same selected-target-first ordering SHALL apply to every launched context and parent-shell directory switch.

#### Scenario: Launched context reports selected target first

- **WHEN** `arashi switch` successfully opens any supported terminal, managed-session, or editor context for a selected worktree
- **THEN** the success output identifies the selected branch before repository context
- **AND** labels the repository identity explicitly
- **AND** reports the selected absolute worktree path

#### Scenario: Parent-shell directory switch reports selected target first

- **WHEN** `arashi switch` successfully prepares a parent-shell directory change for a selected worktree
- **THEN** the success output identifies the selected branch before repository context
- **AND** labels the repository identity explicitly
- **AND** reports the selected absolute worktree path

#### Scenario: Repository context disambiguates matching branches

- **WHEN** coordinated repositories contain worktrees with the same selected branch name
- **THEN** human success output retains the selected candidate's explicitly labeled repository identity
