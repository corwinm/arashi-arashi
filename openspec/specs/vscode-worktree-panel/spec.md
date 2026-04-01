# vscode-worktree-panel Specification

## Purpose
TBD - created by archiving change create-vscode-plugin. Update Purpose after archive.
## Requirements
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

### Requirement: Suppress init guidance for sibling worktrees
The extension SHALL detect when the current window is opened in a sibling worktree of an initialized Arashi workspace and SHALL avoid suggesting `arashi init` for that session.

#### Scenario: Current window is a sibling worktree
- **WHEN** the extension activates inside a sibling worktree that belongs to an already initialized Arashi workspace
- **THEN** the extension does not show guidance suggesting that the user run `arashi init`

#### Scenario: Current window is not part of an initialized workspace family
- **WHEN** the extension activates in a workspace that is not the root or sibling of an initialized Arashi workspace
- **THEN** the extension may continue to show normal initialization guidance

### Requirement: Back panel data with JSON CLI responses
The worktree panel SHALL source its data from Arashi CLI commands invoked with `--json` when output is parsed by the extension.

#### Scenario: Panel refresh succeeds
- **WHEN** the panel performs discovery or refresh
- **THEN** the extension invokes CLI data commands with `--json` and renders the parsed response

#### Scenario: Panel refresh parse fails
- **WHEN** JSON parsing fails during panel refresh
- **THEN** the extension preserves the last known panel state when available and shows an actionable refresh error

### Requirement: Provide contextual worktree actions
The worktree panel SHALL provide contextual actions to switch to a worktree, remove a worktree, and add a repository, and SHALL invoke switch actions using the exact selected worktree identity rather than an ambiguous branch-name filter.

#### Scenario: Switch action from panel
- **WHEN** a user triggers switch on a selected worktree entry
- **THEN** the extension executes the switch flow for that exact selected target and reports the outcome

#### Scenario: Switch action handles duplicate branch names
- **WHEN** multiple worktree entries share the same branch name and a user triggers switch on one specific entry from the panel
- **THEN** the extension invokes the CLI in a way that selects only that chosen entry instead of failing on ambiguous matches

#### Scenario: Add repository action from panel
- **WHEN** a user triggers add repository from the panel
- **THEN** the extension launches the add flow with native VS Code input UI and updates the panel after completion

### Requirement: Confirm destructive panel operations only
The extension MUST require explicit confirmation for destructive panel actions and SHALL NOT require confirmation for non-destructive actions.

#### Scenario: Remove worktree requires confirmation
- **WHEN** a user triggers remove on a worktree
- **THEN** the extension requires explicit confirmation before invoking removal

#### Scenario: Switch does not require confirmation
- **WHEN** a user triggers switch on a worktree
- **THEN** the extension executes the action without a confirmation prompt

### Requirement: Keep panel state synchronized after actions
The worktree panel SHALL refresh after mutating actions and SHALL provide a manual refresh command, and every successful refresh path SHALL update the rendered panel state in the same session using the latest queried worktree data.

#### Scenario: State refresh after mutation
- **WHEN** a panel action mutates worktrees or repository configuration
- **THEN** the panel refreshes and reflects updated state in the same session

#### Scenario: Manual refresh
- **WHEN** a user invokes panel refresh
- **THEN** the extension re-queries Arashi state and updates displayed entries

#### Scenario: Manual refresh shows newly discovered worktrees
- **WHEN** the discovered worktree set changes before a user invokes panel refresh
- **THEN** the panel replaces its visible entries with the latest discovered worktree data in that same session
