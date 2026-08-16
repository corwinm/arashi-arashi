# scoped-lifecycle-hooks Specification

## Purpose
TBD - created by archiving change expand-hooks-scope-and-options. Update Purpose after archive.
## Requirements
### Requirement: Multi-scope lifecycle hook discovery
For configured remove lifecycles, the system SHALL discover scripts for a target repository from repository-local (`repos/<repo>/.arashi/hooks/<lifecycle><ext>`), workspace-root (`.arashi/hooks/<lifecycle><ext>`), and user-global shared/targeted locations. Configured create instead SHALL use the workspace and repository-specific filename contract defined by `lifecycle-hook-contracts`; it SHALL NOT silently activate repository-local or user-global policy. Supported `<ext>` values SHALL be `.sh` on POSIX and `.ps1`, `.cmd`, or `.bat` on Windows. More than one supported candidate for one logical lifecycle/location MUST be treated as a pre-mutation configuration error.

#### Scenario: Remove hooks are present in multiple scopes
- **WHEN** a configured remove lifecycle is triggered for repository `<repo>` and one supported script exists in repository-local, workspace-root, and user-global paths
- **THEN** the system includes all discovered scripts in the lifecycle execution plan

#### Scenario: Some remove scopes do not define a hook
- **WHEN** a configured remove lifecycle is triggered and one or more scope paths do not contain a platform-supported lifecycle script
- **THEN** the system skips missing scripts without failing solely because they are absent

#### Scenario: Configured create has similarly named scripts in inactive scopes
- **WHEN** a configured create lifecycle finds repository-local or user-global scripts that are not part of its workspace/repository-specific filename contract
- **THEN** Arashi does not execute those scripts
- **AND** does not imply that configured create and configured remove share discovery locations

#### Scenario: One location is ambiguous
- **WHEN** a lifecycle location contains multiple extensions supported on the current platform
- **THEN** discovery fails before lifecycle mutation and reports all candidates

### Requirement: Deterministic execution order across scopes
The system MUST execute lifecycle hooks in deterministic order by scope: repository-local first, workspace-root second, and user-global last.

#### Scenario: Scope ordering is enforced
- **WHEN** lifecycle scripts are discovered in all three scopes
- **THEN** execution occurs in the exact order repository-local, workspace-root, user-global

### Requirement: Scope-specific working directory behavior
The system SHALL expose the exact normalized cwd as `ARASHI_HOOK_EXECUTION_PATH`. For configured remove, repository-local, global-repository, and global-shared hooks SHALL run from the current target repository's configured source checkout, while workspace hooks SHALL run from the configured workspace root. For every standalone pre/post-create and pre/post-remove global hook, cwd SHALL be the resolved standalone main repository root. Configured create cwd behavior SHALL follow `lifecycle-hook-contracts`.

#### Scenario: Repository-local remove hook runs in target repository
- **WHEN** a repository-local remove lifecycle script executes
- **THEN** its cwd and `ARASHI_HOOK_EXECUTION_PATH` are the target repository path

#### Scenario: Workspace-root hook runs in workspace root
- **WHEN** a configured workspace-root remove script executes
- **THEN** its cwd and execution-path context are the configured workspace root

#### Scenario: Configured user-global remove hook runs in source checkout
- **WHEN** a configured user-global remove hook executes for repository `<repo>`
- **THEN** its cwd and execution-path context are `<repo>`'s configured source checkout

#### Scenario: Standalone global hook runs in main root
- **WHEN** a standalone pre-create, post-create, pre-remove, or post-remove global hook executes
- **THEN** its cwd and execution-path context are the resolved standalone main repository root

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
For each configured remove target, `repos.<name>.hooks.pre-remove|post-remove` SHALL provide the inline alternative for the existing repository-local logical location and root `hooks.scripts.pre-remove|post-remove` SHALL provide the inline alternative for the existing workspace logical location. User-global targeted and shared locations SHALL remain file-only. Resolver output SHALL retain exact target selection order and repository → workspace → global-repository → global-shared scope order, with one evaluated location per scope and lifecycle rather than appending inline execution as an extra scope.

#### Scenario: Repository and workspace inline hooks compose with global files
- **WHEN** a configured target defines repository and workspace inline remove hooks and user-global file hooks exist
- **THEN** the plan orders repository inline, workspace inline, global-targeted file, then global-shared file
- **AND** each logical location contributes at most one source

#### Scenario: Inline source replaces only its logical file alternative
- **WHEN** a repository inline hook exists without its corresponding repository-local file
- **THEN** the resolver selects the inline source for repository scope
- **AND** does not suppress workspace or user-global locations

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

