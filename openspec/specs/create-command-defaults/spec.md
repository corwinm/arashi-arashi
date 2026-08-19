# create-command-defaults Specification

## Purpose

Define how `arashi create` resolves configured defaults, host-specific behavior, explicit overrides, and interactive repository selection.
## Requirements
### Requirement: Resolve create defaults from configuration and CLI

The system SHALL resolve `arashi create` launch/switch behavior from CLI flags, invocation context, and supported create defaults while resolving branch ancestry from the shared repository base policy. `defaults.create` SHALL control only create launch and switch behavior and MUST NOT accept a `baseBranch` property. Explicit `--base` and `--repo-base` values SHALL participate in shared create/clone base-policy precedence. Editor-scoped create defaults SHALL continue to control only switch and launch behavior.

#### Scenario: Terminal invocation applies generic create defaults

- **WHEN** a terminal create runs with generic launch/switch defaults and shared base policy
- **THEN** the command applies configured launch/switch defaults
- **AND** independently resolves each selected repository's effective base from shared policy

#### Scenario: Editor-hosted invocation applies host-specific create defaults

- **WHEN** a supported editor-hosted create has matching editor defaults
- **THEN** the command applies host-specific switch and launch behavior
- **AND** branch ancestry remains governed by host-independent shared base policy

#### Scenario: CLI flags override corresponding configuration

- **WHEN** create receives explicit launch, switch, invocation-wide base, or repository-base flags
- **THEN** each explicit value overrides only its corresponding configured behavior under documented precedence

#### Scenario: Create-only defaults cannot own a base

- **WHEN** configuration places `baseBranch` under `defaults.create`
- **THEN** Arashi rejects the removed property before repository discovery, hooks, or Git mutation
- **AND** directs the user to root `baseBranch`, or to a repository override when repository-specific behavior is intended

#### Scenario: Remaining create defaults continue to work

- **WHEN** `defaults.create` contains supported switch, launch, editor, terminal, or disposition settings without `baseBranch`
- **THEN** Arashi normalizes and applies those settings under their existing precedence and safety boundaries

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

The system MUST preserve existing create behavior when shared/repository base policy and explicit base flags are absent, and editor-hosted invocations MUST fall back to no post-create defaults when no host-specific create defaults are configured.

#### Scenario: Terminal workspace has no create or base settings

- **WHEN** terminal create runs with no new create defaults or base policy
- **THEN** command behavior matches current explicit-flag-only behavior
- **AND** the configured parent retains the invoking parent branch as its start point
- **AND** configured children retain their detected-default resolver and fallback behavior

#### Scenario: Editor host has no matching create defaults

- **WHEN** editor-hosted create has no matching host defaults
- **THEN** it performs no post-create switch or launch unless explicitly requested
- **AND** shared base policy, when present, remains authoritative because it is host-independent

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

The system SHALL use the shared terminal-aware worktree launcher for post-create automatic launch behavior so cmux-managed invocations create and focus a cmux workspace at the newly created primary worktree. Explicit configured or CLI-selected `sesh` and `herdr` launch modes SHALL remain authoritative over automatic cmux detection.

#### Scenario: Explicit post-create launch uses cmux

- **WHEN** a user runs `arashi create <branch> --launch` from a cmux-managed terminal and worktree creation succeeds
- **THEN** Arashi creates and focuses a cmux workspace rooted at the newly created primary worktree
- **AND** the create result reports launch mode `cmux`

#### Scenario: Configured automatic post-create launch uses cmux

- **WHEN** the matching create-default scope sets canonical `launch` to `auto` and `arashi create <branch>` succeeds from a cmux-managed terminal
- **THEN** Arashi uses the same cmux workspace launch behavior as `arashi switch`

#### Scenario: Configured explicit launcher bypasses automatic cmux detection

- **WHEN** the matching create-default scope sets canonical `launch` to `sesh` or `herdr` and cmux-managed terminal evidence is present
- **THEN** Arashi invokes the configured explicit launcher instead of creating a cmux workspace

#### Scenario: Post-create cmux launch fails after worktree creation

