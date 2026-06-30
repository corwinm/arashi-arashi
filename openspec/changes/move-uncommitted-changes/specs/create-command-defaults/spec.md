## ADDED Requirements

### Requirement: Support create-time movement of current changes
The system SHALL provide an explicit `arashi create` option that moves compatible uncommitted changes from the current workspace into the newly created coordinated worktree after successful worktree creation.

#### Scenario: Create with move flag from dirty workspace
- **WHEN** the user runs `arashi create <branch> --move-changes` from a workspace with uncommitted changes
- **THEN** the command creates the coordinated worktree and moves compatible tracked and untracked changes from the current workspace into the new worktree

#### Scenario: Create with move flag from clean workspace
- **WHEN** the user runs `arashi create <branch> --move-changes` from a workspace with no uncommitted changes
- **THEN** the command creates the coordinated worktree and reports that there were no changes to move

#### Scenario: Create-time move fails after worktree creation
- **WHEN** `arashi create <branch> --move-changes` creates the coordinated worktree but cannot move changes safely
- **THEN** the command preserves the source changes or recovery stashes and reports the created worktree path plus recovery instructions

### Requirement: Show move guidance after creating from dirty workspace
The system SHALL show a concise help message after `arashi create` succeeds when the source workspace has uncommitted changes and the user did not request create-time movement.

#### Scenario: Dirty source without move flag
- **WHEN** the user runs `arashi create <branch>` from a workspace with uncommitted changes and does not pass the move flag
- **THEN** the command leaves the current workspace unchanged and prints an example command for moving the changes to the new worktree

#### Scenario: Clean source without move flag
- **WHEN** the user runs `arashi create <branch>` from a workspace with no uncommitted changes and does not pass the move flag
- **THEN** the command does not print change-movement guidance

#### Scenario: Partial dirty repositories after create
- **WHEN** the user runs `arashi create <branch>` from a workspace where only some repositories have uncommitted changes
- **THEN** the guidance identifies that only changed compatible repositories would be moved by the suggested command

#### Scenario: JSON create reports dirty-workspace move guidance structurally
- **WHEN** the user runs `arashi create <branch> --json` from a workspace with uncommitted changes and does not pass the move flag
- **THEN** stdout contains exactly one valid JSON document
- **AND** the JSON result includes structured dirty-workspace guidance with the changed compatible repositories and suggested follow-up move command
- **AND** no human-readable move guidance is written to stdout
