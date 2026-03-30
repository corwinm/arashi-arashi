## MODIFIED Requirements

### Requirement: Display Arashi worktrees with status metadata
The extension SHALL provide a worktree panel that lists Arashi-managed worktrees and sibling worktrees with repository context, branch identity, path, git-change status indicators, and whether each entry is the current workspace or a sibling.

#### Scenario: Worktrees are available
- **WHEN** the worktree panel is opened in a configured workspace
- **THEN** the panel displays one entry per discovered Arashi worktree with branch, path, relationship, and status metadata

#### Scenario: Sibling worktrees are available
- **WHEN** the panel discovers sibling worktrees related to the current repository context
- **THEN** the panel includes those sibling worktrees alongside managed entries with labels that distinguish them from the current workspace

#### Scenario: No worktrees are available
- **WHEN** the worktree panel is opened and no Arashi or sibling worktrees are discovered
- **THEN** the panel shows an explicit empty state with guidance for creating or adding a worktree

## ADDED Requirements

### Requirement: Suppress init guidance for sibling worktrees
The extension SHALL detect when the current window is opened in a sibling worktree of an initialized Arashi workspace and SHALL avoid suggesting `arashi init` for that session.

#### Scenario: Current window is a sibling worktree
- **WHEN** the extension activates inside a sibling worktree that belongs to an already initialized Arashi workspace
- **THEN** the extension does not show guidance suggesting that the user run `arashi init`

#### Scenario: Current window is not part of an initialized workspace family
- **WHEN** the extension activates in a workspace that is not the root or sibling of an initialized Arashi workspace
- **THEN** the extension may continue to show normal initialization guidance
