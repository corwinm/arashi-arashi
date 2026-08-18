# managed-git-ignore-reconciliation Specification

## Purpose
Define safe, Git-native reconciliation of ignore coverage for configured workspace directories across Arashi lifecycle commands, including scope selection, diagnostics, transactions, rollback, and machine-readable reporting.
## Requirements
### Requirement: Arashi resolves effective managed ignore state through Git
The system SHALL inspect Git's effective ignore rules for each safe configured managed path before planning or applying any ignore-file change, SHALL support ignore files with platform-native LF or CRLF line endings, and MUST accept provenance only from a complete, unambiguous Git result.

#### Scenario: Existing tracked rule applies
- **WHEN** a configured managed path is already ignored by a tracked Git ignore rule
- **THEN** Arashi reports the path as already ignored
- **AND** Arashi does not add a repository-local or duplicate tracked rule

#### Scenario: Existing repository-local rule applies
- **WHEN** a configured managed path is already ignored by the common repository's local exclude file
- **THEN** Arashi preserves the existing rule without duplication

#### Scenario: Existing global rule applies
- **WHEN** Git reports that a configured managed path is ignored through the user's existing global excludes file
- **THEN** Arashi honors the effective rule
- **AND** Arashi does not create or modify global Git configuration

#### Scenario: Tracked ignore file uses CRLF
- **WHEN** Git resolves an effective rule from a tracked `.gitignore` checked out with CRLF line endings
- **THEN** Arashi reports the effective tracked source normally
- **AND** initialization does not require the user to rewrite the file to LF

#### Scenario: Primary provenance payload is unusable
- **WHEN** the primary Git provenance query exits successfully but does not return one complete unambiguous source record
- **THEN** Arashi performs one independent Git-authoritative provenance query for the same managed path
- **AND** uses the recovered source only when that query returns one complete unambiguous record

#### Scenario: Provenance recovery is also unusable
- **WHEN** neither the primary nor recovery Git query yields one complete unambiguous source record
- **THEN** Arashi fails managed-ignore inspection before applying ignore-file changes
- **AND** reports actionable diagnostics for the primary parse failure and recovery outcome
- **AND** does not guess provenance from ignore-file contents

#### Scenario: Primary query reports no effective rule
- **WHEN** the primary Git provenance query reports the managed path is not ignored
- **THEN** Arashi reports the path as unignored
- **AND** does not invoke malformed-output recovery

#### Scenario: Primary query fails fatally
- **WHEN** the primary Git provenance query cannot start or exits with a fatal Git error
- **THEN** Arashi reports that failure
- **AND** does not replace it with malformed-output recovery

### Requirement: Configured workspaces support clone-local ignore scope preferences
The system SHALL support `local`, `tracked`, and `none` ignore scopes for configured workspaces, SHALL default to `local`, and SHALL keep explicit non-default preferences out of shared `.arashi/config.json`.

#### Scenario: Init uses the local default
- **WHEN** a user initializes a new workspace without an explicit ignore scope and no valid stored preference exists
- **THEN** Arashi writes the missing normalized rule to the repository-local exclude file resolved through Git
- **AND** Arashi does not modify tracked `.gitignore`

#### Scenario: Stored preference applies when no option is supplied
- **WHEN** a valid clone-local ignore preference exists and a lifecycle command or forced init supplies no explicit scope
- **THEN** Arashi uses the stored preference instead of the built-in local default

#### Scenario: Explicit scope overrides stored preference
- **WHEN** `arashi init` receives an explicit valid ignore scope and a different valid preference is stored
- **THEN** Arashi uses the explicit scope for reconciliation and updates clone-local preference state accordingly

#### Scenario: Existing workspace resets to local scope
- **WHEN** a user runs `arashi init --ignore-scope local` in an existing valid configured workspace without other initialization changes
- **THEN** Arashi removes the non-default clone-local preference and reconciles current managed paths
- **AND** Arashi does not require `--force` or recreate workspace configuration, hooks, or repositories

#### Scenario: User opts into tracked rules
- **WHEN** a user runs `arashi init --ignore-scope tracked`
- **THEN** Arashi persists the explicit preference in clone-local Git state
- **AND** missing safe managed-path rules are written to the workspace-root `.gitignore`

