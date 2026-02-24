## MODIFIED Requirements

### Requirement: Default managed worktree directory is git-ignored
The system SHALL ensure the active managed worktree location is ignored by git in an idempotent way when that location is a safe repository-relative directory pattern.

#### Scenario: Default path adds missing ignore entry
- **WHEN** the default managed location is active and `.gitignore` lacks `.arashi/worktrees/`
- **THEN** the system adds `.arashi/worktrees/` to ignore rules without duplicating entries

#### Scenario: Configured managed subdirectory adds missing ignore entry
- **WHEN** a non-default worktree location is configured as a repository-relative subdirectory and `.gitignore` lacks its normalized trailing-slash entry
- **THEN** the system adds the normalized configured worktree directory entry without duplicating entries

#### Scenario: Existing configured ignore entry is preserved without duplication
- **WHEN** `.gitignore` already includes the normalized active worktree location entry
- **THEN** setup and initialization flows complete without adding duplicate ignore lines

#### Scenario: Unsafe broad locations are not auto-ignored
- **WHEN** the configured worktree location resolves to repository root (`.`/`./`) or parent traversal (`../` variants)
- **THEN** setup and initialization flows do not auto-add a worktree-location ignore pattern