- **WHEN** coordinated worktree creation succeeds but cmux workspace creation or response validation fails
- **THEN** Arashi preserves the created worktrees
- **AND** reports an actionable launch failure that distinguishes the completed worktree creation from the failed cmux launch
- **AND** does not fall back to standalone Ghostty

### Requirement: Implicit standalone create has no persisted command defaults

`arashi create` in implicit standalone mode SHALL resolve behavior from explicit invocation flags and built-in defaults without loading or persisting configured create/editor defaults or shared base policy. Explicit `--base` SHALL remain available as invocation-only ancestry input, while `--repo-base` SHALL be rejected.

#### Scenario: Standalone create has no explicit overrides

- **WHEN** a user runs create in implicit standalone mode with no explicit behavior or base flags
- **THEN** Arashi uses existing built-in standalone behavior and creates no config

#### Scenario: Standalone create receives explicit base

- **WHEN** standalone create receives `--base <branch>`
- **THEN** Arashi uses it only for that invocation

#### Scenario: Standalone create receives repository base

- **WHEN** standalone create receives `--repo-base <repository=branch>`
- **THEN** Arashi rejects the configured-workspace-only option before mutation

### Requirement: Support Herdr post-create launch selection

The system SHALL support Herdr as an explicit and configured post-create launch choice and SHALL build the Herdr launch candidate from the successfully created primary repository's source checkout and worktree metadata.

#### Scenario: Explicit create Herdr launch succeeds

- **WHEN** the user runs `arashi create <branch> --herdr` and coordinated worktree creation succeeds
- **THEN** `--herdr` implies post-create launch
- **AND** Arashi opens or focuses the primary created worktree through the shared Herdr launcher
- **AND** the create result reports launch mode `herdr`

#### Scenario: Generic launch auto-detects Herdr

- **WHEN** the user runs `arashi create <branch> --launch` from an environment where `HERDR_ENV` normalizes to `1`
- **THEN** Arashi uses the same automatic Herdr launch behavior as `arashi switch`

#### Scenario: Configured create launch uses Herdr

- **WHEN** generic or editor-scoped create defaults set canonical `launch` to `herdr`
- **THEN** Arashi uses Herdr after successful creation even when the invocation is outside a Herdr-managed pane

#### Scenario: Explicit create launchers conflict

- **WHEN** the user combines `--herdr` with `--sesh`
- **THEN** Arashi rejects the invocation before worktree creation and instructs the user to select one launcher

#### Scenario: Explicit Herdr takes precedence over launch opt-out

- **WHEN** the user combines `--herdr` with `--no-launch`
- **THEN** the explicit Herdr selection implies post-create launch in the same way as explicit sesh mode

#### Scenario: Launch opt-out suppresses configured Herdr

- **WHEN** create defaults configure canonical `launch` as `herdr` and the user passes `--no-launch` without explicit `--herdr`
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

The system SHALL reject resolved post-create launch combined with create JSON mode before any worktree mutation, consistent with existing interactive and launch restrictions, whether launch came from explicit CLI flags or the matching configured create-default scope.

#### Scenario: JSON create requests an explicit launcher

- **WHEN** the user invokes `arashi create <branch> --json` with `--launch`, `--sesh`, or `--herdr`
- **THEN** Arashi returns the existing structured unsupported-mode error before creating worktrees or launching a target

#### Scenario: JSON create resolves configured launch

- **WHEN** the user invokes `arashi create <branch> --json` and the matching create-default scope resolves canonical `launch` to `auto`, `sesh`, or `herdr`
- **THEN** Arashi returns one structured unsupported-mode error on stdout before creating worktrees or launching a target
- **AND** any accepted legacy migration diagnostic remains isolated to stderr or an established structured diagnostic surface

#### Scenario: JSON create resolves disabled launch

- **WHEN** the user invokes `arashi create <branch> --json` and launch resolves to `none`
- **THEN** Arashi may perform the existing non-interactive create operation
- **AND** stdout remains exactly one structured JSON document

### Requirement: Configure post-create launch with one canonical choice

