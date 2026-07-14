# switch-command Specification

## Purpose
TBD - created by archiving change implement-switch-command. Update Purpose after archive.
## Requirements
### Requirement: Discover switchable worktree targets
The system SHALL discover existing git worktrees associated with the current Arashi workspace and expose each target with its branch reference and absolute worktree path.

#### Scenario: Worktrees are available
- **WHEN** the user runs `arashi switch`
- **THEN** the system returns one candidate per discoverable worktree with branch and path metadata

#### Scenario: No worktrees are available
- **WHEN** the user runs `arashi switch` in a workspace with no switchable worktrees
- **THEN** the system exits with an error explaining that no switch targets were found

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
- **WHEN** the user runs `arashi switch --cd` but shell integration is not active
- **THEN** the command does not fail solely because directory switching is unavailable, does not launch an alternate terminal or editor context for that invocation, and shows an actionable warning explaining how to enable shell integration or rerun through the wrapper

#### Scenario: Configured cd mode is unavailable
- **WHEN** switch behavior resolves to configured `cd` mode but shell integration is not active
- **THEN** the command shows an actionable warning and follows normal launch resolution for the selected worktree

#### Scenario: Conflicting launch overrides are provided
- **WHEN** the user passes more than one explicit IDE launch flag in a single invocation
- **THEN** the system exits with an error instructing the user to choose exactly one launch override

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

### Requirement: Preserve existing explicit sesh behavior when directory switching is available
The system SHALL keep explicit sesh mode available even when shell integration is installed or switch defaults prefer directory switching.

#### Scenario: Explicit sesh mode bypasses directory switching
- **WHEN** the user runs `arashi switch --sesh` in an invocation where shell integration is active
- **THEN** the system uses sesh-based switching rules instead of emitting a directory-change directive

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

### Requirement: Launch selected worktrees as cmux workspaces
The system SHALL detect a cmux-managed terminal from cmux-specific workspace or surface environment identifiers and SHALL create and focus a cmux workspace rooted at the exact selected worktree before generic Ghostty fallback behavior can run.

#### Scenario: Switch launches a cmux workspace
- **WHEN** the user runs `arashi switch <target>` from a terminal with a non-empty `CMUX_WORKSPACE_ID` or `CMUX_SURFACE_ID`
- **THEN** Arashi creates a cmux workspace with the selected worktree's absolute path as its working directory
- **AND** the new cmux workspace is focused
- **AND** the switch result reports launch mode `cmux`

#### Scenario: Worktree path is passed without shell interpolation
- **WHEN** the selected cmux worktree path contains spaces, quotes, or shell-significant characters
- **THEN** Arashi passes the complete absolute path as a distinct process argument
- **AND** cmux receives that exact path as the requested working directory

#### Scenario: Ordinary Ghostty is not treated as cmux
- **WHEN** the user runs `arashi switch` with `TERM_PROGRAM=ghostty` but without a non-empty cmux workspace or surface identifier
- **THEN** Arashi preserves the ordinary Ghostty launch behavior

#### Scenario: Socket path alone does not imply active cmux context
- **WHEN** `CMUX_SOCKET_PATH` is set outside a cmux-managed terminal without a non-empty cmux workspace or surface identifier
- **THEN** Arashi does not automatically select cmux launch mode

### Requirement: Validate cmux workspace creation before reporting success
The system SHALL use the supported structured cmux workspace-creation contract and SHALL report success only when the command exits successfully and returns a parseable non-empty workspace identifier or reference.

#### Scenario: Structured workspace creation succeeds
- **WHEN** cmux returns a successful JSON response containing a non-empty workspace identifier or reference
- **THEN** Arashi reports cmux launch success and includes the executed command in the launch result

#### Scenario: cmux CLI is unavailable
- **WHEN** Arashi detects a cmux-managed terminal but cannot execute the `cmux` CLI
- **THEN** Arashi exits with an actionable `LAUNCH_FAILED` error identifying the attempted command and selected worktree
- **AND** Arashi does not fall back to standalone Ghostty

#### Scenario: cmux socket access fails
- **WHEN** cmux rejects workspace creation because its socket is disabled, inaccessible, or disallows the caller
- **THEN** Arashi exits with an actionable `LAUNCH_FAILED` error that preserves useful cmux failure detail
- **AND** Arashi does not report a successful switch

#### Scenario: cmux returns malformed or incomplete output
- **WHEN** cmux exits successfully but stdout is not valid JSON or does not contain a non-empty workspace identifier or reference
- **THEN** Arashi exits with `LAUNCH_FAILED` and explains that the cmux response could not be validated
- **AND** Arashi does not silently use another launcher

### Requirement: Preserve explicit and nested terminal launch precedence
The system SHALL preserve explicit sesh and IDE launch overrides and SHALL preserve active tmux handling ahead of automatic cmux detection.

#### Scenario: Explicit IDE override wins in cmux
- **WHEN** a user in a cmux-managed terminal requests a supported explicit IDE launch flag
- **THEN** Arashi launches the requested IDE instead of creating a cmux workspace

#### Scenario: Explicit sesh retains highest terminal-session priority
- **WHEN** a user requests `--sesh` from a cmux-managed terminal with an active tmux session
- **THEN** Arashi follows the existing sesh validation and launch behavior

#### Scenario: Nested tmux retains tmux behavior
- **WHEN** `TMUX` and cmux managed-terminal identifiers are both non-empty and no explicit launch override is provided
- **THEN** Arashi opens the selected worktree through the existing tmux launch behavior rather than creating a cmux workspace
