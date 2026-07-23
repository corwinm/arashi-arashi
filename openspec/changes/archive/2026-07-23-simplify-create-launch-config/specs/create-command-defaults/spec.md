## ADDED Requirements

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

## MODIFIED Requirements

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