The system SHALL expose `launch` as the single canonical post-create launch choice in `defaults.create` and every supported `defaults.editors.<host>.create` scope, SHALL accept `none`, `auto`, `sesh`, and `herdr`, and SHALL NOT advertise create-specific `launchMode` or `launch_mode` in generated schema, maintained examples, generated agent-readable exports, or skill guidance. `switch` SHALL remain an independent boolean, an absent `launch` SHALL preserve built-in no-launch behavior, and every launch mode other than `none` SHALL select the newly created primary worktree for post-create handling.

#### Scenario: Disabled launch is configured

- **WHEN** the matching create-default scope sets `launch` to `none`
- **THEN** Arashi does not launch a terminal, session, or editor context after successful creation
- **AND** still applies an independently configured or explicitly requested switch

#### Scenario: Automatic launch is configured

- **WHEN** the matching create-default scope sets `launch` to `auto`
- **THEN** Arashi uses the existing shared automatic launcher after successful creation
- **AND** selects the newly created primary worktree for post-create handling

#### Scenario: Explicit sesh launch is configured

- **WHEN** the matching create-default scope sets `launch` to `sesh`
- **THEN** Arashi invokes the existing sesh post-create behavior regardless of automatic context detection
- **AND** selects the newly created primary worktree for post-create handling

#### Scenario: Explicit Herdr launch is configured

- **WHEN** the matching create-default scope sets `launch` to `herdr`
- **THEN** Arashi invokes the existing Herdr post-create behavior regardless of whether the invocation began in a Herdr-managed pane
- **AND** selects the newly created primary worktree for post-create handling

#### Scenario: Launch choice is absent

- **WHEN** the matching terminal or editor-hosted create-default scope omits `launch`
- **THEN** Arashi preserves built-in no-launch behavior unless an explicit CLI launch flag is present

#### Scenario: Launch implies switch despite switch opt-out

- **WHEN** resolved launch is `auto`, `sesh`, or `herdr` and configured or explicit switch behavior is disabled
- **THEN** Arashi still selects the newly created primary worktree and performs the resolved launch

#### Scenario: Switch remains independent when launch is disabled

- **WHEN** resolved launch is `none` and configured or explicit switch behavior is enabled
- **THEN** Arashi performs post-create switch handling without launching a context

#### Scenario: Explicit launcher overrides configuration and generic launch flags

- **WHEN** the user passes `--sesh` or `--herdr` and matching create defaults select another launch mode, `--launch` is also present, or `--no-launch` is also present
- **THEN** the explicit launcher selects and implies launch for that invocation

#### Scenario: Explicit automatic launch overrides configuration

- **WHEN** the user passes `--launch` without an explicit launcher and matching create defaults select `none`, `sesh`, or `herdr`
- **THEN** Arashi uses automatic launch for that invocation

#### Scenario: Launch opt-out suppresses configured launch

- **WHEN** matching create defaults select `auto`, `sesh`, or `herdr` and the user passes `--no-launch` without `--sesh` or `--herdr`
- **THEN** Arashi resolves launch to `none` for that invocation

#### Scenario: Explicit create launchers conflict

- **WHEN** the user combines `--sesh` with `--herdr`
- **THEN** Arashi rejects the invocation before repository discovery, worktree creation, hooks, launch, or other workspace mutation
- **AND** instructs the user to choose exactly one launcher

#### Scenario: Terminal invocation uses only generic create defaults

- **WHEN** a terminal invocation has generic and editor-scoped create defaults
- **THEN** Arashi resolves `switch` and canonical `launch` only from `defaults.create`

#### Scenario: Editor-hosted invocation uses only its matching scope

- **WHEN** a supported editor-hosted invocation has generic and multiple editor-scoped create defaults
- **THEN** Arashi resolves `switch` and canonical `launch` only from `defaults.editors.<matching-host>.create`
- **AND** does not fall back to generic or another host's defaults when the matching scope is absent

#### Scenario: Canonical create schema is generated

- **WHEN** Arashi generates its configuration schema
- **THEN** `CreateCommandDefaults.launch` enumerates `none`, `auto`, `sesh`, and `herdr`
- **AND** `CreateCommandDefaults.switch` remains boolean
- **AND** create-specific `launchMode` and `launch_mode` are not canonical schema properties

