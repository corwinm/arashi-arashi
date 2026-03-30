## MODIFIED Requirements

### Requirement: Open a new terminal context at the selected worktree
The system SHALL open a new terminal or editor context rooted at the selected worktree path and SHALL support config-driven default launch behavior, explicit IDE CLI overrides, and launch opt-out handling.

#### Scenario: Switch applies configured launch default
- **WHEN** the user runs `arashi switch` and switch launch behavior is configured in workspace defaults
- **THEN** the command launches the configured terminal or editor behavior for the selected worktree

#### Scenario: Explicit IDE flag overrides switch default
- **WHEN** switch launch defaults are configured and the user passes one of `--vscode`, `--cursor`, or `--kiro`
- **THEN** the command launches the selected IDE for that invocation instead of the configured default

#### Scenario: User opts out of default launch behavior
- **WHEN** switch launch defaults are configured and the user provides a launch opt-out flag
- **THEN** the command skips configured default launch behavior for that invocation

#### Scenario: Conflicting launch overrides are provided
- **WHEN** the user passes more than one explicit IDE launch flag in a single invocation
- **THEN** the system exits with an error instructing the user to choose exactly one launch override

#### Scenario: No switch launch defaults configured
- **WHEN** the user runs `arashi switch` and no switch launch defaults are configured
- **THEN** the command preserves existing switch launch behavior

## ADDED Requirements

### Requirement: Launch supported IDE targets explicitly
The system SHALL provide explicit CLI flags for supported IDE launchers and SHALL map each supported flag to the corresponding editor command for the selected worktree.

#### Scenario: Launch VS Code explicitly
- **WHEN** the user runs `arashi switch --vscode`
- **THEN** the system opens the selected worktree in VS Code

#### Scenario: Launch Cursor explicitly
- **WHEN** the user runs `arashi switch --cursor`
- **THEN** the system opens the selected worktree in Cursor

#### Scenario: Launch Kiro explicitly
- **WHEN** the user runs `arashi switch --kiro`
- **THEN** the system opens the selected worktree in Kiro

#### Scenario: Explicit IDE launcher is unavailable
- **WHEN** the user requests an explicit IDE launch flag and the corresponding editor CLI is unavailable
- **THEN** the system exits with an actionable error identifying the missing launcher

### Requirement: Prefer the active IDE when switching from a supported IDE environment
The system SHALL detect supported IDE environments and SHALL prefer the matching IDE launcher when the user does not provide an explicit launch override.

#### Scenario: Cursor environment prefers Cursor launcher
- **WHEN** the user runs `arashi switch` from a Cursor-integrated environment and no explicit launch override is provided
- **THEN** the system opens the selected worktree in Cursor when the Cursor launcher is available

#### Scenario: Kiro environment prefers Kiro launcher
- **WHEN** the user runs `arashi switch` from a Kiro-integrated environment and no explicit launch override is provided
- **THEN** the system opens the selected worktree in Kiro when the Kiro launcher is available

#### Scenario: Unsupported environment uses existing fallback behavior
- **WHEN** the user runs `arashi switch` from an environment that does not match a supported IDE
- **THEN** the system uses the existing non-IDE fallback launch behavior
