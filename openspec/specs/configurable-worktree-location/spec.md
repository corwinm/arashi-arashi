# configurable-worktree-location Specification

## Purpose
TBD - created by archiving change add-config-option-for-worktrees-locations. Update Purpose after archive.
## Requirements
### Requirement: Workspace configuration defines worktree base location
The system SHALL support a workspace configuration field that defines the base directory used for newly created worktrees, SHALL persist the repository-aware default selected by configured initialization, and SHALL retain `.arashi/worktrees/` as the compatibility fallback when an existing configuration omits the field.

#### Scenario: Explicit configured location is used
- **WHEN** the workspace config provides a worktree location value
- **THEN** new worktree paths are created under that configured base directory

#### Scenario: New bare initialization persists its selected default
- **WHEN** configured initialization resolves a bare repository and the worktree-location option is omitted
- **THEN** the workspace config persists `..` as the worktree base location
- **AND** later commands use that configured value rather than re-inferring repository type

#### Scenario: New non-bare initialization persists its selected default
- **WHEN** configured initialization resolves a non-bare repository and the worktree-location option is omitted
- **THEN** the workspace config persists `.arashi/worktrees` as the worktree base location

#### Scenario: Legacy omitted configuration uses compatibility fallback
- **WHEN** an existing workspace config does not provide a worktree location value
- **THEN** the system MUST use `.arashi/worktrees/` as the compatibility base directory
- **AND** reading the config does not automatically persist or migrate the omitted field

### Requirement: Relative path inputs are normalized consistently
The system MUST normalize supported relative path inputs for worktree location, including optional trailing slash variants, before destination paths are used.

#### Scenario: Dot path variants normalize to repository root
- **WHEN** the configured location is `.` or `./`
- **THEN** destination resolution treats both values as the same repository-root base path

#### Scenario: Managed directory variants normalize identically
- **WHEN** the configured location is `.arashi/worktrees` or `.arashi/worktrees/`
- **THEN** destination resolution treats both values as the same base path

#### Scenario: Parent directory variant remains valid
- **WHEN** the configured location is `../` (or equivalent trailing-slash form)
- **THEN** destination resolution uses the workspace parent directory as the base path

### Requirement: Worktree creation uses a single resolved base path
All commands that create worktrees MUST derive their destination from a shared resolved worktree base path rather than command-specific path logic.

#### Scenario: Worktree-producing commands resolve destinations consistently
- **WHEN** different commands create worktrees in the same workspace configuration
- **THEN** each command resolves the same destination base path for equivalent inputs

### Requirement: Default managed worktree directory is git-ignored
The system SHALL ensure the active managed worktree location is effectively ignored by Git in an idempotent way when that location is an applicable safe repository-relative working-tree directory pattern, using configured lifecycle reconciliation and repository-local rules by default. Paths resolved from a canonical bare repository root are not working-tree paths and SHALL follow the bare non-worktree reporting contract instead.

#### Scenario: Default path adds missing local ignore entry
- **WHEN** the default managed location is active in a non-bare workspace, Git reports no effective ignore rule for `.arashi/worktrees/`, and no non-default scope is stored
- **THEN** the system adds `.arashi/worktrees/` to the repository-local exclude file resolved through Git without duplicating entries
- **AND** the system does not modify tracked `.gitignore`

#### Scenario: Configured managed subdirectory adds missing local ignore entry
- **WHEN** a non-default worktree location is configured as an applicable repository-relative working-tree subdirectory and Git reports no effective ignore rule for its normalized trailing-slash entry
- **THEN** lifecycle reconciliation adds the normalized configured worktree directory entry to the active local-default ignore target without duplication

#### Scenario: Existing effective ignore entry is preserved without duplication
- **WHEN** Git reports that the normalized applicable worktree location is already ignored by a tracked, repository-local, or global rule
- **THEN** initialization, pull, clone, and create flows complete without adding another ignore rule

#### Scenario: Tracked scope adds missing tracked entry
- **WHEN** the clone-local ignore preference is `tracked` and an applicable safe worktree location has no effective ignore rule
- **THEN** lifecycle reconciliation adds the normalized location to workspace-root `.gitignore`

#### Scenario: Unsafe broad locations are not auto-ignored
- **WHEN** the configured worktree location resolves to repository root (`.` or `./`), an absolute path, or parent traversal (`../` variants)
- **THEN** lifecycle reconciliation does not add a worktree-location pattern to tracked or repository-local ignore files
- **AND** the unsafe skip is reported in the supported command output

#### Scenario: Bare-root subdirectory is not a working-tree ignore candidate
- **WHEN** configured init resolves a worktree location beneath a canonical bare repository root
- **THEN** the path is reported as non-applicable to working-tree ignore rules
- **AND** init does not inspect or mutate ignore files for that path

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
