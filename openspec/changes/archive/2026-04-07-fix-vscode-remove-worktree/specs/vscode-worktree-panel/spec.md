## MODIFIED Requirements

### Requirement: Provide contextual worktree actions
The worktree panel SHALL provide title actions to create a worktree and refresh the panel, SHALL provide item actions to switch to a worktree, remove a worktree, and open a repository-focused window, and SHALL execute destructive worktree removal against the exact clicked worktree without requiring a second selection step or a second confirmation prompt from the CLI.

#### Scenario: Create worktree from panel title
- **WHEN** a user triggers create from the panel title area
- **THEN** the extension launches the native VS Code create flow for `arashi create`

#### Scenario: Switch action from panel
- **WHEN** a user triggers switch on a selected worktree entry
- **THEN** the extension executes the switch flow for that exact selected target and reports the outcome

#### Scenario: Remove action confirms once for the clicked worktree
- **WHEN** a user triggers remove on a worktree entry from the panel
- **THEN** the extension asks for confirmation for that clicked worktree, invokes removal for that exact target in forced path mode after confirmation, and does not require the user to confirm again before removal

#### Scenario: Open repository from panel
- **WHEN** a user triggers the open action on a repository entry from the panel
- **THEN** the extension opens a new editor window focused on that repository root
