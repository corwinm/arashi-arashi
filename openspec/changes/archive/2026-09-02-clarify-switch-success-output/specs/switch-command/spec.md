## ADDED Requirements

### Requirement: Report the selected switch target unambiguously

After a successful human-readable switch, the system SHALL identify the selected branch before any repository context, SHALL label repository identity explicitly, and SHALL report the selected absolute worktree path. Excluding the logger's success marker, launched-context success output SHALL use the exact template `Opened <mode> context for <branch> in repository <repository> at <absolute-path>`, and parent-shell directory-switch success output SHALL use the exact template `Prepared shell directory switch to <branch> in repository <repository> at <absolute-path>`.

#### Scenario: Launched context reports selected target first

- **WHEN** `arashi switch` successfully opens any supported terminal, managed-session, or editor context for a selected worktree
- **THEN** the success message body is exactly `Opened <mode> context for <branch> in repository <repository> at <absolute-path>` using the selected candidate's values

#### Scenario: Parent-shell directory switch reports selected target first

- **WHEN** `arashi switch` successfully prepares a parent-shell directory change for a selected worktree
- **THEN** the success message body is exactly `Prepared shell directory switch to <branch> in repository <repository> at <absolute-path>` using the selected candidate's values

#### Scenario: Repository context disambiguates matching branches

- **WHEN** coordinated repositories contain worktrees with the same selected branch name
- **THEN** human success output retains the selected candidate's explicitly labeled repository identity
