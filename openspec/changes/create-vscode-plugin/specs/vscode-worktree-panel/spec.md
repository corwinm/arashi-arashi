## ADDED Requirements

### Requirement: Display Arashi worktrees with status metadata
The extension SHALL provide a worktree panel that lists Arashi-managed worktrees with repository context, branch identity, path, and git-change status indicators.

#### Scenario: Worktrees are available
- **WHEN** the worktree panel is opened in a configured workspace
- **THEN** the panel displays one entry per discovered Arashi worktree with branch, path, and status metadata

#### Scenario: No worktrees are available
- **WHEN** the worktree panel is opened and no Arashi worktrees are discovered
- **THEN** the panel shows an explicit empty state with guidance for creating or adding a worktree

### Requirement: Back panel data with JSON CLI responses
The worktree panel SHALL source its data from Arashi CLI commands invoked with `--json` when output is parsed by the extension.

#### Scenario: Panel refresh succeeds
- **WHEN** the panel performs discovery or refresh
- **THEN** the extension invokes CLI data commands with `--json` and renders the parsed response

#### Scenario: Panel refresh parse fails
- **WHEN** JSON parsing fails during panel refresh
- **THEN** the extension preserves the last known panel state when available and shows an actionable refresh error

### Requirement: Provide contextual worktree actions
The worktree panel SHALL provide contextual actions to switch to a worktree, remove a worktree, and add a repository.

#### Scenario: Switch action from panel
- **WHEN** a user triggers switch on a selected worktree entry
- **THEN** the extension executes the switch flow for that target and reports the outcome

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
The worktree panel SHALL refresh after mutating actions and SHALL provide a manual refresh command.

#### Scenario: State refresh after mutation
- **WHEN** a panel action mutates worktrees or repository configuration
- **THEN** the panel refreshes and reflects updated state in the same session

#### Scenario: Manual refresh
- **WHEN** a user invokes panel refresh
- **THEN** the extension re-queries Arashi state and updates displayed entries
