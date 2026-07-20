## ADDED Requirements

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
