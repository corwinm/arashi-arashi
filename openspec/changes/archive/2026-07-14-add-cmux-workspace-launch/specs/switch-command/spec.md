## ADDED Requirements

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
