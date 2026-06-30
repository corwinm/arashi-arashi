## ADDED Requirements

### Requirement: Require the parent repository during interactive create selection
The system SHALL include the parent/meta repository in every interactive `arashi create` operation while allowing the user to choose which child repositories to include.

#### Scenario: Parent repository is not presented as an optional selection
- **WHEN** the user runs `arashi create <branch> --interactive` from a meta repository
- **THEN** the repository selection prompt lists only child repositories as optional choices
- **AND** the parent/meta repository is included in the repositories processed by create regardless of child selections

#### Scenario: Selected child repositories are created with the parent
- **WHEN** the user runs `arashi create <branch> --interactive`
- **AND** selects a subset of child repositories
- **THEN** the command creates the parent/meta worktree
- **AND** the command creates worktrees only for the selected child repositories

#### Scenario: No child repositories selected still creates parent
- **WHEN** the user runs `arashi create <branch> --interactive`
- **AND** selects no child repositories
- **THEN** the command proceeds with the parent/meta repository worktree creation
- **AND** the command does not fail with a no-repositories-selected error