#### Scenario: Unsupported canonical create default is rejected

- **WHEN** any terminal or supported editor create-default scope contains an unsupported `launch` value or a non-boolean `switch` value
- **THEN** Arashi rejects configuration with a scope-qualified actionable error before repository discovery, worktree creation, hooks, launch, or other workspace mutation

#### Scenario: User-facing create contracts agree

- **WHEN** Arashi publishes the simplified create launch model
- **THEN** CLI help and diagnostics, maintained CLI documentation, semantic command contracts, canonical documentation, generated agent-readable exports, and the Arashi skill package use the same launch vocabulary and migration rules
- **AND** none of those canonical surfaces instruct users to compose create `launch` with create-specific `launchMode`

### Requirement: Preserve post-create launcher execution and failure boundaries

The system SHALL translate canonical `auto`, `sesh`, and `herdr` create launch choices into the existing shared launcher only after successful worktree creation, SHALL preserve automatic detection order and launcher-specific validation/process contracts, SHALL pass paths and labels as distinct process arguments, and MUST NOT roll back successfully created worktrees when post-create launch fails.

#### Scenario: Canonical automatic launch uses existing detection

- **WHEN** resolved create launch is `auto` and worktree creation succeeds
- **THEN** Arashi applies the existing strict automatic tmux, Herdr, cmux, integrated IDE, terminal-application, and platform selection behavior in its established order

#### Scenario: Canonical explicit launcher does not fall through

- **WHEN** resolved create launch is `sesh` or `herdr` and that launcher's availability, validation, or process execution fails
- **THEN** Arashi reports the existing actionable launcher-specific failure
- **AND** does not invoke an automatically detected or generic fallback launcher

#### Scenario: Post-create launcher fails after creation

- **WHEN** worktree creation succeeds and the resolved automatic or explicit launcher subsequently fails
- **THEN** Arashi preserves every successfully created worktree
- **AND** distinguishes completed creation from failed launch in human or structured output

#### Scenario: Post-create launcher receives an unsafe-looking path

- **WHEN** the source checkout, created worktree path, repository name, or branch label contains spaces, quotes, or shell-significant characters
- **THEN** Arashi passes each complete value as a distinct process argument without shell interpolation

### Requirement: Normalize legacy create launch defaults without discarding intent

The system SHALL continue reading legacy boolean `launch` values plus create-specific `launchMode` and `launch_mode` during the compatibility window at generic and supported editor-hosted create scopes, SHALL normalize every representable combination to one canonical launch choice, SHALL emit scope-qualified diagnostics with the exact replacement for accepted legacy fields, and SHALL reject ambiguous, invalid, or conflicting values before workspace mutation. Migration diagnostics MUST NOT contaminate JSON stdout and normalization MUST NOT rewrite configuration files.

#### Scenario: Legacy enabled automatic launch is normalized

- **WHEN** a create-default scope sets legacy `launch` to `true` and omits the legacy launcher or sets it to `auto`
- **THEN** Arashi normalizes that scope to canonical `launch: "auto"`

#### Scenario: Legacy enabled explicit launcher is normalized

- **WHEN** a create-default scope sets legacy `launch` to `true` and sets the legacy launcher to `sesh` or `herdr`
- **THEN** Arashi normalizes that scope to the matching canonical explicit launch mode

#### Scenario: Legacy launcher without boolean launch is normalized

- **WHEN** a create-default scope omits legacy `launch` and sets the legacy launcher to `auto`, `sesh`, or `herdr`
- **THEN** Arashi preserves the existing implied-launch behavior by normalizing to the matching canonical launch mode

#### Scenario: Legacy disabled launch without launcher is normalized

- **WHEN** a create-default scope sets legacy `launch` to `false` and omits the legacy launcher
- **THEN** Arashi normalizes that scope to canonical `launch: "none"`

#### Scenario: Legacy disabled launch with launcher is rejected

- **WHEN** a create-default scope sets legacy `launch` to `false` and sets the legacy launcher to `auto`, `sesh`, or `herdr`
- **THEN** Arashi rejects configuration before workspace mutation
- **AND** the error names both configured values and instructs the user to choose canonical `launch: "none"` or the matching enabled launch mode
- **AND** Arashi neither silently enables the previously inert launcher nor silently discards it

