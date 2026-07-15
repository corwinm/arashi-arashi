## ADDED Requirements

### Requirement: Implicit standalone mode uses a fixed worktree location
The configurable worktree-location contract SHALL remain authoritative for configured workspaces, while implicit standalone workspaces SHALL use the fixed main-root `.worktrees` base and natural branch-relative destination.

#### Scenario: Standalone branch path resolves
- **WHEN** standalone create plans branch `feat/example`
- **THEN** the destination is `<main-root>/.worktrees/feat/example`
- **AND** no repository-name prefix or configured default location is applied

#### Scenario: Configured custom location exists
- **WHEN** a valid configured workspace defines `worktreesDir`
- **THEN** Arashi continues using the configured location and existing configured path strategy
- **AND** the presence of a root `.worktrees/` directory does not override it

#### Scenario: Standalone invocation starts in linked worktree
- **WHEN** standalone create runs from a linked worktree
- **THEN** the fixed base remains the Git main worktree's `.worktrees/` directory
