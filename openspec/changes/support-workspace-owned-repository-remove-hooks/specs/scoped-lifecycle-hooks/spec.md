## MODIFIED Requirements

### Requirement: Multi-scope lifecycle hook discovery

For configured remove lifecycles, the system SHALL discover repository-scope scripts for target `<repo>` from workspace-owned `.arashi/hooks/<lifecycle>.<repo><ext>` and compatible repository-local `repos/<repo>/.arashi/hooks/<lifecycle><ext>` candidates, workspace scope from `.arashi/hooks/<lifecycle><ext>`, and user-global shared/targeted scopes from their established paths. Configured create SHALL retain its workspace and repository-specific filename contract and SHALL NOT silently activate repository-local or user-global policy. Supported `<ext>` values SHALL be `.sh` on POSIX and `.ps1`, `.cmd`, or `.bat` on Windows. More than one supported native candidate or source for one logical lifecycle/location MUST be a pre-mutation configuration error.

#### Scenario: Remove hooks are present in multiple scopes

- **WHEN** a configured remove lifecycle is triggered for `<repo>` with one repository source plus workspace and user-global sources
- **THEN** the system includes all selected sources in the lifecycle execution plan

#### Scenario: Qualified workspace repository file is present

- **WHEN** `.arashi/hooks/<lifecycle>.<repo><ext>` is the only repository claim
- **THEN** it occupies repository scope rather than workspace scope

#### Scenario: Some remove scopes do not define a hook

- **WHEN** one or more scope locations contain no supported source
- **THEN** the system skips missing locations without failing solely because they are absent

#### Scenario: Configured create has similarly named scripts in inactive scopes

- **WHEN** configured create finds repository-local or user-global scripts outside its filename contract
- **THEN** Arashi does not execute those scripts
- **AND** does not imply configured create and remove share every discovery location

#### Scenario: One location is ambiguous

- **WHEN** a lifecycle location has multiple supported extensions or repository scope is claimed by both workspace-owned and repository-local files
- **THEN** discovery fails before lifecycle mutation and reports all native candidates

### Requirement: Scope-specific working directory behavior

The system SHALL expose exact normalized cwd as `ARASHI_HOOK_EXECUTION_PATH`. For configured remove, repository-scope hooks—whether stored under the workspace root or target repository—plus global-repository and global-shared hooks SHALL run from the current target repository's configured source checkout; workspace hooks SHALL run from the configured workspace root. Standalone global hooks SHALL run from the resolved main root. Configured create cwd SHALL follow `lifecycle-hook-contracts`.

#### Scenario: Workspace-owned repository remove hook runs in target repository

- **WHEN** `.arashi/hooks/pre-remove.<repo><ext>` executes
- **THEN** cwd and `ARASHI_HOOK_EXECUTION_PATH` are `<repo>`'s configured source checkout
- **AND** `ARASHI_HOOK_SOURCE_PATH` identifies the qualified workspace file

#### Scenario: Repository-local remove hook runs in target repository

- **WHEN** a compatible repository-local remove script executes
- **THEN** its cwd and execution path remain the target repository path

#### Scenario: Workspace-root hook runs in workspace root

- **WHEN** a configured workspace-scope remove script executes
- **THEN** its cwd and execution path are the configured workspace root

#### Scenario: Configured user-global remove hook runs in source checkout

- **WHEN** a configured user-global remove hook executes for `<repo>`
- **THEN** its cwd and execution path are `<repo>`'s configured source checkout

#### Scenario: Standalone global hook runs in main root

- **WHEN** a standalone create or remove global hook executes
- **THEN** its cwd and execution path are the resolved standalone main root

### Requirement: Configured remove locations accept scope-owned inline alternatives

For each configured remove target, `repos.<name>.hooks.pre-remove|post-remove` SHALL be the inline alternative for the repository logical location claimed by either workspace-owned repository-specific or compatible repository-local native files. Root `hooks.scripts.pre-remove|post-remove` SHALL remain the inline alternative for workspace scope. User-global targeted and shared locations SHALL remain file-only. Resolver output SHALL retain target order and repository → workspace → global-repository → global-shared scope order, with at most one selected source per scope and lifecycle.

#### Scenario: Repository and workspace inline hooks compose with global files

- **WHEN** a target defines repository and workspace inline hooks and user-global files exist
- **THEN** the plan orders repository inline, workspace inline, global-targeted file, then global-shared file
- **AND** each logical location contributes at most one source

#### Scenario: Inline source replaces only its logical file alternative

- **WHEN** repository inline exists without either repository native file form
- **THEN** the resolver selects inline for repository scope
- **AND** does not suppress workspace or user-global locations

#### Scenario: Inline conflicts with a qualified workspace repository file

- **WHEN** `repos.<name>.hooks.pre-remove` and `.arashi/hooks/pre-remove.<name><ext>` both exist
- **THEN** preflight rejects the repository location before execution or removal mutation
