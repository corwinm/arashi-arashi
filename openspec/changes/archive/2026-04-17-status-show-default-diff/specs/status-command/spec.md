## ADDED Requirements

### Requirement: Refresh default-branch state before reporting behind-default status
The system SHALL resolve each repository's default branch and refresh the compare target before `arashi status` reports whether the current branch is behind that default branch.

#### Scenario: Repository has a resolvable default branch target
- **WHEN** the user runs `arashi status` for a repository whose current branch is not detached, is not already the default branch, and has a refreshable default-branch ref
- **THEN** the command refreshes that default-branch ref before computing branch divergence
- **AND** any reported behind-default count reflects the refreshed default-branch state

#### Scenario: Repository does not need a default-branch comparison
- **WHEN** the user runs `arashi status` for a repository that is on its default branch or is in a detached HEAD state
- **THEN** the command skips default-branch comparison for that repository
- **AND** the command still reports the repository's local branch and working-tree status

### Requirement: Show when the current branch is behind the repository default branch
The system SHALL surface behind-default information in `arashi status` output without obscuring existing upstream-tracking or working-tree status.

#### Scenario: Default or verbose output shows behind-default count
- **WHEN** the user runs `arashi status` or `arashi status --verbose` for a repository whose current branch is behind the resolved default branch
- **THEN** that repository's status output includes a `Default:` entry
- **AND** the entry identifies the default branch being compared
- **AND** the entry shows the number of commits by which the current branch is behind using a downward indicator

#### Scenario: Short output shows a compact behind-default indicator
- **WHEN** the user runs `arashi status --short` for a repository whose current branch is behind the resolved default branch
- **THEN** that repository's one-line summary includes a compact indicator that the current branch is behind the default branch
- **AND** the rest of the short status line continues to report the repository's local status summary

#### Scenario: Current branch is not behind the default branch
- **WHEN** the user runs `arashi status` for a repository whose current branch is equal to or ahead of the resolved default branch
- **THEN** the command does not show a behind-default indicator for that repository
- **AND** the rest of the repository status output is unchanged

### Requirement: Preserve local status when default-branch comparison is unavailable
The system MUST continue reporting local repository status when default-branch comparison cannot be completed for a repository.

#### Scenario: Default-branch refresh or comparison fails
- **WHEN** the user runs `arashi status` and the command resolves a default-branch target but cannot refresh or compare it because of git, network, authentication, or ref errors
- **THEN** the command still reports the repository's local branch and clean/dirty status
- **AND** the default-branch comparison is surfaced as unavailable for that repository
- **AND** the failure is not treated as a missing-repository or git-status execution failure

#### Scenario: No default-branch target can be resolved
- **WHEN** the user runs `arashi status` for a repository whose default branch cannot be resolved to a comparison target
- **THEN** the command skips default-branch comparison for that repository
- **AND** the command still reports the repository's local branch and working-tree status without a misleading behind-default indicator
