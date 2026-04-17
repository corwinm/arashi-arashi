## MODIFIED Requirements

### Requirement: Resolve create defaults from configuration and CLI
The system SHALL resolve `arashi create` execution behavior from CLI flags, invocation context, and workspace configuration using deterministic precedence.

#### Scenario: Terminal invocation applies generic create defaults
- **WHEN** the user runs `arashi create <branch>` from a terminal context and workspace config defines generic create defaults
- **THEN** the command applies those configured defaults for switch and launch behavior

#### Scenario: Editor-hosted invocation applies host-specific create defaults
- **WHEN** the user runs `arashi create <branch>` from a supported editor host and workspace config defines create defaults for that host
- **THEN** the command applies the matching host-specific defaults for switch and launch behavior

#### Scenario: CLI flags override configured defaults
- **WHEN** the user runs `arashi create <branch>` with explicit flags for switch or shell/editor launch
- **THEN** the command uses explicit CLI values instead of configured defaults for those options

### Requirement: Preserve current behavior when defaults are absent
The system MUST preserve existing create behavior when new create default settings are not present in configuration, and editor-hosted invocations MUST fall back to no post-create defaults when no host-specific create defaults are configured.

#### Scenario: Terminal workspace has no create default settings
- **WHEN** the user runs `arashi create <branch>` from a terminal context in a workspace with no new create defaults configured
- **THEN** command behavior matches current explicit-flag-only behavior

#### Scenario: Editor host has no matching create defaults
- **WHEN** the user runs `arashi create <branch>` from a supported editor host and the workspace does not define create defaults for that host
- **THEN** the command does not apply generic create defaults and does not perform post-create switch or launch behavior unless explicitly requested by CLI flags

## ADDED Requirements

### Requirement: Support editor-scoped create defaults
The system SHALL allow workspace configuration to define create defaults scoped to supported editor hosts so extension-driven create flows can override generic terminal defaults.

#### Scenario: VS Code create defaults override terminal defaults
- **WHEN** the workspace defines both generic create defaults and VS Code-specific create defaults and a VS Code-hosted invocation runs `arashi create <branch>`
- **THEN** the command uses the VS Code-specific create defaults for that invocation

#### Scenario: Supported editor hosts use isolated create defaults
- **WHEN** the workspace defines create defaults for more than one supported editor host
- **THEN** each editor-hosted invocation uses only the defaults configured for its own host
