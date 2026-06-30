# create-command-defaults Specification

## Purpose
Define how `arashi create` resolves configured defaults, host-specific behavior, explicit overrides, and interactive repository selection.
## Requirements
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
The system MUST preserve existing create behavior when new create default settings are not present in configuration, and editor-hosted invocations MUST fall back to no post-create defaults when no host-specific create defaults are configured.

#### Scenario: Terminal workspace has no create default settings
- **WHEN** the user runs `arashi create <branch>` from a terminal context in a workspace with no new create defaults configured
- **THEN** command behavior matches current explicit-flag-only behavior

#### Scenario: Editor host has no matching create defaults
- **WHEN** the user runs `arashi create <branch>` from a supported editor host and the workspace does not define create defaults for that host
- **THEN** the command does not apply generic create defaults and does not perform post-create switch or launch behavior unless explicitly requested by CLI flags

### Requirement: Support editor-scoped create defaults
The system SHALL allow workspace configuration to define create defaults scoped to supported editor hosts so extension-driven create flows can override generic terminal defaults.

#### Scenario: VS Code create defaults override terminal defaults
- **WHEN** the workspace defines both generic create defaults and VS Code-specific create defaults and a VS Code-hosted invocation runs `arashi create <branch>`
- **THEN** the command uses the VS Code-specific create defaults for that invocation

#### Scenario: Supported editor hosts use isolated create defaults
- **WHEN** the workspace defines create defaults for more than one supported editor host
- **THEN** each editor-hosted invocation uses only the defaults configured for its own host

### Requirement: Require the parent repository during interactive create selection
The system SHALL include the parent/meta repository in every interactive `arashi create` operation while allowing the user to choose which child repositories to include.

#### Scenario: Parent repository is not presented as an optional selection
- **WHEN** the user runs `arashi create <branch> --interactive` from a meta repository
- **THEN** the repository selection prompt lists only child repositories as optional choices
- **AND** the parent/meta repository is included in the repositories processed by create regardless of child selections

#### Scenario: Selected child repositories are created with the parent
- **WHEN** the user runs `arashi create <branch> --interactive`
- **AND** selects a subset of child repositories
- **THEN** the command creates the parent/meta worktree
- **AND** the command creates worktrees only for the selected child repositories

#### Scenario: No child repositories selected still creates parent
- **WHEN** the user runs `arashi create <branch> --interactive`
- **AND** selects no child repositories
- **THEN** the command proceeds with the parent/meta repository worktree creation
- **AND** the command does not fail with a no-repositories-selected error

### Requirement: Support create-time movement of current changes
The system SHALL provide an explicit `arashi create` option that moves compatible uncommitted changes from the current workspace into the newly created coordinated worktree after successful worktree creation.

#### Scenario: Create with move flag from dirty workspace
- **WHEN** the user runs `arashi create <branch> --move-changes` from a workspace with uncommitted changes
- **THEN** the command creates the coordinated worktree and moves compatible tracked and untracked changes from the current workspace into the new worktree

#### Scenario: Create with move flag from clean workspace
- **WHEN** the user runs `arashi create <branch> --move-changes` from a workspace with no uncommitted changes
- **THEN** the command creates the coordinated worktree and reports that there were no changes to move

#### Scenario: Create-time move fails after worktree creation
- **WHEN** `arashi create <branch> --move-changes` creates the coordinated worktree but cannot move changes safely
- **THEN** the command preserves the source changes or recovery stashes and reports the created worktree path plus recovery instructions

### Requirement: Show move guidance after creating from dirty workspace
The system SHALL show a concise help message after `arashi create` succeeds when the source workspace has uncommitted changes and the user did not request create-time movement.

#### Scenario: Dirty source without move flag
- **WHEN** the user runs `arashi create <branch>` from a workspace with uncommitted changes and does not pass the move flag
- **THEN** the command leaves the current workspace unchanged and prints an example command for moving the changes to the new worktree

#### Scenario: Clean source without move flag
- **WHEN** the user runs `arashi create <branch>` from a workspace with no uncommitted changes and does not pass the move flag
- **THEN** the command does not print change-movement guidance

#### Scenario: Partial dirty repositories after create
- **WHEN** the user runs `arashi create <branch>` from a workspace where only some repositories have uncommitted changes
- **THEN** the guidance identifies that only changed compatible repositories would be moved by the suggested command

#### Scenario: JSON create reports dirty-workspace move guidance structurally
- **WHEN** the user runs `arashi create <branch> --json` from a workspace with uncommitted changes and does not pass the move flag
- **THEN** stdout contains exactly one valid JSON document
- **AND** the JSON result includes structured dirty-workspace guidance with the changed compatible repositories and suggested follow-up move command
- **AND** no human-readable move guidance is written to stdout

