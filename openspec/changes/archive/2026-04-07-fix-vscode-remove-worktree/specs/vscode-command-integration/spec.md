## MODIFIED Requirements

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
