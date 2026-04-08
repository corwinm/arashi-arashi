# vscode-command-integration Specification

## Purpose
TBD - created by archiving change create-vscode-plugin. Update Purpose after archive.
## Requirements
### Requirement: Register core Arashi commands in VS Code
The extension SHALL register VS Code commands for `arashi init`, `arashi add`, `arashi create`, `arashi switch`, and `arashi remove`, and SHALL make them available for command-palette use and keybinding assignment.

#### Scenario: Core commands are discoverable
- **WHEN** the extension activates in a supported editor
- **THEN** each core Arashi command appears in the command palette and can be bound to a keybinding

### Requirement: Use native VS Code input and confirmation flows
The extension SHALL gather required command inputs and confirmations through native VS Code UI components before invoking Arashi, and SHALL treat extension-collected confirmation for destructive remove flows as the single confirmation step before invoking the CLI.

#### Scenario: Command requires user input
- **WHEN** a command is triggered without required arguments
- **THEN** the extension prompts with native VS Code input or selection UI and passes the collected values to the CLI invocation

#### Scenario: User cancels input flow
- **WHEN** a user dismisses an input or selection prompt
- **THEN** the extension cancels command execution and reports a non-error cancellation message

#### Scenario: Confirmed remove runs without a second CLI prompt
- **WHEN** a user confirms an extension-driven worktree remove action after the extension has resolved the exact target worktree
- **THEN** the extension invokes `arashi remove` for that selected target in non-interactive forced mode and does not require a second CLI confirmation prompt

### Requirement: Request machine-readable CLI output for parsed flows
The extension SHALL pass `--json` to Arashi CLI commands whenever the extension parses command output for UI state, decision-making, or validation.

#### Scenario: Parsed command succeeds
- **WHEN** the extension runs a command whose output is consumed by extension logic
- **THEN** the CLI invocation includes `--json` and the extension parses structured output instead of terminal text

#### Scenario: Parsed command returns invalid JSON
- **WHEN** a `--json` command returns malformed or unsupported output
- **THEN** the extension shows an actionable error and records diagnostic details in the extension output channel

### Requirement: Provide consistent execution feedback
The extension SHALL present command success and failure outcomes through standardized notifications and an output channel entry containing command context, and SHALL show a native progress notification while long-running Arashi commands are executing.

#### Scenario: Command succeeds
- **WHEN** an Arashi command exits successfully
- **THEN** the extension shows a success notification and logs the executed command context in the output channel

#### Scenario: Command fails
- **WHEN** an Arashi command exits with an error
- **THEN** the extension shows an error notification with remediation guidance and logs stderr details in the output channel

#### Scenario: Long-running command shows progress
- **WHEN** the extension runs a long-running Arashi command such as add, clone, create, init, pull, remove, switch, or sync
- **THEN** the extension shows a native in-progress notification until the command finishes and then reports the final outcome

### Requirement: Preserve compatibility across VS Code forks
The extension SHALL declare `engines.vscode` as `^1.96.2` and SHALL use stable VS Code APIs so it can run in VS Code and compatible forks such as Cursor.

#### Scenario: Compatible editor runs extension
- **WHEN** the extension is installed in VS Code or a compatible fork that satisfies `^1.96.2`
- **THEN** command registration and execution behavior matches the documented baseline

### Requirement: Publish releases to both extension marketplaces
The release process SHALL publish each production extension version to both VS Marketplace and Open VSX.

#### Scenario: Production release is published
- **WHEN** a new production extension version is released
- **THEN** that version is available in both VS Marketplace and Open VSX

### Requirement: Pass host-specific switch overrides from the extension
The extension SHALL detect whether it is running in VS Code, Cursor, or Kiro and SHALL pass the matching `arashi switch` IDE flag when invoking switch flows that do not already specify an explicit launch override.

#### Scenario: VS Code host passes VS Code override
- **WHEN** the extension runs `arashi switch` inside VS Code and no explicit launch override has already been chosen
- **THEN** the extension invokes the CLI with `--vscode`

#### Scenario: Cursor host passes Cursor override
- **WHEN** the extension runs `arashi switch` inside Cursor and no explicit launch override has already been chosen
- **THEN** the extension invokes the CLI with `--cursor`

#### Scenario: Kiro host passes Kiro override
- **WHEN** the extension runs `arashi switch` inside Kiro and no explicit launch override has already been chosen
- **THEN** the extension invokes the CLI with `--kiro`

#### Scenario: Unsupported host omits IDE override
- **WHEN** the extension runs `arashi switch` in a compatible host that does not map to a supported IDE override
- **THEN** the extension invokes the CLI without adding an IDE-specific launch flag

### Requirement: Pass exact worktree identity for selected switch targets
The extension SHALL invoke `arashi switch` with explicit worktree-path targeting whenever an extension switch flow has already resolved a concrete worktree selection.

#### Scenario: Command palette switch uses exact path mode
- **WHEN** a user runs the extension switch command, chooses a specific worktree from the native picker, and the extension invokes `arashi switch`
- **THEN** the extension passes the selected worktree path using the CLI's explicit path-targeting mode instead of a fuzzy positional filter

#### Scenario: Exact path mode preserves host-specific launch overrides
- **WHEN** an extension switch flow invokes `arashi switch` for a selected worktree in VS Code, Cursor, or Kiro
- **THEN** the extension still passes the matching host-specific IDE override together with the explicit path-targeting mode

### Requirement: Register repository navigation commands in VS Code
The extension SHALL register command-palette commands for opening the Arashi workspace root and related repositories in repo-focused editor windows, and SHALL reuse the same command handlers from tree-view interactions.

#### Scenario: Repo navigation commands are discoverable
- **WHEN** a user opens the command palette and searches for Arashi commands
- **THEN** the extension shows commands for opening related repositories in addition to the existing worktree-management commands

#### Scenario: Tree and command palette reuse the same repo-opening flow
- **WHEN** a user opens a repository from either the panel or the command palette
- **THEN** the extension executes the same repo-selection and repo-opening logic for both entry points

### Requirement: Refresh panel state after mutating extension commands
The extension SHALL refresh the worktree panel after successful create, add, clone, remove, pull, sync, and panel mutation flows that can change visible Arashi state.

#### Scenario: Successful command updates visible panel state
- **WHEN** a mutating Arashi command succeeds through the extension
- **THEN** the extension refreshes the panel before reporting the operation as complete to the user

#### Scenario: Failed command does not report a successful refresh
- **WHEN** a mutating Arashi command fails
- **THEN** the extension reports the failure and does not present the panel as successfully refreshed
