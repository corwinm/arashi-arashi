## ADDED Requirements

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
When the default managed worktree location is in use, the system SHALL ensure `.arashi/worktrees/` is ignored by git in an idempotent way.

#### Scenario: Default path adds missing ignore entry
- **WHEN** the default managed location is active and `.gitignore` lacks `.arashi/worktrees/`
- **THEN** the system adds `.arashi/worktrees/` to ignore rules without duplicating entries

#### Scenario: Existing ignore entry is preserved without duplication
- **WHEN** `.gitignore` already includes `.arashi/worktrees/`
- **THEN** setup and initialization flows complete without adding duplicate ignore lines
