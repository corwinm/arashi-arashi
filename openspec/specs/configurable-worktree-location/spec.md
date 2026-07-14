# configurable-worktree-location Specification

## Purpose
TBD - created by archiving change add-config-option-for-worktrees-locations. Update Purpose after archive.
## Requirements
### Requirement: Workspace configuration defines worktree base location
The system SHALL support a workspace configuration field that defines the base directory used for newly created worktrees.

#### Scenario: Explicit configured location is used
- **WHEN** the workspace config provides a worktree location value
- **THEN** new worktree paths are created under that configured base directory

#### Scenario: Default location is used when configuration is omitted
- **WHEN** the workspace config does not provide a worktree location value
- **THEN** the system MUST use `.arashi/worktrees/` as the default base directory

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
The system SHALL ensure the active managed worktree location is effectively ignored by Git in an idempotent way when that location is a safe repository-relative directory pattern, using configured lifecycle reconciliation and repository-local rules by default.

#### Scenario: Default path adds missing local ignore entry
- **WHEN** the default managed location is active, Git reports no effective ignore rule for `.arashi/worktrees/`, and no non-default scope is stored
- **THEN** the system adds `.arashi/worktrees/` to the repository-local exclude file resolved through Git without duplicating entries
- **AND** the system does not modify tracked `.gitignore`

#### Scenario: Configured managed subdirectory adds missing local ignore entry
- **WHEN** a non-default worktree location is configured as a repository-relative subdirectory and Git reports no effective ignore rule for its normalized trailing-slash entry
- **THEN** lifecycle reconciliation adds the normalized configured worktree directory entry to the active local-default ignore target without duplication

#### Scenario: Existing effective ignore entry is preserved without duplication
- **WHEN** Git reports that the normalized active worktree location is already ignored by a tracked, repository-local, or global rule
- **THEN** initialization, pull, clone, and create flows complete without adding another ignore rule

#### Scenario: Tracked scope adds missing tracked entry
- **WHEN** the clone-local ignore preference is `tracked` and the safe active worktree location has no effective ignore rule
- **THEN** lifecycle reconciliation adds the normalized location to workspace-root `.gitignore`

#### Scenario: Unsafe broad locations are not auto-ignored
- **WHEN** the configured worktree location resolves to repository root (`.` or `./`), an absolute path, or parent traversal (`../` variants)
- **THEN** lifecycle reconciliation does not add a worktree-location pattern to tracked or repository-local ignore files
- **AND** the unsafe skip is reported in the supported command output
