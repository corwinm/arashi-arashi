# vscode-repo-navigation Specification

## Purpose
TBD - synced from change better-vscode-ui. Update Purpose after archive.
## Requirements
### Requirement: Discover related repositories from the Arashi workspace
The extension SHALL resolve the active Arashi workspace root and discover related repositories from `.arashi/config.json` so repo-navigation flows work from the workspace root, child repositories, and sibling worktrees that belong to the same workspace family.

#### Scenario: Workspace root discovers configured child repositories
- **WHEN** the extension is activated in the Arashi workspace root
- **THEN** it loads the configured repository paths from `.arashi/config.json` and uses them to build related-repository navigation state

#### Scenario: Child repo workspace resolves back to the same Arashi family
- **WHEN** the extension is activated inside a child repository or sibling worktree that belongs to an initialized Arashi workspace
- **THEN** it resolves the corresponding Arashi workspace root and discovers related repositories from that shared workspace configuration

### Requirement: Label parent and child repository context clearly
The extension SHALL distinguish the workspace root or parent repository, the current repository, and other related child repositories in repo-navigation surfaces.

#### Scenario: Current repository is a child repo
- **WHEN** the current window is opened on a configured child repository
- **THEN** repo-navigation UI labels that repository as current and identifies the workspace root or parent context separately

#### Scenario: Current repository is the workspace root
- **WHEN** the current window is opened on the Arashi workspace root
- **THEN** repo-navigation UI labels the workspace root distinctly from child repositories

### Requirement: Open related repositories in focused editor windows
The extension SHALL allow users to open a selected related repository in a new editor window focused on that repository root.

#### Scenario: Open a child repository
- **WHEN** a user selects a child repository from repo-navigation UI or commands
- **THEN** the extension opens a new editor window rooted at that repository path

#### Scenario: Repository path is unavailable
- **WHEN** a user attempts to open a repository whose configured path is missing or inaccessible
- **THEN** the extension shows an actionable error and does not report a successful repo switch
