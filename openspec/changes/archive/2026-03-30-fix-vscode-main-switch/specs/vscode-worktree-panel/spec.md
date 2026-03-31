## MODIFIED Requirements

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
