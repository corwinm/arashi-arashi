# scoped-lifecycle-hooks Specification

## Purpose
TBD - created by archiving change expand-hooks-scope-and-options. Update Purpose after archive.
## Requirements
### Requirement: Multi-scope lifecycle hook discovery
The system SHALL discover lifecycle hook scripts for a target repository from three scopes: repository-local (`repos/<repo>/.arashi/hooks/<lifecycle>.sh`), workspace-root (`.arashi/hooks/<lifecycle>.sh`), and user-global (`~/.arashi/hooks/<lifecycle>.sh` and `~/.arashi/hooks/<repo>/<lifecycle>.sh`).

#### Scenario: Hooks are present in multiple scopes
- **WHEN** a lifecycle event is triggered for repository `<repo>` and scripts exist in repository-local, workspace-root, and user-global paths
- **THEN** the system includes all discovered scripts in the lifecycle execution plan

#### Scenario: Some scopes do not define a hook
- **WHEN** a lifecycle event is triggered and one or more scope paths do not contain the lifecycle script
- **THEN** the system skips missing scripts without failing solely because the files are absent

### Requirement: Deterministic execution order across scopes
The system MUST execute lifecycle hooks in deterministic order by scope: repository-local first, workspace-root second, and user-global last.

#### Scenario: Scope ordering is enforced
- **WHEN** lifecycle scripts are discovered in all three scopes
- **THEN** execution occurs in the exact order repository-local, workspace-root, user-global

### Requirement: Scope-specific working directory behavior
The system SHALL execute each lifecycle script with a working directory appropriate to its scope: repository-local hooks in the child repository path, workspace-root hooks in the workspace root path, and user-global hooks in the target repository path.

#### Scenario: Repository-local hook runs in child repository
- **WHEN** a repository-local lifecycle script executes
- **THEN** the script process working directory is `repos/<repo>/`

#### Scenario: Workspace-root hook runs in workspace root
- **WHEN** a workspace-root lifecycle script executes
- **THEN** the script process working directory is the workspace root repository

#### Scenario: User-global hook runs in target repository context
- **WHEN** a user-global lifecycle script executes for repository `<repo>`
- **THEN** the script process working directory is `repos/<repo>/`

