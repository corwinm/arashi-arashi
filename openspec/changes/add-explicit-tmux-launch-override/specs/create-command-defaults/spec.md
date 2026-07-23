## ADDED Requirements

### Requirement: Create supports explicit plain tmux post-create launch
The system SHALL allow `arashi create <branch> --tmux` to imply post-create launch. Explicit tmux SHALL override `--no-launch`, configured create defaults, and automatic launcher detection for that invocation, while generic and editor-scoped create `launchMode` vocabularies SHALL remain unchanged.

#### Scenario: Explicit tmux creates then launches the primary worktree
- **WHEN** the user runs `arashi create <branch> --tmux` with active tmux evidence and creation succeeds
- **THEN** Arashi creates the requested worktrees and opens the resolved primary worktree using `tmux new-window -c <primary-worktree-path>`

#### Scenario: Explicit tmux overrides configured create launch mode
- **WHEN** the user runs create with `--tmux` and configured create defaults select `auto`, `sesh`, or `herdr`
- **THEN** Arashi uses plain tmux for post-create launch

#### Scenario: Explicit tmux overrides launch opt-out
- **WHEN** the user combines `--tmux` with `--no-launch`
- **THEN** the explicit tmux selection implies post-create launch in the same way as explicit sesh or Herdr mode

#### Scenario: Explicit tmux overrides switch opt-out
- **WHEN** the user combines `--tmux` with `--no-switch`
- **THEN** the explicit tmux selection still resolves the primary created worktree and launches it because post-create launch requires target selection

#### Scenario: Standalone create supports explicit tmux
- **WHEN** the user runs `arashi create <branch> --tmux` in a zero-config standalone repository inside tmux
- **THEN** Arashi creates the standalone worktree and opens that primary worktree in a new plain tmux window

#### Scenario: Tmux process failure preserves created worktrees
- **WHEN** tmux context preflight succeeds, worktree creation succeeds, and `tmux new-window` exits unsuccessfully
- **THEN** Arashi reports the launch failure without trying another launcher or rolling back successfully created worktrees

#### Scenario: Create launch configuration remains unchanged
- **WHEN** Arashi validates generic or editor-scoped create defaults
- **THEN** `launchMode` continues to accept only `auto`, `sesh`, and `herdr`
- **AND** configured `auto` continues to choose tmux contextually when post-create launch runs inside tmux

### Requirement: Create validates explicit tmux before mutation
The system SHALL reject conflicting create launch overrides and missing tmux context before creating worktrees when explicit plain tmux launch is selected.

#### Scenario: Explicit tmux outside tmux creates nothing
- **WHEN** the user runs `arashi create <branch> --tmux` without a non-empty `TMUX` value
- **THEN** Arashi returns an actionable tmux-context usage error before creating any worktree or running create hooks

#### Scenario: Tmux conflicts with another create launcher
- **WHEN** the user combines `--tmux` with `--sesh` or `--herdr`
- **THEN** Arashi reports the complete deterministic set of conflicting create launch overrides before repository mutation
