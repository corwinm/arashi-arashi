## MODIFIED Requirements

### Requirement: Resolve create defaults from configuration and CLI
The system SHALL resolve `arashi create` execution behavior from CLI flags, invocation context, and workspace configuration using deterministic precedence. Generic `defaults.create.baseBranch` SHALL select the logical base branch for configured create, and explicit `--base <branch>` SHALL override that configured value. Editor-scoped create defaults SHALL continue to control only switch and launch behavior and SHALL NOT expose or override base-branch topology.

#### Scenario: Terminal invocation applies generic create defaults
- **WHEN** the user runs `arashi create <branch>` from a terminal context and workspace config defines generic create defaults
- **THEN** the command applies those configured defaults for switch, launch, and base-branch behavior

#### Scenario: Editor-hosted invocation applies host-specific create defaults
- **WHEN** the user runs `arashi create <branch>` from a supported editor host and workspace config defines create defaults for that host
- **THEN** the command applies the matching host-specific defaults for switch and launch behavior
- **AND** uses only generic `defaults.create.baseBranch` for configured base-branch behavior

#### Scenario: CLI flags override configured defaults
- **WHEN** the user runs `arashi create <branch>` with explicit flags for switch, shell/editor launch, or base branch
- **THEN** the command uses explicit CLI values instead of the corresponding configured defaults

#### Scenario: Explicit base overrides configured base
- **WHEN** `defaults.create.baseBranch` is `feature/FEAT-1234` and the user passes `--base release/next`
- **THEN** every newly created selected target branch starts from its repository-local resolution of `release/next`

#### Scenario: Configured base is invalid
- **WHEN** `defaults.create.baseBranch` is non-string, empty, whitespace-only, or not a valid Git branch name
- **THEN** configuration validation fails with an error naming `defaults.create.baseBranch`
- **AND** repository discovery, hook preflight/execution, managed-ignore reconciliation, and Git mutation do not run

#### Scenario: Editor scope cannot change the base
- **WHEN** configuration places `baseBranch` under `defaults.editors.<host>.create`
- **THEN** configuration validation rejects that unsupported field with its exact path

### Requirement: Preserve current behavior when defaults are absent
The system MUST preserve existing create behavior when `defaults.create.baseBranch` and explicit `--base` are absent, and editor-hosted invocations MUST fall back to no post-create defaults when no host-specific create defaults are configured.

#### Scenario: Terminal workspace has no create default settings
- **WHEN** the user runs `arashi create <branch>` from a terminal context in a workspace with no new create defaults configured
- **THEN** command behavior matches current explicit-flag-only behavior
- **AND** the configured parent retains the invoking parent branch as its start point
- **AND** configured children retain their existing detected-default start-point resolver and fallback behavior

#### Scenario: Editor host has no matching create defaults
- **WHEN** the user runs `arashi create <branch>` from a supported editor host and the workspace does not define create defaults for that host
- **THEN** the command does not apply generic launch/switch defaults and does not perform post-create switch or launch behavior unless explicitly requested by CLI flags
- **AND** generic `defaults.create.baseBranch`, when present, remains authoritative because it is not editor-scoped

### Requirement: Implicit standalone create has no persisted command defaults
`arashi create` in implicit standalone mode SHALL resolve behavior from explicit invocation flags and existing built-in defaults without loading or persisting configured create/editor defaults. Explicit `--base` SHALL remain available as invocation-only branch ancestry input.

#### Scenario: Standalone create has no explicit overrides
- **WHEN** a user runs create in implicit standalone mode without base, launch, or switch overrides
- **THEN** Arashi applies existing built-in command behavior
- **AND** a new target retains its existing current-HEAD start point
- **AND** does not infer defaults from another worktree, user-global state, or synthesized configuration

#### Scenario: Standalone create has explicit overrides
- **WHEN** the user supplies supported base, launch, or switch flags
- **THEN** those flags control the invocation under existing precedence rules
- **AND** no command-default configuration is written

#### Scenario: Configured defaults exist
- **WHEN** a valid configured workspace provides create or editor defaults
- **THEN** existing configured default resolution remains authoritative despite a root `.worktrees/` directory
