## ADDED Requirements

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
