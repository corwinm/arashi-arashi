## MODIFIED Requirements

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
