# list-command Specification

## Purpose
TBD - created by archiving change consolidate-legacy-speckit-specifications. Update Purpose after archive.
## Requirements
### Requirement: List discovers every worktree associated with the current Git repository
`aw list` SHALL operate from a Git repository without requiring Arashi configuration and SHALL enumerate the primary worktree plus every registered linked worktree with absolute path, exact branch or detached state, commit identity, lock state, primary-worktree identity, and working-tree change state.

#### Scenario: Repository has linked worktrees
- **WHEN** a user runs `aw list` in a Git repository with linked worktrees
- **THEN** the result contains the primary worktree and every registered linked worktree exactly once

#### Scenario: Repository has no linked worktrees
- **WHEN** only the primary worktree exists
- **THEN** list reports the primary worktree and clearly states that no additional worktrees were found in descriptive modes

### Requirement: List provides pipe-friendly and descriptive human formats
The default human format SHALL emit one full worktree path per line without headers. `--table` SHALL render path, branch, and status with a total count. `--verbose` SHALL render detailed worktree fields and discovered nested Git repositories up to the validated effective maximum depth, including each nested repository's relative path, branch, commit, and change state.

#### Scenario: Default output is piped to a selector
- **WHEN** a user runs `aw list` without a descriptive-format flag
- **THEN** stdout contains only full worktree paths, one per line, suitable for tools such as `fzf`

#### Scenario: Verbose nested discovery is bounded
- **WHEN** a user runs `aw list --verbose --max-depth 2`
- **THEN** nested Git repositories at depth two or less are reported
- **AND** deeper repositories are not traversed or reported

### Requirement: List JSON uses the standard envelope and complete worktree records
`aw list --json` SHALL emit exactly one standard JSON envelope whose data contains ordered worktree records with `path`, `branch`, `commit`, `locked`, `hasChanges`, and `isMain`; verbose JSON SHALL additionally include nested repository records. Human output SHALL not contaminate JSON stdout.

#### Scenario: JSON list succeeds
- **WHEN** a user runs `aw list --json`
- **THEN** stdout is one parseable success envelope with `command: "list"`
- **AND** every discovered worktree contains the required fields

