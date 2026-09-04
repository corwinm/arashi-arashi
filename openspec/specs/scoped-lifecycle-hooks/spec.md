# scoped-lifecycle-hooks Specification

## Purpose
TBD - created by archiving change expand-hooks-scope-and-options. Update Purpose after archive.
## Requirements
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

### Requirement: Deterministic execution order across scopes

The system MUST execute configured remove lifecycle hooks in deterministic logical-scope order: repository first, workspace second, global-targeted third, and global-shared last. Storage does not determine scope: a workspace-owned qualified repository file occupies the repository slot, and the compatible repository-local file is an alias for that same slot.

#### Scenario: Scope ordering is enforced

- **WHEN** configured remove lifecycle sources are discovered in all four logical scopes
- **THEN** execution occurs in the exact order repository, workspace, global-targeted, global-shared
- **AND** the repository source executes once whether it is inline, workspace-owned qualified, or compatible repository-local

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

### Requirement: Zero-config standalone lifecycles use only user-global hook scopes
When a lifecycle runs in an implicit standalone workspace, Arashi SHALL discover platform-supported shared and repository-targeted user-global hooks and SHALL NOT activate repository-local or workspace-root `.arashi/hooks` scopes without configured workspace state.

#### Scenario: Standalone lifecycle has user-global hooks
- **WHEN** a supported standalone create or remove lifecycle has matching shared or repository-targeted native scripts
- **THEN** Arashi includes those scripts in the lifecycle plan
- **AND** preserves targeted-before-shared ordering within global scope

#### Scenario: Configless repository has local hook content
- **WHEN** a configless standalone repository contains `.arashi/hooks/<lifecycle><ext>` but no `.arashi/config.json`
- **THEN** Arashi does not treat that script as active repository-local or workspace-root policy
- **AND** user-global hook discovery remains available

#### Scenario: User-global hook working directory
- **WHEN** a user-global hook executes for an implicit standalone repository
- **THEN** its cwd and execution-path context are the resolved main repository root for every supported create/remove lifecycle
- **AND** hook context identifies standalone mode and the exact target

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

### Requirement: Configured remove inline cwd and target multiplicity match file scopes
Repository-owned inline remove hooks SHALL run from the current target repository's configured source checkout; workspace inline remove hooks SHALL run from the configured workspace root. Both SHALL receive the same target-consistent context as their file alternatives and SHALL be evaluated once per target repository. Inline ownership MUST NOT change workspace-hook multiplicity to once per command.

#### Scenario: Workspace inline remove runs for two targets
- **WHEN** configured remove targets two repositories and root inline `pre-remove` is active
- **THEN** it executes twice from the workspace root, once with each target's context
- **AND** neither invocation borrows scalar values from the other target

#### Scenario: Repository inline remove uses source checkout
- **WHEN** repository-owned inline `post-remove` executes for a target
- **THEN** cwd and `ARASHI_HOOK_EXECUTION_PATH` identify that repository's configured source checkout
- **AND** target metadata identifies the same repository

### Requirement: Standalone scope exclusions remain unchanged
Implicit standalone create/remove SHALL continue to evaluate only targeted and shared user-global file locations. Root `hooks.scripts`, repository inline values, and configless repository-local `.arashi/hooks` SHALL remain inactive without valid configured workspace state.

#### Scenario: Configless local content exists
- **WHEN** standalone mode encounters config-shaped inline content or repository-local files without valid configured state
- **THEN** neither is activated
- **AND** established user-global targeted-before-shared discovery remains available

