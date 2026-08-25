## ADDED Requirements

### Requirement: Configured create JSON reports fitted paths and path-budget overflow

Configured create human, dry-run, JSON, and execution surfaces SHALL consume the same authoritative fitted destination plan. Existing success and dry-run record shapes SHALL remain unchanged. A path budget that cannot fit fixed topology SHALL return one standard failure envelope with code `WORKTREE_PATH_LENGTH_EXCEEDED`, exact details `repositoryName`, `worktreePath`, `maxPathLength`, and `minimumPathLength`, and empty stderr in JSON mode.

#### Scenario: JSON dry-run reports fitted destinations

- **WHEN** configured create with `maxPathLength` shortens an authoritative parent destination and runs with `--dry-run --json`
- **THEN** `data.dryRunOutcome.plannedWorktrees[].worktreePath` contains the exact final fitted absolute paths in deterministic plan order
- **AND** each `branchName` remains the exact requested Git branch
- **AND** human dry-run and later execution consume the same values

#### Scenario: JSON overflow is structured and mutation-free

- **WHEN** fixed selected topology cannot leave nine UTF-16 units for collision-resistant generated naming
- **THEN** stdout contains exactly one failure envelope with code `WORKTREE_PATH_LENGTH_EXCEEDED`
- **AND** `error.details` contains exactly `repositoryName`, `worktreePath`, `maxPathLength`, and `minimumPathLength`
- **AND** stderr is empty and no configuration, ignore, hook, branch, worktree, directory, or registration mutation occurs

#### Scenario: Existing collision contract uses the fitted path

- **WHEN** the final fitted destination is occupied or registered incompatibly
- **THEN** configured create retains `WORKTREE_DESTINATION_COLLISION`
- **AND** collision details identify the exact fitted destination rather than the ordinary over-budget candidate
