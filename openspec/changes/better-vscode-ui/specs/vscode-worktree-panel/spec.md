## MODIFIED Requirements

### Requirement: Display Arashi worktrees with status metadata
The extension SHALL provide a worktree panel that groups discovered worktrees by related repository context and lists each worktree with branch identity, path, git-change status indicators, and whether the entry belongs to the current workspace or a sibling worktree.

#### Scenario: Repo-aware worktrees are available
- **WHEN** the worktree panel is opened in a configured Arashi workspace
- **THEN** the panel displays related repository entries and the worktrees associated with each repository, including branch, relationship, and status metadata for each worktree entry

#### Scenario: Parent and current repo context are visible
- **WHEN** the current window belongs to a child repository or a sibling worktree
- **THEN** the panel labels the current repository context and identifies the workspace root or parent repository distinctly from other child repositories

#### Scenario: No worktrees are available
- **WHEN** the worktree panel is opened and no Arashi or sibling worktrees are discovered
- **THEN** the panel shows an explicit empty state with guidance for creating a worktree or using command-palette flows for additional setup

### Requirement: Provide contextual worktree actions
The worktree panel SHALL provide title actions to create a worktree and refresh the panel, SHALL provide item actions to switch to a worktree, remove a worktree, and open a repository-focused window, and SHALL execute destructive worktree removal against the exact clicked worktree without requiring a second selection step.

#### Scenario: Create worktree from panel title
- **WHEN** a user triggers create from the panel title area
- **THEN** the extension launches the native VS Code create flow for `arashi create`

#### Scenario: Switch action from panel
- **WHEN** a user triggers switch on a selected worktree entry
- **THEN** the extension executes the switch flow for that exact selected target and reports the outcome

#### Scenario: Remove action confirms once for the clicked worktree
- **WHEN** a user triggers remove on a worktree entry from the panel
- **THEN** the extension asks for confirmation for that clicked worktree and does not require the user to select the worktree again before removal

#### Scenario: Open repository from panel
- **WHEN** a user triggers the open action on a repository entry from the panel
- **THEN** the extension opens a new editor window focused on that repository root

### Requirement: Keep panel state synchronized after actions
The worktree panel SHALL refresh after successful extension commands that change visible Arashi state, SHALL refresh when the window regains focus or the panel becomes visible again, and SHALL provide a manual refresh command.

#### Scenario: Panel refreshes after extension mutation
- **WHEN** a create, add, clone, remove, pull, sync, or panel action completes successfully through the extension
- **THEN** the panel re-queries Arashi state and reflects the updated entries in the same session

#### Scenario: Panel refreshes after external CLI changes
- **WHEN** the user returns focus to the editor or re-opens the panel after running an Arashi command outside the extension flow
- **THEN** the panel refreshes and shows the latest worktree state without requiring a separate manual retry first

#### Scenario: Manual refresh
- **WHEN** a user invokes panel refresh
- **THEN** the extension re-queries Arashi state and updates displayed entries
