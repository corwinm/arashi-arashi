## ADDED Requirements

### Requirement: Canonical hook guidance publishes the normative lifecycle matrix
The documentation SHALL provide one discoverable hooks workflow that distinguishes configured and standalone modes and defines each supported lifecycle's discovery locations, platform extensions, invocation multiplicity, mutation timing, cwd, environment context, timeout, failure/rollback/finalization behavior, and human/JSON outcome semantics.

#### Scenario: User compares configured create scopes
- **WHEN** a user reads create-hook guidance
- **THEN** it distinguishes workspace pre/post hooks from repository-specific pre/post hooks
- **AND** accurately states that `pre-create.<repo>` runs after that repository worktree is materialized

#### Scenario: User compares standalone scopes
- **WHEN** a user reads standalone hook guidance
- **THEN** it documents targeted and shared user-global create/remove hooks
- **AND** states that configless repository-local/workspace hooks remain inactive

#### Scenario: User develops Windows hooks
- **WHEN** a Windows user reads lifecycle guidance
- **THEN** it documents supported native extensions, activation commands, ambiguity failure, and absence of implicit Bash execution

### Requirement: Hook environment guidance is scope-correct
Canonical documentation SHALL publish a scope-aware environment table separating common executor metadata, configured create targets, standalone targets, per-target remove scalars, and structured aggregate remove context. It MUST use `ARASHI_BRANCH_NAME` and MUST NOT advertise `ARASHI_BRANCH` or `ARASHI_BASE_BRANCH` as runtime values.

#### Scenario: User writes a workspace create hook
- **WHEN** a user follows the workspace pre/post-create example
- **THEN** the script uses only context available to one workspace-level invocation
- **AND** does not branch on a child repository or require one child worktree path

#### Scenario: User writes a multi-target remove hook
- **WHEN** a user needs command-wide remove cleanup
- **THEN** guidance uses `ARASHI_REMOVE_TARGETS_JSON`
- **AND** labels comma-separated compatibility aggregates as lossy and non-canonical

### Requirement: Hook activation and setup examples are safe and executable
Documentation SHALL show one-to-one lifecycle example activation, explicit POSIX executable mode, native Windows lifecycle activation, and the POSIX `.arashi/setup.sh.example` setup path. It SHALL state that this change does not introduce a native Windows setup example and SHALL NOT recommend copying multiple examples to one filename or setting Git `core.hooksPath` to the Arashi lifecycle directory.

#### Scenario: POSIX user activates one hook
- **WHEN** a POSIX user copies the documented command verbatim
- **THEN** exactly one chosen example becomes an executable active hook

#### Scenario: User activates setup
- **WHEN** a POSIX user follows setup-example guidance
- **THEN** `.arashi/setup.sh.example` becomes `.arashi/setup.sh`
- **AND** guidance relies on setup cwd rather than lifecycle-hook variables

### Requirement: Recommended setup code follows repository package provenance
Node setup examples SHALL instruct users to follow the committed `packageManager` and lockfile rather than infer npm from `package.json`. Coordinated pnpm examples SHALL set `CI=true` with syntax native to the documented shell, use pinned Corepack pnpm, and avoid selecting an ancestor workspace; Python examples SHALL bind pip to the activated interpreter.

#### Scenario: Coordinated pnpm child is provisioned
- **WHEN** a pnpm child worktree is nested beneath a different ancestor pnpm workspace
- **THEN** the recommended hook sets `CI=true` using native syntax and runs `corepack pnpm --ignore-workspace install --frozen-lockfile`
- **AND** POSIX, PowerShell, and command-script examples use their own environment-assignment forms

#### Scenario: Python virtual environment is provisioned
- **WHEN** a pip-based example installs requirements
- **THEN** it creates/activates the virtual environment and invokes `python -m pip`

### Requirement: Canonical and generated hook guidance remain semantically identical
Hook aliases, lifecycle timing, activation, timeout, platform, package-manager, and failure claims SHALL be checked from canonical docs through generated Markdown/LLM exports rather than maintained as unaudited prose copies.

#### Scenario: Canonical hook guidance changes
- **WHEN** hook guidance is updated
- **THEN** generated routes and `llms-full.txt` are regenerated from canonical sources
- **AND** focused freshness/semantic checks reject stale aliases or behavior claims
