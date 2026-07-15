# worktree-change-movement Specification

## Purpose
Define how Arashi safely moves accidental uncommitted edits between coordinated workspaces without losing source changes or overwriting dirty targets.
## Requirements
### Requirement: Move uncommitted changes between coordinated workspaces
The system SHALL provide an `arashi move` command that moves uncommitted changes from a source coordinated workspace to a target coordinated workspace across the parent repository and matching child repositories.

#### Scenario: Move changes from current workspace to explicit target
- **WHEN** the user runs `arashi move --to <target>` from a workspace with uncommitted changes
- **THEN** the system moves tracked and untracked changes from the current workspace to the matching repositories in `<target>`

#### Scenario: Move changes from explicit source to current workspace
- **WHEN** the user runs `arashi move --from <source>` from a clean workspace
- **THEN** the system moves tracked and untracked changes from the matching repositories in `<source>` to the current workspace

#### Scenario: Move changes between explicit source and target
- **WHEN** the user runs `arashi move --from <source> --to <target>`
- **THEN** the system moves tracked and untracked changes from matching repositories in `<source>` to matching repositories in `<target>`

### Requirement: Resolve source and target workspaces interactively
The system SHALL prompt for missing source or target workspace selections when `arashi move` does not receive enough information to infer a safe move plan.

#### Scenario: Current workspace has changes and target is omitted
- **WHEN** the user runs `arashi move` from a workspace with uncommitted changes
- **THEN** the system uses the current workspace as the source and prompts the user to select a target workspace

#### Scenario: Current workspace has no changes and source is omitted
- **WHEN** the user runs `arashi move` from a clean workspace without `--from`
- **THEN** the system prompts the user to select a source workspace that has uncommitted changes

#### Scenario: Prompt labels include disambiguating context
- **WHEN** the system prompts for a source or target workspace
- **THEN** each choice includes enough context to distinguish workspaces, including branch or worktree name, path, and dirty repository summary when available

### Requirement: Move only repositories present in both workspaces
The system SHALL move changes only for the parent repository and child repositories that are present in both the source and target coordinated workspaces.

#### Scenario: Source and target share a subset of child repositories
- **WHEN** the source and target workspaces do not contain the same child repositories
- **THEN** the system moves changes for matching repositories and reports skipped repositories that are missing from either workspace

#### Scenario: No changed repositories match the target workspace
- **WHEN** the source workspace has uncommitted changes but none are in repositories also present in the target workspace
- **THEN** the system aborts without modifying either workspace and explains that no compatible changed repositories were found

### Requirement: Preserve changes until target apply succeeds
The system SHALL keep the source changes recoverable until the target workspace successfully receives them.

#### Scenario: Target apply succeeds
- **WHEN** the system successfully applies a repository's changes to the target workspace
- **THEN** the source repository is left clean and the temporary transfer stash for that repository is removed

#### Scenario: Target apply fails
- **WHEN** the system cannot apply a repository's changes to the target workspace
- **THEN** the system preserves the source changes or a named recovery stash and reports recovery instructions without dropping the stash

### Requirement: Refuse unsafe target state by default
The system SHALL refuse to move changes into target repositories that already have uncommitted changes unless the user explicitly selects a supported conflict behavior.

#### Scenario: Target repository is dirty
- **WHEN** a target repository that would receive changes already has uncommitted changes
- **THEN** the system aborts before modifying source or target and reports the dirty target repository

#### Scenario: Unrelated target repositories are dirty
- **WHEN** a target repository is dirty but would not receive any source changes
- **THEN** the system does not block the move solely because of that unrelated dirty repository and reports it as unaffected

### Requirement: Report move results per repository
The system SHALL summarize the result of `arashi move` for each repository considered in the move plan.

#### Scenario: Move completes successfully
- **WHEN** all planned repository moves succeed
- **THEN** the system reports the source workspace, target workspace, moved repositories, skipped repositories, and final recovery status

#### Scenario: Move partially fails
- **WHEN** one or more planned repository moves fail
- **THEN** the system reports succeeded, restored, skipped, and manual-recovery repositories with concrete next-step commands where available

### Requirement: Move supports implicit standalone worktrees
`arashi move` SHALL discover source and target worktrees within the resolved standalone repository and preserve existing validation, conflict, transfer, restoration, and rollback behavior.

#### Scenario: Eligible standalone changes move
- **WHEN** a user selects source and target worktrees of the same implicit standalone repository and the changes are eligible
- **THEN** Arashi transfers the requested uncommitted changes using existing safety semantics
- **AND** does not require or write configured repository entries

#### Scenario: Target is outside the repository
- **WHEN** a candidate target does not belong to the resolved standalone repository
- **THEN** Arashi excludes or rejects it rather than broadening scope

#### Scenario: Standalone move fails
- **WHEN** transfer, apply, cleanup, or restoration fails
- **THEN** Arashi preserves existing rollback and recovery guidance
- **AND** creates no implicit configuration

