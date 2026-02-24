# remove-lifecycle-hooks Specification

## Purpose
TBD - created by archiving change add-pre-remove-and-post-remove-hooks. Update Purpose after archive.
## Requirements
### Requirement: Remove command lifecycle hooks
The system SHALL support remove lifecycle hooks named `pre-remove` and `post-remove` that are discovered for each target repository from repository-local (`repos/<repo>/.arashi/hooks/<hook-name>.sh`), workspace-root (`.arashi/hooks/<hook-name>.sh`), and user-global (`~/.arashi/hooks/<hook-name>.sh` and `~/.arashi/hooks/<repo>/<hook-name>.sh`) locations.

#### Scenario: Remove hooks are configured across scopes
- **WHEN** a user runs `arashi remove` for repository `<repo>` and corresponding hook files exist in repository-local, workspace-root, and user-global locations
- **THEN** the command evaluates and executes discovered hooks at their lifecycle points in scope order

#### Scenario: Remove hooks are not configured
- **WHEN** a user runs `arashi remove` and one or more remove hook files are absent across all supported locations
- **THEN** the command skips missing hooks without failing solely because the scripts are absent

### Requirement: Pre-remove hook gates destructive operations
The system SHALL execute discovered `pre-remove` hooks after user confirmation and before any worktree removal or branch deletion, and the command MUST abort destructive operations when any `pre-remove` hook fails.

#### Scenario: All pre-remove hooks succeed
- **WHEN** all discovered `pre-remove` hooks exit successfully
- **THEN** the command proceeds to worktree removal and branch deletion

#### Scenario: A pre-remove hook fails
- **WHEN** any discovered `pre-remove` hook exits non-zero or times out
- **THEN** the command exits with failure and does not remove worktrees or delete branches

### Requirement: Post-remove hook finalization behavior
The system SHALL execute discovered `post-remove` hooks once after remove operations have been attempted, including runs where some remove operations fail.

#### Scenario: Remove operations fully succeed
- **WHEN** all targeted remove operations complete successfully
- **THEN** discovered `post-remove` hooks run after those operations and before final completion output

#### Scenario: Remove operations partially fail
- **WHEN** one or more targeted remove operations fail but the command continues processing remaining targets
- **THEN** discovered `post-remove` hooks still run once after operation attempts complete

### Requirement: Remove lifecycle hook context
The system SHALL provide remove lifecycle hooks with `ARASHI_*` environment variables sufficient to identify remove operation context, including target repository metadata, hook scope, and source hook path.

#### Scenario: Hook receives remove context
- **WHEN** a remove lifecycle hook runs
- **THEN** the hook process receives populated `ARASHI_*` variables that allow cleanup logic to identify operation scope and source

### Requirement: Hook failures affect command result
The system MUST treat remove lifecycle hook failures as command errors and SHALL report hook failure details in user-visible output.

#### Scenario: Post-remove fails
- **WHEN** any discovered `post-remove` hook exits non-zero or times out
- **THEN** the command reports the hook failure and returns a non-zero exit status

