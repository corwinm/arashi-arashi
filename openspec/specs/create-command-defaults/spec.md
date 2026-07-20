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

### Requirement: Reuse cmux-aware launch behavior after create
The system SHALL use the shared terminal-aware worktree launcher for post-create launch behavior so cmux-managed invocations create and focus a cmux workspace at the newly created primary worktree.

#### Scenario: Explicit post-create launch uses cmux
- **WHEN** a user runs `arashi create <branch> --launch` from a cmux-managed terminal and worktree creation succeeds
- **THEN** Arashi creates and focuses a cmux workspace rooted at the newly created primary worktree
- **AND** the create result reports launch mode `cmux`

#### Scenario: Configured post-create launch uses cmux
- **WHEN** create launch behavior is enabled by workspace defaults and `arashi create <branch>` succeeds from a cmux-managed terminal
- **THEN** Arashi uses the same cmux workspace launch behavior as `arashi switch`

#### Scenario: Post-create cmux launch fails after worktree creation
- **WHEN** coordinated worktree creation succeeds but cmux workspace creation or response validation fails
- **THEN** Arashi preserves the created worktrees
- **AND** reports an actionable launch failure that distinguishes the completed worktree creation from the failed cmux launch
- **AND** does not fall back to standalone Ghostty

### Requirement: Implicit standalone create has no persisted command defaults
`arashi create` in implicit standalone mode SHALL resolve behavior from explicit invocation flags and existing built-in defaults without loading or persisting configured create/editor defaults.

#### Scenario: Standalone create has no explicit overrides
- **WHEN** a user runs create in implicit standalone mode without launch or switch overrides
- **THEN** Arashi applies existing built-in command behavior
- **AND** does not infer defaults from another worktree, user-global state, or synthesized configuration

#### Scenario: Standalone create has explicit overrides
- **WHEN** the user supplies supported explicit launch or switch flags
- **THEN** those flags control the invocation under existing precedence rules
- **AND** no command-default configuration is written

#### Scenario: Configured defaults exist
- **WHEN** a valid configured workspace provides create or editor defaults
- **THEN** existing configured default resolution remains authoritative despite a root `.worktrees/` directory

### Requirement: Support Herdr post-create launch selection
The system SHALL support Herdr as an explicit and configured post-create launch mode and SHALL build the Herdr launch candidate from the successfully created primary repository's source checkout and worktree metadata.

#### Scenario: Explicit create Herdr launch succeeds
- **WHEN** the user runs `arashi create <branch> --herdr` and coordinated worktree creation succeeds
- **THEN** `--herdr` implies post-create launch
- **AND** Arashi opens or focuses the primary created worktree through the shared Herdr launcher
- **AND** the create result reports launch mode `herdr`

#### Scenario: Generic launch auto-detects Herdr
- **WHEN** the user runs `arashi create <branch> --launch` from an environment where `HERDR_ENV` normalizes to `1`
- **THEN** Arashi uses the same automatic Herdr launch behavior as `arashi switch`

#### Scenario: Configured create launch mode uses Herdr
- **WHEN** generic or editor-scoped create defaults enable launch with `launchMode: "herdr"`
- **THEN** Arashi uses Herdr after successful creation even when the invocation is outside a Herdr-managed pane

#### Scenario: Explicit create launchers conflict
- **WHEN** the user combines `--herdr` with `--sesh`
- **THEN** Arashi rejects the invocation before worktree creation and instructs the user to select one launcher

#### Scenario: Explicit Herdr takes precedence over launch opt-out
- **WHEN** the user combines `--herdr` with `--no-launch`
- **THEN** the explicit Herdr selection implies post-create launch in the same way as explicit sesh mode

#### Scenario: Launch opt-out suppresses configured Herdr
- **WHEN** create defaults configure `launchMode: "herdr"` and the user passes `--no-launch` without explicit `--herdr`
- **THEN** Arashi creates the requested worktrees without launching Herdr

#### Scenario: Primary create result provides source provenance
- **WHEN** Arashi launches the primary successfully created worktree through Herdr
- **THEN** the launch candidate uses the successful repository's Git-resolved non-bare main checkout for Herdr `--cwd`
- **AND** uses the newly created absolute worktree path for Herdr `--path`

#### Scenario: Primary create repository is bare
- **WHEN** creation succeeds for a primary repository with no non-bare main checkout and Herdr post-create launch was selected
- **THEN** Arashi preserves every successfully created worktree
- **AND** reports that Herdr requires a non-bare source checkout without invoking Herdr or another launcher

### Requirement: Preserve created worktrees when Herdr launch fails
The system SHALL treat Herdr post-create launch as a non-transactional action after worktree creation and MUST NOT roll back successfully created Git worktrees when the external launch fails.

#### Scenario: Herdr process fails after coordinated creation
- **WHEN** coordinated worktree creation succeeds but Herdr cannot execute or reach its server/socket
- **THEN** Arashi preserves every successfully created worktree
- **AND** reports an actionable launch failure that distinguishes completed creation from failed Herdr launch
- **AND** does not invoke another launcher

#### Scenario: Herdr response validation fails after standalone creation
- **WHEN** standalone worktree creation succeeds but Herdr returns malformed or incomplete JSON
- **THEN** Arashi preserves the created standalone worktree
- **AND** reports the response-validation failure without attempting Git rollback

### Requirement: Keep Herdr workspace cleanup independent from remove
The system SHALL NOT automatically close or remove Herdr workspaces when Arashi removes a Git worktree.

#### Scenario: Arashi removes a worktree opened in Herdr
- **WHEN** `arashi remove` removes an Arashi-managed worktree that has a Herdr workspace
- **THEN** Arashi performs no implicit Herdr workspace mutation
- **AND** documentation explains manual cleanup and a pre-remove `herdr workspace close` policy as opt-in mechanisms
- **AND** cleanup guidance does not invoke Git-mutating `herdr worktree remove`

### Requirement: Preserve machine-readable create restrictions
The system SHALL reject Herdr launch combined with create JSON mode before any worktree mutation, consistent with existing interactive and launch restrictions.

#### Scenario: JSON create requests Herdr
- **WHEN** the user invokes `arashi create <branch> --json --herdr`
- **THEN** Arashi returns the existing structured unsupported-mode error before creating worktrees or launching Herdr

