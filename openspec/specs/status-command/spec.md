# status-command Specification

## Purpose
Define how `arashi status` reports repository health, branch divergence, default-branch lag, and visibility of missing repositories across human and machine-readable output modes.
## Requirements
### Requirement: Refresh tracked remote state before reporting branch divergence
The system SHALL refresh the resolved remote-tracking branch for each locally present repository before `arashi status` reports ahead/behind information.

#### Scenario: Repository has a resolvable upstream branch
- **WHEN** the user runs `arashi status` for a repository whose current branch maps to a remote-tracking branch
- **THEN** the command runs a targeted `git fetch` for that tracking branch before parsing branch divergence output
- **AND** the reported ahead/behind counts reflect the refreshed remote-tracking ref

#### Scenario: Repository has no remote-tracking target
- **WHEN** the user runs `arashi status` for a repository that has no configured remote, no upstream, or no resolvable branch target
- **THEN** the command skips the remote refresh for that repository
- **AND** the command still reports the repository's local branch and working-tree status

### Requirement: Preserve local status when remote refresh fails
The system MUST continue reporting local repository status when the remote refresh step fails. When the failure indicates that the resolved remote branch ref does not exist, the system MUST surface that condition inline on the branch display instead of showing the generic stale remote-tracking warning. For other remote refresh failures, the system MUST continue to indicate that remote-tracking information may be stale.

#### Scenario: Fetch fails for a reachable local repository
- **WHEN** the user runs `arashi status` and the repository's targeted `git fetch` fails because of network, authentication, or remote command errors other than a missing remote ref
- **THEN** the command still reports the repository's local clean/dirty status
- **AND** the command indicates that remote-tracking information could not be refreshed for that repository
- **AND** the fetch failure is not treated as a missing-repository or git-status execution failure

#### Scenario: Resolved remote branch does not exist on the remote
- **WHEN** the user runs `arashi status` and the targeted `git fetch` fails because the resolved `refs/heads/<branch>` does not exist on the remote
- **THEN** the command still reports the repository's local clean/dirty status
- **AND** the Branch line shows the local branch followed by an inline warning in the remote position indicating that the remote ref could not be found
- **AND** the Branch line is rendered as a warning rather than as a normal clean/dirty branch line
- **AND** the command does not print the generic `Remote tracking may be stale` warning for that repository

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

### Requirement: Hide missing child repositories from non-verbose human status output
The system SHALL omit missing configured child repositories from default and short human `arashi status` output while retaining complete status visibility in verbose and JSON output.

#### Scenario: Default status hides intentionally missing child repositories
- **WHEN** the user runs `arashi status` in a coordinated worktree where one or more configured child repository paths are missing
- **THEN** the default human output does not include sections for those missing child repositories
- **AND** the summary counts only the repositories shown in the default human output

#### Scenario: Short status hides intentionally missing child repositories
- **WHEN** the user runs `arashi status --short` in a coordinated worktree where one or more configured child repository paths are missing
- **THEN** the short human output does not include lines for those missing child repositories
- **AND** visible present repositories continue to show their normal short status

#### Scenario: Verbose status shows missing child repositories
- **WHEN** the user runs `arashi status --verbose` in a coordinated worktree where one or more configured child repository paths are missing
- **THEN** the verbose human output includes those missing child repositories
- **AND** each missing repository includes guidance to run `arashi clone`

#### Scenario: JSON status includes missing child repositories
- **WHEN** the user runs `arashi status --json` in a coordinated worktree where one or more configured child repository paths are missing
- **THEN** the JSON envelope includes status records for those missing child repositories
- **AND** each missing record includes a machine-readable error message with clone guidance

