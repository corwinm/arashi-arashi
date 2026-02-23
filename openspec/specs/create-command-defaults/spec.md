# create-command-defaults Specification

## Purpose
TBD - created by archiving change faster-defaults-with-create. Update Purpose after archive.
## Requirements
### Requirement: Resolve create defaults from configuration and CLI
The system SHALL resolve `arashi create` execution behavior from workspace configuration defaults and CLI flags using deterministic precedence.

#### Scenario: Create defaults configured with no overriding flags
- **WHEN** the user runs `arashi create <branch>` and workspace config defines create defaults
- **THEN** the command applies those configured defaults for switch and launch behavior

#### Scenario: CLI flags override configured defaults
- **WHEN** the user runs `arashi create <branch>` with explicit flags for switch or shell/editor launch
- **THEN** the command uses explicit CLI values instead of configured defaults for those options

### Requirement: Support default auto-switch after create
The system SHALL support a configurable default that switches to the newly created worktree after successful creation.

#### Scenario: Auto-switch default enabled
- **WHEN** create auto-switch default is enabled and `arashi create <branch>` succeeds
- **THEN** the command performs switch behavior for the new worktree without requiring `--switch`

#### Scenario: Auto-switch default disabled
- **WHEN** create auto-switch default is disabled and the user does not pass `--switch`
- **THEN** the command completes create without switching

### Requirement: Support default shell or editor launch after create
The system SHALL support a configurable default launch command for `arashi create` that opens the newly created worktree in the user's preferred environment.

#### Scenario: Launch default configured
- **WHEN** the user runs `arashi create <branch>` and a default launch command is configured
- **THEN** the command invokes the configured launch behavior for the new worktree

#### Scenario: Launch default not configured
- **WHEN** the user runs `arashi create <branch>` and no launch default is configured
- **THEN** the command does not launch shell/editor behavior unless explicitly requested by CLI flags

### Requirement: Allow one-off opt-out from create defaults
The system SHALL provide per-invocation opt-out flags that disable configured create defaults without modifying workspace configuration.

#### Scenario: Opt out of configured auto-switch
- **WHEN** auto-switch is configured by default and the user invokes `arashi create <branch>` with a switch opt-out flag
- **THEN** the command does not switch after creation for that invocation

#### Scenario: Opt out of configured launch behavior
- **WHEN** launch behavior is configured by default and the user invokes `arashi create <branch>` with a launch opt-out flag
- **THEN** the command does not execute launch behavior for that invocation

### Requirement: Preserve current behavior when defaults are absent
The system MUST preserve existing create behavior when new create default settings are not present in configuration.

#### Scenario: Workspace has no create default settings
- **WHEN** the user runs `arashi create <branch>` in a workspace with no new create defaults configured
- **THEN** command behavior matches current explicit-flag-only behavior

