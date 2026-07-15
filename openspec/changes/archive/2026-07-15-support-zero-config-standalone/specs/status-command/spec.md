## ADDED Requirements

### Requirement: Status inspects implicit standalone repository state
`arashi status` SHALL inspect the resolved standalone main repository and its linked worktrees without requiring or writing persisted Arashi configuration.

#### Scenario: Status runs from main worktree
- **WHEN** a user runs status in an implicit standalone main worktree
- **THEN** the result identifies standalone mode, main root, current branch, Git status, remote/default-branch relationships, and relevant linked worktree state

#### Scenario: Status runs from linked worktree
- **WHEN** a user runs status from a linked worktree in the implicit workspace
- **THEN** Arashi resolves the same main repository workspace
- **AND** preserves caller/current-worktree context without inventing configured child repositories

#### Scenario: Invalid config exists
- **WHEN** a discovered `.arashi/config.json` is invalid beside the standalone convention
- **THEN** status reports the configuration error instead of standalone results
