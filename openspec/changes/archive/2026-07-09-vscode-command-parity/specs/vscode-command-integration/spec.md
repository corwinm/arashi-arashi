## MODIFIED Requirements

### Requirement: Register core Arashi commands in VS Code
The extension SHALL register VS Code commands for `arashi init`, `arashi add`, `arashi clone`, `arashi create`, `arashi status`, `arashi move`, `arashi prune`, `arashi pull`, `arashi sync`, `arashi setup`, `arashi shell`, `arashi update`, `arashi install`, `arashi switch`, and `arashi remove`, and SHALL make them available for command-palette use and keybinding assignment. The extension MAY omit a separate command-palette entry for `arashi list` when equivalent list functionality is already provided by the worktree panel and refresh command.

#### Scenario: Core commands are discoverable
- **WHEN** the extension activates in a supported editor
- **THEN** each registered Arashi command appears in the command palette and can be bound to a keybinding

#### Scenario: List command is represented by the worktree panel
- **WHEN** a user needs to inspect Arashi worktrees from VS Code
- **THEN** the extension provides the worktree panel and refresh command as the supported list-style surface without requiring a separate `Arashi: List` command-palette entry

### Requirement: Use native VS Code input and confirmation flows
The extension SHALL gather required command inputs and confirmations through native VS Code UI components before invoking Arashi, and SHALL treat extension-collected confirmation for destructive remove, move, prune, setup, shell install, update apply, and binary install flows as the confirmation step before invoking the CLI mutation. Non-mutating status, check, preview, or dry-run flows SHALL NOT require confirmation.

#### Scenario: Command requires user input
- **WHEN** a command is triggered without required arguments
- **THEN** the extension prompts with native VS Code input or selection UI and passes the collected values to the CLI invocation

#### Scenario: User cancels input flow
- **WHEN** a user dismisses an input or selection prompt
- **THEN** the extension cancels command execution and reports a non-error cancellation message

#### Scenario: Confirmed remove runs without a second CLI prompt
- **WHEN** a user confirms an extension-driven worktree remove action after the extension has resolved the exact target worktree
- **THEN** the extension invokes `arashi remove` for that selected target in non-interactive forced mode and does not require a second CLI confirmation prompt

#### Scenario: Confirmed environment mutation runs intentionally
- **WHEN** a user confirms an extension-driven setup, shell install, update apply, or binary install action
- **THEN** the extension invokes the corresponding CLI command with non-interactive or confirmation-bypassing arguments only after the native confirmation has completed

### Requirement: Request machine-readable CLI output for parsed flows
The extension SHALL pass `--json` to Arashi CLI commands whenever the extension parses command output for UI state, decision-making, validation, previews, or summaries.

#### Scenario: Parsed command succeeds
- **WHEN** the extension runs a command whose output is consumed by extension logic
- **THEN** the CLI invocation includes `--json` and the extension parses structured output instead of terminal text

#### Scenario: Parsed command returns invalid JSON
- **WHEN** a `--json` command returns malformed or unsupported output
- **THEN** the extension shows an actionable error and records diagnostic details in the extension output channel

#### Scenario: Status summarizes structured state
- **WHEN** a user invokes `Arashi: Status`
- **THEN** the extension invokes `arashi status --json`, summarizes the clean/dirty/error outcome through native feedback, and logs command details to the output channel

#### Scenario: Prune previews stale metadata before mutation
- **WHEN** a user invokes `Arashi: Prune Stale Worktrees`
- **THEN** the extension invokes a structured dry-run preview before asking whether to apply pruning

### Requirement: Provide consistent execution feedback
The extension SHALL present command success and failure outcomes through standardized notifications and an output channel entry containing command context, and SHALL show a native progress notification while long-running Arashi commands are executing.

#### Scenario: Command succeeds
- **WHEN** an Arashi command exits successfully
- **THEN** the extension shows a success notification and logs the executed command context in the output channel

#### Scenario: Command fails
- **WHEN** an Arashi command exits with an error
- **THEN** the extension shows an error notification with remediation guidance and logs stderr details in the output channel

#### Scenario: Long-running command shows progress
- **WHEN** the extension runs a long-running Arashi command such as add, clone, create, init, install, move, prune, pull, remove, setup, shell install, switch, sync, or update
- **THEN** the extension shows a native in-progress notification until the command finishes and then reports the final outcome

### Requirement: Refresh panel state after mutating extension commands
The extension SHALL refresh the worktree panel after successful create, add, clone, remove, move, prune, setup, install, update, pull, sync, and panel mutation flows that can change visible Arashi state.

#### Scenario: Successful command updates visible panel state
- **WHEN** a mutating Arashi command succeeds through the extension
- **THEN** the extension refreshes the panel before reporting the operation as complete to the user

#### Scenario: Failed command does not report a successful refresh
- **WHEN** a mutating Arashi command fails
- **THEN** the extension reports the failure and does not present the panel as successfully refreshed

## ADDED Requirements

### Requirement: Document extension command-palette coverage
The extension SHALL document the supported command-palette actions and safety behavior in extension-specific documentation.

#### Scenario: User reads extension README
- **WHEN** a user opens the extension README or marketplace documentation
- **THEN** the documented feature list identifies the supported Arashi command-palette actions and notes that destructive or environment-changing actions require native confirmation
