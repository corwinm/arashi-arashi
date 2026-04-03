## ADDED Requirements

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
The system MUST continue reporting local repository status when the remote refresh step fails and MUST identify that remote-tracking information may be stale.

#### Scenario: Fetch fails for a reachable local repository
- **WHEN** the user runs `arashi status` and the repository's targeted `git fetch` fails because of network, authentication, or remote command errors
- **THEN** the command still reports the repository's local clean/dirty status
- **AND** the command indicates that remote-tracking information could not be refreshed for that repository
- **AND** the fetch failure is not treated as a missing-repository or git-status execution failure
