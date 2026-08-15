## MODIFIED Requirements

### Requirement: Fall back to ordinary clone when worktree completion is unavailable
The system SHALL preserve ordinary missing-repository clone behavior when the current workspace is not a coordinated worktree or when no usable local source repository can be resolved for a selected missing repository, including exact preservation of configured SSH alias URLs.

#### Scenario: Ordinary workspace clones from configured git URL
- **WHEN** the user runs `arashi clone` from a workspace that is not a coordinated worktree
- **THEN** selected missing repositories are cloned from their configured git URLs using the existing clone behavior

#### Scenario: Source repository cannot be resolved
- **WHEN** the user selects a missing repository for clone completion from a coordinated worktree
- **AND** the command cannot resolve a local source repository for that missing repository
- **THEN** the command uses the existing configured git URL clone behavior for that repository

#### Scenario: Remote fallback uses an SSH alias unchanged
- **WHEN** local worktree completion is unavailable for a selected repository configured with `ssh://deploy@work-github/acme/api.git`
- **THEN** ordinary clone fallback passes exactly `ssh://deploy@work-github/acme/api.git` to Git
- **AND** Arashi does not resolve, reconstruct, or convert the SSH host alias