#### Scenario: User opts out of ignore management
- **WHEN** a user runs `arashi init --ignore-scope none`
- **THEN** Arashi persists the explicit preference in clone-local Git state
- **AND** Arashi does not modify tracked, repository-local, or global ignore files
- **AND** Arashi reports any safe managed path that remains unignored

#### Scenario: User restores the local default
- **WHEN** a user selects `local` after previously selecting a non-default scope
- **THEN** Arashi removes the clone-local non-default preference
- **AND** later lifecycle commands resolve scope as `local`

#### Scenario: Stored preference is invalid
- **WHEN** clone-local Git state contains an unsupported Arashi ignore-scope value
- **THEN** Arashi reports a configuration error with repair guidance
- **AND** Arashi does not guess a mutating scope

### Requirement: Managed ignore writes are limited to safe repository-relative subdirectories
The system MUST normalize and deduplicate configured managed paths and MUST NOT automatically write ignore rules for repository root, absolute paths, or parent traversal.

#### Scenario: Safe managed subdirectories are normalized
- **WHEN** configured `reposDir` or `worktreesDir` identifies a repository-relative subdirectory with optional separator or trailing-slash variants
- **THEN** Arashi derives one normalized directory ignore rule

#### Scenario: Managed paths overlap
- **WHEN** configured repository and worktree paths normalize to the same ignore rule or one candidate is repeated
- **THEN** Arashi plans at most one write for the equivalent rule

#### Scenario: Unsafe path is configured
- **WHEN** a managed path resolves to `.`, repository root, an absolute location, or parent traversal
- **THEN** Arashi does not write the path to tracked or repository-local ignore files
- **AND** Arashi reports the path as an unsafe automatic-ignore skip

### Requirement: Arashi modifies only owned managed-ignore entries
The system SHALL delimit ignore rules it writes as Arashi-managed content and SHALL NOT remove or rewrite equivalent user-authored rules outside that owned content.

#### Scenario: Configured path changes
- **WHEN** an entry in the active writable Arashi-managed block no longer corresponds to a current safe configured path
- **THEN** lifecycle reconciliation removes the stale owned entry
- **AND** preserves unrelated ignore-file content

#### Scenario: Equivalent user-authored rule exists
- **WHEN** an effective rule outside the Arashi-managed block covers a current or obsolete managed path
- **THEN** Arashi preserves the user-authored rule unchanged

#### Scenario: None scope has stale owned entries
- **WHEN** scope is `none` and an Arashi-managed block contains an obsolete entry
- **THEN** Arashi reports the stale owned entry
- **AND** does not remove or rewrite it

### Requirement: Lifecycle commands reconcile managed ignore state before materialization
The system SHALL use shared managed-ignore reconciliation in configured `init`, `pull`, `clone`, `add`, and `create` workflows.

#### Scenario: Init prepares managed paths
- **WHEN** standard configured initialization resolves repository and worktree directories
- **THEN** Arashi reconciles safe ignore rules before creating managed directories

#### Scenario: Pull receives changed workspace paths
- **WHEN** selected `arashi pull` updates the parent repository and the resulting configuration changes `reposDir` or `worktreesDir`
- **THEN** Arashi reloads the pulled configuration in the same invocation
- **AND** Arashi reconciles the resulting safe managed paths before continuing selected child repository operations

#### Scenario: Pull filter excludes the parent
- **WHEN** `--only` or `--group` selection excludes the parent repository
- **THEN** Arashi does not pull the parent solely for reconciliation
- **AND** selected children and ignore reconciliation use the pre-pull configuration snapshot

#### Scenario: Pull filter is reevaluated after parent update
- **WHEN** a selected parent pull succeeds and configuration changes repository names or groups
- **THEN** Arashi reapplies the original filters to the post-pull configuration before child pulls
- **AND** an original filter that no longer resolves causes a structured failure before remaining child pulls

#### Scenario: Parent pull fails and rolls back
- **WHEN** the selected parent pull fails and restores its original state
- **THEN** remaining selected child pulls use the pre-pull configuration snapshot
- **AND** reconciliation required only by an abandoned config state is restored

#### Scenario: Pulled config adds a missing child
- **WHEN** an unfiltered parent pull adds a configured child repository that is not materialized locally
- **THEN** Arashi does not clone it implicitly
- **AND** reports it as skipped with `arashi clone` guidance

