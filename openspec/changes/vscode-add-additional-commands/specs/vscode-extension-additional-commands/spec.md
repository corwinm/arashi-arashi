## ADDED Requirements

### Requirement: Extension exposes pull and sync commands
The VSCode extension SHALL contribute command palette entries for Arashi `pull` and `sync` workflows.

#### Scenario: Command palette lists pull and sync
- **WHEN** a user opens the VSCode command palette and searches for Arashi commands
- **THEN** the extension shows command entries for pull and sync

### Requirement: Extension maps new commands to CLI execution
The extension SHALL execute the corresponding Arashi CLI command when a user runs the pull or sync command from VSCode.

#### Scenario: Pull command executes CLI pull
- **WHEN** a user invokes the extension pull command
- **THEN** the extension starts the Arashi CLI pull workflow

#### Scenario: Sync command executes CLI sync
- **WHEN** a user invokes the extension sync command
- **THEN** the extension starts the Arashi CLI sync workflow

### Requirement: Extension surfaces command execution failures
The extension MUST provide user-visible failure feedback when pull or sync command execution fails.

#### Scenario: Pull or sync command fails
- **WHEN** the CLI invocation for pull or sync exits with an error
- **THEN** the extension displays an error message that indicates the command did not complete
