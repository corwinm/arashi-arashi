## ADDED Requirements

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
