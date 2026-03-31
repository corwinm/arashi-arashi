## MODIFIED Requirements

### Requirement: Open a new terminal context at the selected worktree
The system SHALL resolve switch behavior for the selected worktree using CLI flags, configured switch defaults, and shell-integration availability, and SHALL either launch a new terminal or editor context or request a parent-shell directory change for the selected worktree.

#### Scenario: Switch applies configured launch default
- **WHEN** the user runs `arashi switch` and switch behavior is configured with a `launch` default
- **THEN** the command launches the configured terminal or editor behavior for the selected worktree

#### Scenario: Explicit IDE flag overrides switch default
- **WHEN** switch launch defaults are configured and the user passes one of `--vscode`, `--cursor`, or `--kiro`
- **THEN** the command launches the selected IDE for that invocation instead of the configured default

#### Scenario: User requests parent-shell directory switching
- **WHEN** the user runs `arashi switch --cd` and shell integration is active for the invocation
- **THEN** the command requests a parent-shell directory change for the selected worktree instead of opening a new terminal or editor context

#### Scenario: Auto mode prefers directory switching when integration is active
- **WHEN** the user runs `arashi switch` with switch behavior configured as `auto` and shell integration is active
- **THEN** the command requests a parent-shell directory change for the selected worktree

#### Scenario: Auto mode falls back to launch behavior when integration is inactive
- **WHEN** the user runs `arashi switch` with switch behavior configured as `auto` and shell integration is not active
- **THEN** the command preserves the existing launch behavior for the selected worktree

#### Scenario: User disables directory switching for one invocation
- **WHEN** the user runs `arashi switch --no-cd` and switch behavior would otherwise resolve to `cd` or `auto`
- **THEN** the command skips directory switching for that invocation and uses launch behavior instead

#### Scenario: Requested directory switching is unavailable
- **WHEN** the user runs `arashi switch --cd` or switch behavior resolves to `cd` but shell integration is not active
- **THEN** the command does not fail solely because directory switching is unavailable and shows an actionable warning explaining how to enable shell integration or rerun through the wrapper

#### Scenario: Conflicting launch overrides are provided
- **WHEN** the user passes more than one explicit IDE launch flag in a single invocation
- **THEN** the system exits with an error instructing the user to choose exactly one launch override

## ADDED Requirements

### Requirement: Preserve existing explicit sesh behavior when directory switching is available
The system SHALL keep explicit sesh mode available even when shell integration is installed or switch defaults prefer directory switching.

#### Scenario: Explicit sesh mode bypasses directory switching
- **WHEN** the user runs `arashi switch --sesh` in an invocation where shell integration is active
- **THEN** the system uses sesh-based switching rules instead of emitting a directory-change directive
