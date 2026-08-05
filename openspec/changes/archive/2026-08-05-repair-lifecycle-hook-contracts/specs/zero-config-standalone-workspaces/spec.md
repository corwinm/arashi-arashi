## MODIFIED Requirements

### Requirement: Standalone lifecycle hooks preserve global policy
Standalone create and remove lifecycles SHALL execute applicable platform-native shared and repository-targeted user-global hooks while treating repository-local and workspace-root hook scopes as configured-mode capabilities. Hook context, common timeout, complete outcome, and applicable create rollback/remove finalization behavior SHALL match the normative lifecycle contract.

#### Scenario: Shared user-global hook exists
- **WHEN** a standalone create or remove lifecycle has exactly one supported `~/.arashi/hooks/<lifecycle><ext>`
- **THEN** Arashi executes the hook at the documented lifecycle point with authoritative standalone, source, cwd, and target context

#### Scenario: Repository-targeted user-global hook exists
- **WHEN** `~/.arashi/hooks/<main-root-basename>/<lifecycle><ext>` exists for the current platform
- **THEN** Arashi applies it to that repository before any shared user-global hook

#### Scenario: Local hook directories exist without configuration
- **WHEN** a configless repository contains repository-root `.arashi/hooks` content but no `.arashi/config.json`
- **THEN** zero-config mode does not activate repository-local or workspace-root hooks
- **AND** recommends configured mode when those scopes are required

#### Scenario: Standalone pre-create fails
- **WHEN** an applicable user-global standalone pre-create hook fails or times out
- **THEN** Arashi creates no branch or worktree
- **AND** reports the hook outcome with no implicit configuration mutation

#### Scenario: Standalone post-create fails
- **WHEN** an applicable user-global standalone post-create hook fails after worktree creation
- **THEN** Arashi applies the documented create rollback boundary
- **AND** reports the hook and rollback outcomes

#### Scenario: Standalone pre-remove hook fails
- **WHEN** any applicable user-global pre-remove hook fails or times out
- **THEN** Arashi aborts worktree removal and branch deletion

#### Scenario: Standalone post-remove hook fails
- **WHEN** an applicable user-global post-remove hook fails after removal attempts
- **THEN** Arashi preserves finalization and nonzero-result behavior

#### Scenario: Native hook location is ambiguous
- **WHEN** a standalone global location contains multiple extensions supported on the current platform
- **THEN** Arashi fails before lifecycle mutation and identifies the conflict