#### Scenario: Equal legacy aliases collapse before mapping

- **WHEN** `launchMode` and `launch_mode` occur in the same create-default scope with equal valid values
- **THEN** Arashi treats them as one legacy launcher value and applies the ordinary mapping
- **AND** emits exactly one scope-qualified migration diagnostic when the mapping is accepted

#### Scenario: Conflicting legacy aliases are rejected

- **WHEN** `launchMode` and `launch_mode` occur in the same create-default scope with different values
- **THEN** Arashi rejects configuration with an actionable error naming the scope, both fields, and both values before applying mode mapping or mutating workspace state

#### Scenario: Canonical automatic launch with compatible legacy field is normalized

- **WHEN** canonical `launch` is `auto` and a legacy launcher field is also `auto`
- **THEN** Arashi preserves canonical `auto`
- **AND** emits one diagnostic identifying the redundant legacy field and exact canonical replacement

#### Scenario: Canonical explicit launch with compatible legacy field is normalized

- **WHEN** canonical `launch` is `sesh` or `herdr` and a legacy launcher field is `auto` or the same explicit launcher
- **THEN** Arashi preserves the canonical explicit launch mode
- **AND** emits one diagnostic identifying the redundant legacy field and exact canonical replacement

#### Scenario: Canonical disabled or automatic launch conflicts with explicit legacy launcher

- **WHEN** canonical `launch` is `none` with any legacy launcher, or canonical `launch` is `auto` with legacy `sesh` or `herdr`
- **THEN** Arashi rejects configuration with an actionable error naming both configured values and the single-field alternatives
- **AND** does not discover repositories, create worktrees, run hooks, launch, or otherwise mutate workspace state

#### Scenario: Canonical explicit launch conflicts with opposite legacy launcher

- **WHEN** canonical `launch` is `sesh` with legacy `herdr`, or canonical `launch` is `herdr` with legacy `sesh`
- **THEN** Arashi rejects configuration with an actionable error naming both values and the single-field alternatives before workspace mutation

#### Scenario: Invalid legacy create value is rejected

- **WHEN** a create-default scope contains a `launch` value that is neither a canonical string nor a legacy boolean, or a legacy launcher alias outside `auto`, `sesh`, and `herdr`
- **THEN** Arashi rejects configuration with a scope-qualified actionable error before workspace mutation

#### Scenario: Legacy diagnostics identify each affected scope

- **WHEN** generic and one or more editor-hosted create-default scopes contain accepted legacy fields
- **THEN** Arashi emits exactly one diagnostic per affected scope
- **AND** each diagnostic names its complete scope and exact canonical `launch` replacement

#### Scenario: Legacy diagnostic preserves machine output

- **WHEN** a machine-readable command loads configuration containing accepted legacy create fields
- **THEN** stdout remains the command's single structured document
- **AND** migration diagnostics are written only to stderr or an established structured diagnostic surface

#### Scenario: Compatibility normalization is non-persistent

- **WHEN** Arashi accepts and normalizes legacy create defaults in memory
- **THEN** the source configuration file remains byte-for-byte unchanged unless the user explicitly edits it

### Requirement: Create supports explicit plain tmux post-create launch

The system SHALL allow `arashi create <branch> --tmux` to imply post-create launch. Explicit tmux SHALL override `--no-launch`, configured create defaults, and automatic launcher detection for that invocation, while generic and editor-scoped create `launchMode` vocabularies SHALL remain unchanged.

#### Scenario: Explicit tmux creates then launches the primary worktree

- **WHEN** the user runs `arashi create <branch> --tmux` with active tmux evidence and creation succeeds
- **THEN** Arashi creates the requested worktrees and opens the resolved primary worktree using `tmux new-window -c <primary-worktree-path>`

#### Scenario: Explicit tmux overrides configured create launch mode

- **WHEN** the user runs create with `--tmux` and configured create defaults select `auto`, `sesh`, or `herdr`
- **THEN** Arashi uses plain tmux for post-create launch

#### Scenario: Explicit tmux overrides launch opt-out

