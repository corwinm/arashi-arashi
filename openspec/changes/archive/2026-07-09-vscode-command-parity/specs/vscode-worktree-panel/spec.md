## MODIFIED Requirements

### Requirement: Keep panel state synchronized after actions
The worktree panel SHALL refresh after successful extension commands that change visible Arashi state, SHALL refresh when the window regains focus or the panel becomes visible again, and SHALL provide a manual refresh command.

#### Scenario: Panel refreshes after extension mutation
- **WHEN** a create, add, clone, remove, move, prune, setup, install, update, pull, sync, or panel action completes successfully through the extension
- **THEN** the panel re-queries Arashi state and reflects the updated entries in the same session

#### Scenario: Panel refreshes after external CLI changes
- **WHEN** the user returns focus to the editor or re-opens the panel after running an Arashi command outside the extension flow
- **THEN** the panel refreshes and shows the latest worktree state without requiring a separate manual retry first

#### Scenario: Manual refresh
- **WHEN** a user invokes panel refresh
- **THEN** the extension re-queries Arashi state and updates displayed entries
