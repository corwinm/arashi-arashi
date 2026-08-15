# partial-worktree-completion Specification

## Purpose
Define how Arashi completes intentionally partial coordinated worktrees by adding missing child repositories to the current branch while preserving ordinary clone behavior elsewhere.
## Requirements
### Requirement: Complete partial coordinated worktrees with missing child repositories
The system SHALL allow `arashi clone` to add selected missing configured child repositories to the current coordinated worktree using the current worktree branch when a source repository for that child exists locally.

#### Scenario: Missing child repository is added as a branch worktree
- **WHEN** the user runs `arashi clone` from a coordinated worktree whose current branch is `feat/example`
- **AND** a configured child repository is missing under the current worktree
- **AND** the corresponding source child repository exists in the canonical workspace
- **THEN** the command offers the missing child repository as a selection candidate
- **AND** selecting it creates a child repository worktree at the configured path on `feat/example`
- **AND** the command does not clone that repository's default branch from the remote

#### Scenario: Clone all completes all eligible missing child worktrees
- **WHEN** the user runs `arashi clone --all` from a coordinated worktree with multiple missing configured child repositories
- **AND** each missing child has a corresponding local source repository
- **THEN** the command creates matching branch worktrees for all eligible missing child repositories without prompting for selection

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

### Requirement: Report per-repository completion outcomes
The system SHALL report success, failure, and skipped outcomes for selected missing repositories whether they were completed by adding a worktree or by ordinary clone.

#### Scenario: One worktree completion fails
- **WHEN** the command processes multiple selected missing repositories
- **AND** creating a worktree for one selected repository fails
- **THEN** the command reports the failure for that repository
- **AND** the command continues processing remaining selected repositories