- **WHEN** the user combines `--tmux` with `--no-launch`
- **THEN** the explicit tmux selection implies post-create launch in the same way as explicit sesh or Herdr mode

#### Scenario: Explicit tmux overrides switch opt-out

- **WHEN** the user combines `--tmux` with `--no-switch`
- **THEN** the explicit tmux selection still resolves the primary created worktree and launches it because post-create launch requires target selection

#### Scenario: Standalone create supports explicit tmux

- **WHEN** the user runs `arashi create <branch> --tmux` in a zero-config standalone repository inside tmux
- **THEN** Arashi creates the standalone worktree and opens that primary worktree in a new plain tmux window

#### Scenario: Tmux process failure preserves created worktrees

- **WHEN** tmux context preflight succeeds, worktree creation succeeds, and `tmux new-window` exits unsuccessfully
- **THEN** Arashi reports the launch failure without trying another launcher or rolling back successfully created worktrees

#### Scenario: Create launch configuration remains unchanged

- **WHEN** Arashi validates generic or editor-scoped create defaults
- **THEN** `launchMode` continues to accept only `auto`, `sesh`, and `herdr`
- **AND** configured `auto` continues to choose tmux contextually when post-create launch runs inside tmux

### Requirement: Create validates explicit tmux before mutation

The system SHALL reject conflicting create launch overrides and missing tmux context before creating worktrees when explicit plain tmux launch is selected.

#### Scenario: Explicit tmux outside tmux creates nothing

- **WHEN** the user runs `arashi create <branch> --tmux` without a non-empty `TMUX` value
- **THEN** Arashi returns an actionable tmux-context usage error before creating any worktree or running create hooks

#### Scenario: Tmux conflicts with another create launcher

- **WHEN** the user combines `--tmux` with `--sesh` or `--herdr`
- **THEN** Arashi reports the complete deterministic set of conflicting create launch overrides before repository mutation

### Requirement: Reuse Kitty-aware launch behavior after create

The system SHALL use the shared managed Kitty worktree-session launcher for resolved automatic post-create launch, SHALL report mode `kitty` on validated success, and SHALL keep explicit/configured `sesh` and `herdr` choices authoritative over automatic Kitty detection.

#### Scenario: Explicit automatic post-create launch uses Kitty

- **WHEN** a user runs `arashi create <branch> --launch` from a supported Kitty context and worktree creation succeeds
- **THEN** Arashi creates or reuses and focuses the managed Kitty session for the newly created primary worktree
- **AND** the create launch result reports mode `kitty`

#### Scenario: Configured automatic post-create launch uses Kitty

- **WHEN** the matching create-default scope sets canonical `launch` to `auto`, creation succeeds, and automatic precedence resolves to Kitty
- **THEN** Arashi uses the same managed Kitty identity, reuse, creation, validation, and failure contract as `arashi switch`

#### Scenario: Explicit or configured named launcher bypasses Kitty

- **WHEN** resolved create launch is explicit/configured `sesh` or `herdr` and Kitty environment evidence is present
- **THEN** Arashi invokes the named launcher instead of managed Kitty

#### Scenario: Post-create Kitty launch fails

- **WHEN** worktree creation succeeds but managed Kitty preflight, remote control, focus, launch, reconciliation, or validation fails
- **THEN** Arashi preserves every successfully created worktree
- **AND** reports completed creation separately from the actionable Kitty launch failure
- **AND** does not invoke another launcher or roll back Git worktrees

### Requirement: Support one-off post-create tab disposition

The system SHALL register `--tab` on `arashi create`, SHALL treat it as explicit CLI-only launch intent that implies post-create launch and switch handling, and SHALL pass disposition `tab` through coordinated and standalone post-create launch. It SHALL NOT add a persisted create-disposition field or alter canonical create launch values.

#### Scenario: Create help exposes tab disposition

- **WHEN** a user runs `arashi create --help`
- **THEN** help states that `--tab` implies launch and switch handling
- **AND** explains that unsupported launchers fail without silently opening a window

#### Scenario: Explicit create tab implies launch and switch

