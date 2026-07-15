# remove-dry-run-preview Specification

## Purpose
Define the non-mutating `arashi remove --dry-run` preview contract so users and agents can inspect planned worktree, branch, blocker, dirty-state, and hook effects before running destructive cleanup.
## Requirements
### Requirement: Remove dry-run preview mode

The system SHALL provide `arashi remove --dry-run` as a non-mutating preview mode that resolves the requested removal target and reports the operations that would be attempted without removing worktrees, deleting branches, detaching worktrees, or executing lifecycle hooks.

#### Scenario: Branch-targeted dry-run preserves worktrees and branches
- **WHEN** a user runs `arashi remove <branch> --dry-run`
- **THEN** the command reports the worktrees and local branches that would be removed for `<branch>`
- **AND** no worktree directory is removed
- **AND** no local branch is deleted

#### Scenario: Path-targeted dry-run previews selected worktree
- **WHEN** a user runs `arashi remove <worktree-path> --dry-run --path`
- **THEN** the command reports the matching non-main worktree removal and associated branch deletion plan
- **AND** the target worktree remains present after the command exits

#### Scenario: Dry-run with both keep flags is a no-op preview
- **WHEN** a user runs `arashi remove <branch> --dry-run --keep-worktrees --keep-branches`
- **THEN** the command reports that no destructive operations would be performed
- **AND** the command exits successfully without mutation

### Requirement: Human preview output

Human dry-run output SHALL clearly identify itself as a preview and SHALL distinguish planned worktree removals, planned branch deletions, skipped repositories, missing branches, dirty or blocking worktrees, and option effects.

#### Scenario: Preview is clearly labeled
- **WHEN** a user runs `arashi remove <branch> --dry-run`
- **THEN** the output includes a preview heading such as `Dry run` or `Preview`
- **AND** the output does not use success wording that implies worktrees or branches were actually removed

#### Scenario: Preview explains keep-worktrees behavior
- **WHEN** a user runs `arashi remove <branch> --dry-run --keep-worktrees`
- **THEN** the output shows that worktree directories would be kept
- **AND** the output shows any branch deletions that would still be attempted

#### Scenario: Preview explains keep-branches behavior
- **WHEN** a user runs `arashi remove <branch> --dry-run --keep-branches`
- **THEN** the output shows that local branches would be kept
- **AND** the output shows any worktree removals that would still be attempted

### Requirement: Dry-run blockers and dirty context

Dry-run mode SHALL include blocker and dirty-state context that a real remove run would consider before mutation, while still avoiding destructive confirmation prompts in preview mode.

#### Scenario: Dirty worktree appears in preview
- **WHEN** a target worktree has uncommitted changes and the user runs `arashi remove <branch> --dry-run`
- **THEN** the preview identifies the dirty worktree and summarizes available dirty details
- **AND** the command does not prompt for destructive confirmation
- **AND** the dirty worktree remains unchanged

#### Scenario: Missing branches appear in preview
- **WHEN** a branch target exists in some configured repositories but not others
- **THEN** the preview lists repositories where the local branch is missing
- **AND** planned branch deletions include only repositories where the branch exists

#### Scenario: Main worktrees remain skipped
- **WHEN** the target resolution includes a main worktree that cannot be removed
- **THEN** dry-run output reports that the main worktree would be skipped
- **AND** the main worktree remains unchanged

### Requirement: Dry-run lifecycle hook context

Dry-run mode SHALL report remove lifecycle hook context that can be determined safely without executing hook scripts.

#### Scenario: Configured hooks are previewed but not executed
- **WHEN** `pre-remove` or `post-remove` hooks are configured for a target repository and the user runs `arashi remove <branch> --dry-run`
- **THEN** the preview identifies configured remove hooks or hook scopes that would be considered by a real removal
- **AND** no hook script is executed

#### Scenario: Hook absence is previewed
- **WHEN** no remove lifecycle hooks are configured for a target repository and the user runs dry-run preview
- **THEN** the preview indicates that no remove hooks are configured or omits hook execution from the planned operations without treating absence as an error

### Requirement: Dry-run validation coverage

The system SHALL include automated tests proving that dry-run plans match the requested target and do not mutate repositories.

#### Scenario: Tests prove worktree non-mutation
- **WHEN** the dry-run test fixture creates removable worktrees and branches
- **THEN** tests assert those worktrees and branches still exist after `arashi remove --dry-run`

#### Scenario: Tests cover option-specific plans
- **WHEN** tests exercise `--dry-run` with `--keep-worktrees`, `--keep-branches`, `--path`, and `--json`
- **THEN** each test asserts the resulting plan includes only operations allowed by the selected options

### Requirement: Remove dry-run previews standalone operations
`arashi remove --dry-run` SHALL plan removals for worktrees and branches of the resolved standalone repository without requiring or writing configured workspace state.

#### Scenario: Standalone target resolves
- **WHEN** a user previews removal of a branch or worktree in an implicit standalone workspace
- **THEN** the plan identifies exact `.worktrees/<branch>` paths, branch actions, dirty blockers, applicable user-global hook previews, effective options, and totals
- **AND** no worktree, branch, hook, ignore file, or config is mutated

#### Scenario: Preview runs from linked worktree
- **WHEN** standalone remove dry-run starts in a linked worktree
- **THEN** Arashi plans against the shared main repository worktree set
- **AND** preserves existing protection for the active or main worktree

#### Scenario: Explicit target is missing in JSON mode
- **WHEN** standalone remove dry-run JSON mode would require interactive selection
- **THEN** Arashi returns the existing structured explicit-target error without prompting or mutation