#### Scenario: Clone materializes a configured repository
- **WHEN** `arashi clone` is about to create or clone a repository under configured `reposDir`
- **THEN** Arashi reconciles managed ignore state before filesystem materialization

#### Scenario: Add materializes a newly configured repository
- **WHEN** `arashi add` is about to clone a new repository into configured `reposDir`
- **THEN** Arashi reconciles managed ignore state before config and filesystem materialization
- **AND** includes config, clone, preference, and ignore-file changes in final-state rollback reporting

#### Scenario: Create materializes worktrees
- **WHEN** `arashi create` is about to create a parent or child worktree
- **THEN** Arashi reconciles managed ignore state before worktree mutation

#### Scenario: Fresh clone has no stored preference
- **WHEN** a configured workspace has no clone-local ignore-scope preference and a lifecycle command finds a missing safe rule
- **THEN** Arashi uses repository-local `local` scope
- **AND** Arashi does not unexpectedly modify tracked `.gitignore`

#### Scenario: None scope is active during materialization
- **WHEN** a mutating lifecycle command finds an unignored safe path while the stored scope is `none`
- **THEN** Arashi performs no ignore-file mutation
- **AND** the command emits a clear warning in its supported output format

### Requirement: Managed ignore reconciliation is idempotent and transaction-aware
The system SHALL preserve existing ignore content, avoid duplicate rules, and integrate applied changes with each command's rollback boundary.

#### Scenario: Reconciliation is repeated
- **WHEN** multiple lifecycle commands reconcile unchanged managed paths
- **THEN** ignore rules and managed headings are not duplicated
- **AND** subsequent results report no file change

#### Scenario: Downstream mutation is fully rolled back
- **WHEN** a command applies a managed ignore change and then fully rolls back the corresponding workspace mutation and configuration state
- **THEN** Arashi restores the prior ignore-file and clone-local preference state
- **AND** reports that reconciliation was attempted and restored

#### Scenario: Clone has partial success
- **WHEN** clone reconciliation succeeds, at least one selected repository is retained, and another clone fails
- **THEN** Arashi retains ignore state required by the successful clone
- **AND** reports partial command results and final changed state

#### Scenario: Add clone fails and restores config
- **WHEN** add reconciliation succeeds but repository cloning fails and add restores its config and filesystem state
- **THEN** Arashi restores prior ignore-file and preference state
- **AND** reports the add and reconciliation rollback results

#### Scenario: Pulled configuration remains active after child failure
- **WHEN** a parent pull succeeds and its updated configuration remains on disk after a later child failure
- **THEN** Arashi retains ignore reconciliation required by that active configuration

#### Scenario: Rollback restoration fails
- **WHEN** Arashi cannot restore prior ignore or preference state during command rollback
- **THEN** Arashi reports both the original command failure and restoration failure
- **AND** reports the final observed changed state without claiming successful restoration

### Requirement: Zero-config ignore handling remains local and convention-specific
Arashi SHALL reuse Git-effective ignore inspection for the standalone `.worktrees/` convention while keeping passive discovery and explicit zero-config bootstrap separate from configured-workspace managed-ignore scope preferences and owned blocks.

#### Scenario: Passive standalone discovery does not repair ignore state
- **WHEN** Arashi discovers an implicit standalone workspace for a read-only or cleanup command
- **THEN** Arashi does not add, remove, or reconcile ignore entries
- **AND** commands whose contracts include ignore-health details report the effective source or missing coverage without mutation

#### Scenario: Explicit bootstrap needs a rule
- **WHEN** `arashi init --zero-config` finds no effective tracked, repository-local, or global rule for a deterministic `.worktrees/` descendant using `git check-ignore --no-index`
- **THEN** it adds the literal `.worktrees/` rule only to the common repository's local exclude file resolved through Git
- **AND** verifies the same descendant is effectively ignored after the write
- **AND** does not create an Arashi-managed block or store `arashi.ignoreScope`

#### Scenario: Local rule is defeated by a higher-precedence pattern
- **WHEN** the deterministic descendant remains unignored after the repository-local rule is added
- **THEN** zero-config bootstrap restores the prior exclude content and reports the effective conflict
- **AND** does not claim successful ignore preparation

