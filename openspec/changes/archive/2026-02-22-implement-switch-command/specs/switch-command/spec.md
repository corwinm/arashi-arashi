## ADDED Requirements

### Requirement: Discover switchable worktree targets
The system SHALL discover existing git worktrees associated with the current Arashi workspace and expose each target with its branch reference and absolute worktree path.

#### Scenario: Worktrees are available
- **WHEN** the user runs `arashi switch`
- **THEN** the system returns one candidate per discoverable worktree with branch and path metadata

#### Scenario: No worktrees are available
- **WHEN** the user runs `arashi switch` in a workspace with no switchable worktrees
- **THEN** the system exits with an error explaining that no switch targets were found

### Requirement: Filter and select a switch target
The system SHALL support selecting a target by optional filter text and SHALL require explicit disambiguation when multiple candidates remain.

#### Scenario: Filter resolves to a single target
- **WHEN** the user runs `arashi switch <filter>` and exactly one candidate matches branch or path
- **THEN** the system selects that candidate without additional prompts

#### Scenario: Multiple matches in interactive terminal
- **WHEN** the user runs `arashi switch <filter>` in an interactive terminal and multiple candidates match
- **THEN** the system prompts the user to choose exactly one target

#### Scenario: Multiple matches in non-interactive terminal
- **WHEN** the user runs `arashi switch <filter>` in a non-interactive terminal and multiple candidates match
- **THEN** the system exits with an error instructing the user to provide a more specific filter

### Requirement: Open a new terminal context at the selected worktree
The system SHALL open a new terminal context rooted at the selected worktree path and SHALL NOT attempt to change the working directory of the invoking shell process.

#### Scenario: Successful terminal launch
- **WHEN** a target is selected and terminal launch succeeds
- **THEN** the system opens a new terminal context with the selected worktree as the working directory

#### Scenario: Terminal launch fails
- **WHEN** a target is selected but terminal launch fails
- **THEN** the system exits with an actionable error that includes the selected path and failure reason

### Requirement: Support tmux sesh mode
The system SHALL provide a `--sesh` flag that uses sesh-based switching when running in tmux and SHALL validate prerequisites before attempting the switch.

#### Scenario: sesh mode succeeds in tmux
- **WHEN** the user runs `arashi switch --sesh` inside tmux and `sesh` is available
- **THEN** the system launches or switches to the selected worktree using sesh integration

#### Scenario: sesh mode requested outside tmux
- **WHEN** the user runs `arashi switch --sesh` outside tmux
- **THEN** the system exits with an error explaining that `--sesh` requires tmux

#### Scenario: sesh binary is unavailable
- **WHEN** the user runs `arashi switch --sesh` in tmux but `sesh` is not found
- **THEN** the system exits with an error indicating sesh is required and suggesting standard switch mode

### Requirement: Prefer VS Code window switching when in VS Code terminal
The system SHALL detect VS Code terminal context and SHALL prefer opening a new VS Code window rooted at the selected worktree when VS Code CLI support is available.

#### Scenario: VS Code terminal with CLI available
- **WHEN** the user runs `arashi switch` from a VS Code terminal and `code` is available
- **THEN** the system opens a new VS Code window at the selected worktree path

#### Scenario: VS Code terminal without CLI available
- **WHEN** the user runs `arashi switch` from a VS Code terminal and `code` is unavailable
- **THEN** the system falls back to standard terminal launch behavior
