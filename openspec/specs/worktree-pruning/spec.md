# worktree-pruning Specification

## Purpose
Define Arashi's handling of stale Git worktree metadata, including detection of Git-prunable worktree records, explicit cleanup through `arashi prune`, and safeguards that keep `arashi remove` focused on existing removable worktrees.
## Requirements
### Requirement: Detect prunable worktree metadata
The system SHALL identify Git worktree records that Git marks as prunable across the main repository and configured child repositories.

#### Scenario: Git reports a prunable worktree record
- **WHEN** Arashi parses `git worktree list --porcelain` output containing a `prunable <reason>` line for a worktree
- **THEN** the worktree record is marked as prunable
- **AND** the prune reason is retained for user-facing and JSON reporting

#### Scenario: Git reports a normal worktree record
- **WHEN** Arashi parses `git worktree list --porcelain` output for a worktree without a `prunable` line
- **THEN** the worktree record is treated as a normal removable worktree
- **AND** existing branch, path, repository, and main-worktree detection behavior is preserved

### Requirement: Prune command reports stale worktree metadata without mutation
The system SHALL provide an `arashi prune --dry-run` mode that reports prunable worktree metadata without changing repository state.

#### Scenario: Dry-run finds prunable worktrees
- **WHEN** the user runs `arashi prune --dry-run` and one or more configured repositories contain prunable worktree metadata
- **THEN** the command reports each affected repository and prunable worktree path
- **AND** the command includes Git's prune reason when available
- **AND** the command exits successfully without running a mutating prune operation

#### Scenario: Dry-run finds nothing to prune
- **WHEN** the user runs `arashi prune --dry-run` and no configured repositories contain prunable worktree metadata
- **THEN** the command reports that there are no stale worktree entries to prune
- **AND** the command exits successfully

### Requirement: Prune command removes stale worktree metadata
The system SHALL provide an `arashi prune` command that removes stale Git worktree metadata from configured repositories using Git's worktree prune behavior.

#### Scenario: Prune removes stale metadata
- **WHEN** the user runs `arashi prune` and one or more configured repositories contain prunable worktree metadata
- **THEN** the command runs Git worktree pruning for each affected repository
- **AND** the command reports per-repository cleanup results
- **AND** subsequent Arashi worktree discovery no longer includes the pruned stale entries

#### Scenario: Repository has no stale metadata
- **WHEN** the user runs `arashi prune` and a configured repository has no prunable worktree metadata
- **THEN** the command skips or reports that repository as having nothing to prune
- **AND** the command does not treat the absence of stale metadata as an error

#### Scenario: Git prune fails for a repository
- **WHEN** Git worktree pruning fails for one configured repository
- **THEN** the command reports the repository failure with the underlying error message
- **AND** the command continues processing remaining repositories when safe
- **AND** the final command exits non-zero if any repository prune operation failed

### Requirement: Remove command excludes prunable worktrees
The system SHALL keep `arashi remove` focused on existing removable worktrees by excluding Git-prunable worktree records from remove selection and remove execution.

#### Scenario: Interactive remove sees prunable and normal worktrees
- **WHEN** the user runs interactive `arashi remove` and discovery returns both normal and prunable worktree records
- **THEN** the selection list includes only normal removable worktrees
- **AND** the command does not display prunable records as removal choices
- **AND** the command may direct the user to `arashi prune` for stale metadata cleanup

#### Scenario: Remove target matches only prunable records
- **WHEN** the user runs `arashi remove <target>` and the target matches only prunable worktree metadata
- **THEN** the command does not attempt to remove the stale worktree path
- **AND** the command reports that the target is stale/prunable metadata
- **AND** the command suggests `arashi prune` as the cleanup command

#### Scenario: Remove JSON output after filtering prunable records
- **WHEN** the user runs `arashi remove <target> --json` and prunable records are discovered but not selected for removal
- **THEN** the JSON response describes only actual remove operations for normal worktrees
- **AND** stale prunable records are not reported as successfully removed worktrees

