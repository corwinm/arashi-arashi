## MODIFIED Requirements

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
