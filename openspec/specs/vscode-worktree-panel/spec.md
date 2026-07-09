# vscode-worktree-panel Specification

## Purpose
Specify the VS Code worktree panel behavior for displaying Arashi workspace state, preserving parse-failure resilience, exposing contextual actions, and keeping visible state synchronized after extension or external CLI changes.

## Requirements
### Requirement: Display Arashi worktrees with status metadata
The extension SHALL provide a worktree panel that groups discovered worktrees by related repository context and lists each worktree with branch identity, path, git-change status indicators, and whether the entry belongs to the current workspace or a sibling worktree. Child repositories nested under a worktree SHALL remain visually distinguishable from top-level worktree entries even when a child repository has local modifications.

#### Scenario: Repo-aware worktrees are available
- **WHEN** the worktree panel is opened in a configured Arashi workspace
- **THEN** the panel displays related repository entries and the worktrees associated with each repository, including branch, relationship, and status metadata for each worktree entry

#### Scenario: Parent and current repo context are visible
- **WHEN** the current window belongs to a child repository or a sibling worktree
- **THEN** the panel labels the current repository context and identifies the workspace root or parent repository distinctly from other child repositories

#### Scenario: Modified child repository in a sibling worktree preserves hierarchy
- **WHEN** a sibling worktree contains a child repository with local modifications
- **THEN** the modified child repository is rendered as a nested child of that sibling worktree rather than appearing visually aligned with top-level worktree items

#### Scenario: No worktrees are available
- **WHEN** the worktree panel is opened and no Arashi or sibling worktrees are discovered
- **THEN** the panel shows an explicit empty state with guidance for creating a worktree or using command-palette flows for additional setup

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

### Requirement: Confirm destructive panel operations only
The extension MUST require explicit confirmation for destructive panel actions and SHALL NOT require confirmation for non-destructive actions.

#### Scenario: Remove worktree requires confirmation
- **WHEN** a user triggers remove on a worktree
- **THEN** the extension requires explicit confirmation before invoking removal

#### Scenario: Switch does not require confirmation
- **WHEN** a user triggers switch on a worktree
- **THEN** the extension executes the action without a confirmation prompt

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

