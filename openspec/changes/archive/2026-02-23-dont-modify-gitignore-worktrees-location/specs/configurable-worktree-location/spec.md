## ADDED Requirements

### Requirement: Default managed worktree location avoids ignore file mutation
When the default managed worktree location is in use, setup and initialization flows SHALL NOT modify `.gitignore` solely to add `.arashi/worktrees/`.

#### Scenario: Default path leaves missing ignore entry untouched
- **WHEN** the default managed location is active and `.gitignore` does not include `.arashi/worktrees/`
- **THEN** setup and initialization complete without adding `.arashi/worktrees/` to `.gitignore`

#### Scenario: Existing ignore entry is preserved without rewrite
- **WHEN** `.gitignore` already includes `.arashi/worktrees/`
- **THEN** setup and initialization complete without modifying existing ignore file contents

## REMOVED Requirements

### Requirement: Default managed worktree directory is git-ignored
**Reason**: Git worktree handling already avoids tracking worktree administrative paths, so forcing `.gitignore` updates is redundant and creates unnecessary repository diffs.
**Migration**: Remove test and workflow assumptions that Arashi inserts `.arashi/worktrees/` into `.gitignore`; existing user-authored ignore entries remain valid but optional.
