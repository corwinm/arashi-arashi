## ADDED Requirements

### Requirement: Register repository navigation commands in VS Code
The extension SHALL register command-palette commands for opening the Arashi workspace root and related repositories in repo-focused editor windows, and SHALL reuse the same command handlers from tree-view interactions.

#### Scenario: Repo navigation commands are discoverable
- **WHEN** a user opens the command palette and searches for Arashi commands
- **THEN** the extension shows commands for opening related repositories in addition to the existing worktree-management commands

#### Scenario: Tree and command palette reuse the same repo-opening flow
- **WHEN** a user opens a repository from either the panel or the command palette
- **THEN** the extension executes the same repo-selection and repo-opening logic for both entry points

### Requirement: Refresh panel state after mutating extension commands
The extension SHALL refresh the worktree panel after successful create, add, clone, remove, pull, sync, and panel mutation flows that can change visible Arashi state.

#### Scenario: Successful command updates visible panel state
- **WHEN** a mutating Arashi command succeeds through the extension
- **THEN** the extension refreshes the panel before reporting the operation as complete to the user

#### Scenario: Failed command does not report a successful refresh
- **WHEN** a mutating Arashi command fails
- **THEN** the extension reports the failure and does not present the panel as successfully refreshed