#### Scenario: Existing effective rule wins
- **WHEN** Git reports that the deterministic `.worktrees/` descendant is already ignored by any effective source
- **THEN** zero-config bootstrap preserves the source and content unchanged
- **AND** does not duplicate the rule in repository-local excludes

#### Scenario: Configured workspace reconciliation is unaffected
- **WHEN** a valid `.arashi/config.json` exists
- **THEN** configured lifecycle commands continue using configured `reposDir`, `worktreesDir`, owned-block reconciliation, and clone-local scope semantics
- **AND** zero-config bootstrap semantics do not replace or weaken that contract

### Requirement: Bare configured init uses non-worktree managed-path reporting
Configured init whose canonical workspace root is a bare Git repository SHALL NOT run worktree-dependent effective-ignore inspection or write ignore-file rules for managed paths resolved from that bare root.

#### Scenario: Parent default is external and unsafe
- **WHEN** configured bare init defaults `worktreesDir` to `..`
- **THEN** Arashi reports the path as an external unsafe automatic-ignore skip
- **AND** does not add `..` or an equivalent parent pattern to `.gitignore`, common `info/exclude`, or any global ignore source

#### Scenario: Bare-root subdirectory is non-applicable
- **WHEN** configured bare init resolves a repository-relative administrative path such as `reposDir` beneath the bare Git directory
- **THEN** Arashi reports that path as non-applicable to working-tree ignore rules
- **AND** does not run `git check-ignore` or write an ignore rule for it

#### Scenario: Local scope is non-mutating for bare paths
- **WHEN** configured bare init uses local ignore scope
- **THEN** Arashi reports local scope and the unsafe or non-applicable path results
- **AND** does not write the common local exclude file

#### Scenario: Tracked scope is non-mutating for bare paths
- **WHEN** configured bare init uses tracked ignore scope
- **THEN** Arashi may preserve the explicit clone-local scope preference through existing Git configuration semantics
- **AND** does not create, edit, or require a durable linked worktree for `.gitignore`

#### Scenario: None scope is non-mutating for bare paths
- **WHEN** configured bare init uses none scope
- **THEN** Arashi reports none scope and path classifications without ignore-file mutation

#### Scenario: Existing linked worktree does not change bare-init policy
- **WHEN** the bare repository has one or more usable linked worktrees
- **THEN** init invoked from the bare root does not inspect or mutate ignore files through those worktrees
- **AND** reports the same bare-root classifications as a repository without linked worktrees

#### Scenario: Committed bare repository without linked worktree succeeds
- **WHEN** a bare repository has a committed branch but no linked worktree
- **THEN** configured init completes its managed-path reporting without creating a temporary worktree

#### Scenario: Unborn bare repository succeeds
- **WHEN** a fresh bare repository has no committed branch or linked worktree
- **THEN** configured init completes its managed-path reporting without requiring a source ref or temporary worktree

#### Scenario: Bare dry-run reports without writing
- **WHEN** configured bare init previews local, tracked, or none scope under human or JSON dry-run
- **THEN** the result reports unsafe and non-applicable paths consistently
- **AND** no ignore file, preference, linked worktree, or temporary worktree is changed

### Requirement: Managed-ignore rollback retention ignores unsafe and non-applicable paths
Managed-ignore rollback SHALL use applicable safe surviving paths rather than raw resolved-path existence when deciding whether invocation-owned ignore or preference changes remain required.

#### Scenario: Pre-existing parent does not block restoration
- **WHEN** a configured path resolves through unsafe parent traversal and a later initialization step fails after applying unrelated safe managed-ignore changes
- **THEN** existence of the parent alone does not retain those changes

#### Scenario: Bare administrative path does not block restoration
- **WHEN** a bare-root path is classified non-applicable and a later step fails
- **THEN** existence of that administrative path does not act as managed-ignore residual state

#### Scenario: Applicable safe path survives
- **WHEN** an applicable safe managed path remains after incomplete cleanup
- **THEN** Arashi retains the coverage required by that surviving path

#### Scenario: All applicable state is removed
- **WHEN** downstream cleanup removes all applicable safe managed state created by the invocation
- **THEN** Arashi restores invocation-owned ignore and preference changes

