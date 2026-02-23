## MODIFIED Requirements

### Requirement: Duplicate configured repository guidance points to clone workflow
The add command SHALL detect when a repository already exists in workspace configuration and SHALL present clone-oriented guidance instead of rename/remove remediation.

#### Scenario: Repository already configured
- **WHEN** the user runs `arashi add <git-url>` and the repository name already exists in configuration
- **THEN** the command reports that the repository is already configured and recommends `arashi clone` to obtain a missing local copy

### Requirement: Offer clone fallback after duplicate detection
The add command SHALL offer a fallback path to start the clone workflow when duplicate configuration is detected in interactive terminals.

#### Scenario: User accepts clone fallback
- **WHEN** duplicate configuration is detected and the user accepts the clone fallback prompt
- **THEN** the command starts the clone workflow for missing configured repositories

#### Scenario: User declines clone fallback
- **WHEN** duplicate configuration is detected and the user declines the clone fallback prompt
- **THEN** the command exits without changing configuration or removing repositories

### Requirement: Remove incorrect remove-command guidance from duplicate errors
The add command MUST NOT suggest `arashi remove` as remediation for a duplicate configured repository discovered during add.

#### Scenario: Duplicate add error output
- **WHEN** the command reports a duplicate configured repository
- **THEN** the output omits suggestions to remove repositories via `arashi remove`