- **WHEN** the user runs `arashi create <branch> --tab`
- **THEN** resolved create defaults enable post-create launch and switch handling for that invocation
- **AND** the shared launcher receives disposition `tab`

#### Scenario: Explicit tab wins over negative create flags

- **WHEN** the user combines `--tab` with `--no-launch` or `--no-switch`
- **THEN** explicit tab intent still enables post-create launch and switch handling
- **AND** help and option-policy metadata document that compatibility and precedence

#### Scenario: Positive create launch flags are redundant with tab

- **WHEN** the user combines `--tab` with `--launch` or `--switch`
- **THEN** Arashi accepts the invocation without a conflict
- **AND** resolves one post-create launch with disposition `tab`

#### Scenario: Tab composes with create launcher flags

- **WHEN** the user combines `--tab` with one of `--tmux`, `--sesh`, or `--herdr`
- **THEN** existing launcher-selection conflict rules remain unchanged
- **AND** the selected launcher's normative tab or unsupported mapping applies

#### Scenario: Configured automatic launch receives explicit tab disposition

- **WHEN** matching create defaults enable `launch: "auto"` and the user passes `--tab`
- **THEN** Arashi preserves configured launch selection while applying tab disposition for that invocation

#### Scenario: Configuration vocabulary is unchanged

- **WHEN** schemas, types, normalization, or structured create configuration contracts are generated or validated
- **THEN** no launch-disposition field or `tab` create launch value is accepted or advertised
- **AND** configuration continues to accept only its existing canonical launch choices

#### Scenario: Standalone create has disposition parity

- **WHEN** `arashi create <branch> --tab` runs in implicit standalone mode
- **THEN** it uses the same launch support resolver and post-create failure semantics as configured mode
- **AND** does not create `.arashi` configuration

### Requirement: Validate post-create tab support at the correct mutation boundary

The system SHALL reject a knowably unsupported resolved tab launcher before managed-ignore reconciliation, branch or worktree creation, and hook execution. Preview-only dry runs SHALL validate deterministic option conflicts but SHALL NOT require runtime-only tab support.

#### Scenario: Unsupported automatic tab launcher is detected before coordinated creation

- **WHEN** configured create resolution and invocation environment select a launcher without tab support and `--tab` is present
- **THEN** Arashi returns `TAB_DISPOSITION_UNSUPPORTED` before changing managed-ignore state, creating branches/worktrees, or running hooks

#### Scenario: Unsupported tab launcher is detected before standalone creation

- **WHEN** standalone create resolution selects a launcher without tab support and `--tab` is present
- **THEN** Arashi returns `TAB_DISPOSITION_UNSUPPORTED`
- **AND** creates no branch, worktree, or Arashi configuration

#### Scenario: Dry-run previews tab intent without runtime preflight

- **WHEN** the user runs `arashi create <branch> --dry-run --tab` with otherwise valid options
- **THEN** Arashi reports the planned launch disposition without requiring runtime-only launcher evidence
- **AND** creates no branch, worktree, managed-ignore change, or hook outcome

#### Scenario: Supported tab launch fails after create

- **WHEN** tab support preflight succeeds, worktree creation completes, and the selected tab-capable launch process then fails
- **THEN** Arashi preserves every successfully created worktree
- **AND** reports actionable post-create launch failure without trying a window or another launcher

### Requirement: Preserve structured create rejection for tab disposition

The system SHALL classify `create --json --tab` as the existing unsupported interactive-or-launch JSON mode at both the Commander action and exported executor before launcher conflicts, configured default resolution that can mutate, or create operations.

#### Scenario: CLI JSON and tab are combined

- **WHEN** a user invokes `arashi create <branch> --json --tab` with or without another conflicting launcher
- **THEN** stdout contains exactly one existing `JSON_UNSUPPORTED_FOR_MODE` envelope with mode `interactive-or-launch`
- **AND** the process uses the existing create JSON error exit code

#### Scenario: Direct executor JSON and tab are combined

- **WHEN** a caller invokes the exported create executor with `json: true` and `tab: true`
- **THEN** the executor returns the existing numeric JSON error result
- **AND** performs no discovery that mutates, managed-ignore reconciliation, branch/worktree creation, hooks, or launch
