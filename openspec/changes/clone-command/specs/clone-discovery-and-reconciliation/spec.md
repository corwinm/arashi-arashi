## ADDED Requirements

### Requirement: Classify repository workspace state before clone actions
The system SHALL classify repository state before clone execution into configured-present, configured-missing, and local-unmanaged groups.

#### Scenario: Workspace has mixed repository states
- **WHEN** the user runs `arashi clone` and the workspace contains configured and unmanaged repositories
- **THEN** the command classifies repositories into configured-present, configured-missing, and local-unmanaged groups

### Requirement: Reconcile unmanaged local repositories
The system SHALL provide reconciliation options for unmanaged local repositories: add to configuration, delete local repository, or take no action.

#### Scenario: User adds unmanaged repository to configuration
- **WHEN** an unmanaged local repository is detected and the user chooses add-to-configuration
- **THEN** the command records the repository in workspace configuration with required metadata

#### Scenario: User deletes unmanaged repository
- **WHEN** an unmanaged local repository is detected and the user chooses delete
- **THEN** the command requests explicit confirmation before deleting the local repository

#### Scenario: User keeps unmanaged repository unchanged
- **WHEN** an unmanaged local repository is detected and the user chooses no action
- **THEN** the command leaves the local repository and configuration unchanged

### Requirement: Ignore already present configured repositories during clone target selection
The system SHALL exclude configured-present repositories from clone target prompts and clone-all execution.

#### Scenario: Configured repository is already cloned
- **WHEN** the user runs `arashi clone` and a configured repository already exists at its expected local path
- **THEN** that repository is not offered as a clone target
