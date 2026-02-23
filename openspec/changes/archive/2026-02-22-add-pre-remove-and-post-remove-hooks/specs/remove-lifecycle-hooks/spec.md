## ADDED Requirements

### Requirement: Remove command lifecycle hooks
The system SHALL support global remove lifecycle hooks named `pre-remove` and `post-remove` that are discovered from `.arashi/hooks/<hook-name>.sh` in the workspace root repository.

#### Scenario: Remove hooks are configured
- **WHEN** a user runs `arashi remove` in a workspace where `.arashi/hooks/pre-remove.sh` and `.arashi/hooks/post-remove.sh` exist
- **THEN** the command evaluates and executes those hooks at their defined lifecycle points

#### Scenario: Remove hooks are not configured
- **WHEN** a user runs `arashi remove` and one or both remove hook files are absent
- **THEN** the command skips missing hooks without failing solely because the scripts are absent

### Requirement: Pre-remove hook gates destructive operations
The system SHALL execute `pre-remove` after user confirmation and before any worktree removal or branch deletion, and the command MUST abort destructive operations when `pre-remove` fails.

#### Scenario: Pre-remove succeeds
- **WHEN** `pre-remove` exits successfully
- **THEN** the command proceeds to worktree removal and branch deletion

#### Scenario: Pre-remove fails
- **WHEN** `pre-remove` exits non-zero or times out
- **THEN** the command exits with failure and does not remove worktrees or delete branches

### Requirement: Post-remove hook finalization behavior
The system SHALL execute `post-remove` once after remove operations have been attempted, including runs where some remove operations fail.

#### Scenario: Remove operations fully succeed
- **WHEN** all targeted remove operations complete successfully
- **THEN** `post-remove` runs after those operations and before final completion output

#### Scenario: Remove operations partially fail
- **WHEN** one or more targeted remove operations fail but the command continues processing remaining targets
- **THEN** `post-remove` still runs once after operation attempts complete

### Requirement: Remove lifecycle hook context
The system SHALL provide remove lifecycle hooks with `ARASHI_*` environment variables sufficient to identify the remove operation context, including target branch and/or worktree metadata when available.

#### Scenario: Hook receives remove context
- **WHEN** a remove lifecycle hook runs
- **THEN** the hook process receives populated `ARASHI_*` variables that allow cleanup logic to identify the relevant operation scope

### Requirement: Hook failures affect command result
The system MUST treat remove lifecycle hook failures as command errors and SHALL report hook failure details in user-visible output.

#### Scenario: Post-remove fails
- **WHEN** `post-remove` exits non-zero or times out
- **THEN** the command reports the hook failure and returns a non-zero exit status
