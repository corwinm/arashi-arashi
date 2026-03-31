## MODIFIED Requirements

### Requirement: Filter and select a switch target
The system SHALL support selecting a target by optional filter text, SHALL support exact worktree-path selection when the caller declares path mode, and SHALL require explicit disambiguation when multiple candidates remain.

#### Scenario: Filter resolves to a single target
- **WHEN** the user runs `arashi switch <filter>` and exactly one candidate matches branch or path
- **THEN** the system selects that candidate without additional prompts

#### Scenario: Multiple matches in interactive terminal
- **WHEN** the user runs `arashi switch <filter>` in an interactive terminal and multiple candidates match
- **THEN** the system prompts the user to choose exactly one target

#### Scenario: Multiple matches in non-interactive terminal
- **WHEN** the user runs `arashi switch <filter>` in a non-interactive terminal and multiple candidates match
- **THEN** the system exits with an error instructing the user to provide a more specific filter

#### Scenario: Exact path resolves selected worktree
- **WHEN** the user runs `arashi switch --path <worktree-path>` and exactly one candidate has that normalized absolute worktree path
- **THEN** the system selects that candidate without applying fuzzy branch or substring matching

#### Scenario: Exact path does not match a worktree
- **WHEN** the user runs `arashi switch --path <worktree-path>` and no candidate has that normalized absolute worktree path
- **THEN** the system exits with an error explaining that no worktree exists at the requested path
