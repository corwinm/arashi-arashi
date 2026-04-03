## MODIFIED Requirements

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