#### Scenario: Restoration fails
- **WHEN** restoration of required prior state fails
- **THEN** Arashi reports both the original failure and restoration failure
- **AND** reports final observed state without claiming complete rollback

### Requirement: Coordinated linked add evaluates managed-ignore coverage for both destinations

Before materializing a canonical clone plus active child worktree, `arashi add` SHALL resolve managed-ignore scope and effective Git coverage independently for both destination paths, SHALL apply writes only through the authority permitted by that scope, and SHALL NOT modify tracked configuration in the canonical parent checkout.

#### Scenario: Coordinated add evaluates both child paths before materialization

- **WHEN** `arashi add` runs from a configured non-bare linked parent and is about to create a canonical child clone plus an active child worktree
- **THEN** Arashi resolves managed-ignore scope and effective coverage for both destinations before either path is materialized
- **AND** does not modify the canonical parent checkout's tracked `.gitignore` merely because it owns the canonical clone

#### Scenario: Local scope covers canonical and active destinations

- **WHEN** coordinated linked `add` resolves managed-ignore scope as `local`
- **THEN** Arashi reconciles the common repository exclude authority before materialization
- **AND** verifies the resulting effective rule covers both canonical and active child destinations

#### Scenario: Tracked scope already protects the canonical destination

- **WHEN** coordinated linked `add` resolves managed-ignore scope as `tracked`
- **AND** the canonical destination is already effectively ignored from the canonical parent checkout
- **THEN** Arashi may reconcile the active branch's tracked `.gitignore` for the active destination
- **AND** proceeds only after effective coverage is verified at both destinations

#### Scenario: Tracked scope cannot protect the canonical destination from the active branch

- **WHEN** coordinated linked `add` resolves managed-ignore scope as `tracked`
- **AND** the canonical destination is not effectively ignored from the canonical parent checkout
- **THEN** Arashi fails before managed-ignore writes, clone, branch, worktree, or config mutation
- **AND** explains that the managed rule must be reconciled and committed on the branch checked out in the canonical parent checkout first
- **AND** does not write the canonical checkout's tracked `.gitignore`

#### Scenario: None scope preserves explicit opt-out for both destinations

- **WHEN** coordinated linked `add` resolves managed-ignore scope as `none`
- **THEN** Arashi performs no tracked, repository-local, or global ignore-file writes
- **AND** reports each canonical or active destination that remains unignored
- **AND** may continue under the existing explicit opt-out policy

### Requirement: Coordinated linked add retains dependent Git and ignore state during incomplete rollback

Coordinated linked `arashi add` SHALL treat the canonical clone as the Git common-directory owner for the active child worktree, SHALL remove it only after verifying that no linked child path or worktree metadata survives, and SHALL retain applicable managed-ignore coverage for every surviving materialized path.

#### Scenario: Coordinated add succeeds in both locations

- **WHEN** coordinated linked `add` creates the canonical clone and active child worktree and persists active configuration
- **THEN** applicable reconciled ignore state is retained
- **AND** no pre-command ignore content or preference is removed

#### Scenario: Rollback removes both child locations

- **WHEN** a downstream failure occurs after coordinated managed-ignore reconciliation
- **AND** rollback verifies that active child path and worktree metadata are both absent and removes the canonical clone
- **THEN** invocation-owned ignore-file content and preference changes are restored to their exact pre-command state when no remaining config/materialized path requires them

#### Scenario: Linked child path or metadata survives rollback

- **WHEN** rollback cannot remove the active child path or its worktree metadata
- **THEN** Arashi retains the canonical clone and coordinated branch that own and serve that linked worktree
- **AND** retains applicable managed-ignore coverage
- **AND** reports incomplete rollback and the observed surviving state

#### Scenario: Final-state observation fails

- **WHEN** Arashi cannot determine whether linked worktree metadata or a dependent path survives
- **THEN** Arashi fails closed by retaining the canonical clone, coordinated branch, and applicable managed-ignore coverage
- **AND** reports the observation failure without claiming complete rollback

#### Scenario: Coordinated cleanup removes nothing materialized

- **WHEN** coordinated add fails before clone, branch, worktree, or config mutation
- **THEN** Arashi restores any invocation-owned managed-ignore mutation
- **AND** preserves all pre-command ignore content and preferences

