## ADDED Requirements

### Requirement: Add resolves active and canonical configured workspace roles through Git

`arashi add` SHALL distinguish the active configuration/execution checkout from the canonical non-bare parent worktree without relying on a configured worktree directory name or filesystem-path substring.

#### Scenario: Add runs from a linked parent worktree

- **WHEN** `arashi add` starts in a configured non-bare linked parent worktree
- **THEN** Arashi treats that linked parent as the active configuration and execution root
- **AND** resolves the parent repository's primary non-bare worktree as the canonical parent root through Git topology

#### Scenario: Add runs from a nested independent child

- **WHEN** `arashi add` starts inside an independent Git repository nested beneath a configured linked parent
- **THEN** Arashi resolves the enclosing configured parent as the active configuration and execution root
- **AND** does not treat the nested child repository as the parent workspace

#### Scenario: Configured worktrees use a custom location

- **WHEN** the active parent worktree is outside `.arashi/worktrees` or uses another configured worktree location
- **THEN** Arashi resolves the same active and canonical roles through Git common-directory/worktree metadata
- **AND** no path-name convention is required

#### Scenario: Active configuration is invalid

- **WHEN** the active linked parent contains an existing malformed or invalid `.arashi/config.json`
- **THEN** Arashi reports that configuration error before repository or ignore mutation
- **AND** does not fall back to configuration from the canonical parent checkout

### Requirement: Linked add keeps a default-branch canonical clone and an active coordinated child worktree

For a configured non-bare linked parent, `arashi add` SHALL clone the new child beneath the canonical parent's configured `reposDir`, SHALL retain that clone on the detected child default branch, and SHALL create a linked child worktree beneath the active parent's equivalent configured path on the active parent branch.

#### Scenario: Managed-ignore-unsafe repositories directory retains single placement

- **WHEN** a linked parent workspace has an absolute or otherwise managed-ignore-unsafe `reposDir`
- **THEN** `add` retains the existing single-placement clone behavior in the active workspace
- **AND** does not attempt to create distinct canonical and active materializations at the same path
- **AND** persists the existing configured repository path semantics

#### Scenario: Coordinated branch does not exist in the new child

- **WHEN** the active parent branch is `feature/example`, the new child default branch is `main`, and no local or `origin/feature/example` child ref exists
- **THEN** Arashi leaves the canonical child clone on `main`
- **AND** creates local child branch `feature/example` from the detected default branch
- **AND** checks out that branch only in the active child worktree

#### Scenario: Matching remote branch exists

- **WHEN** the new canonical clone contains `refs/remotes/origin/<active-parent-branch>` and no local branch with that name
- **THEN** Arashi creates the coordinated local branch from the matching remote-tracking ref
- **AND** materializes the active child worktree on that local tracking branch

#### Scenario: Branch name contains slashes

- **WHEN** the active parent branch contains `/`
- **THEN** Arashi preserves the exact branch name in child ref lookup, creation, output, and worktree checkout
- **AND** passes the branch as a Git argument without shell interpolation

#### Scenario: Coordinated branch conflicts with checked-out child default

- **WHEN** the active parent branch equals the default branch checked out in the canonical child clone
- **THEN** Arashi fails rather than detaching the canonical clone or inventing another child branch
- **AND** rolls back invocation-created repository state

### Requirement: Add persists repository configuration in the active parent branch

In coordinated linked mode, `arashi add` SHALL persist the new repository entry only in the active parent worktree's configuration after both canonical and active child paths are materialized successfully.

#### Scenario: Linked add succeeds

- **WHEN** canonical clone and active child worktree creation succeed
- **THEN** Arashi adds the existing config-relative `path` and `gitUrl` entry to the active parent's `.arashi/config.json`
- **AND** does not modify the canonical parent checkout's tracked configuration

#### Scenario: Materialization fails before config persistence

- **WHEN** canonical clone or active child worktree creation fails
- **THEN** the active configuration remains byte-equivalent to its pre-command repository configuration
- **AND** the canonical parent configuration remains unchanged

#### Scenario: Direct main add succeeds

- **WHEN** the active configuration/execution root is the canonical non-bare parent worktree
- **THEN** Arashi preserves direct behavior by cloning once beneath that root and updating its configuration
- **AND** does not create a second child worktree

### Requirement: Add preflights active topology before mutation

`arashi add` MUST reject every knowable topology or destination conflict before cloning and MUST fail closed on conflicts discovered atomically by Git or the filesystem.

#### Scenario: Active parent is detached

- **WHEN** coordinated linked mode cannot resolve a symbolic active parent branch
- **THEN** Arashi reports actionable detached-HEAD guidance before clone, branch, worktree, config, or managed-directory materialization

#### Scenario: Canonical destination already exists

- **WHEN** the resolved canonical child destination exists before the invocation
- **THEN** Arashi fails without overwriting, adopting, or deleting that destination
- **AND** does not create the active child destination or config entry

#### Scenario: Active destination already exists

- **WHEN** the resolved active child destination exists before the invocation
- **THEN** Arashi fails without overwriting, adopting, or deleting that destination
- **AND** does not clone the canonical child or update configuration

#### Scenario: Coordinated branch is checked out elsewhere

- **WHEN** Git reports that the matching child branch is already checked out in another worktree
- **THEN** Arashi fails without moving, resetting, or removing the existing worktree or branch
- **AND** reports the conflicting branch/worktree state

#### Scenario: Concurrent conflict appears after preflight

- **WHEN** a destination or ref conflict appears between preflight and mutation
- **THEN** the underlying clone/ref/worktree operation fails closed
- **AND** rollback removes only state proven to have been created by this invocation

### Requirement: Concurrent adds share one parent transaction boundary

Cooperating `arashi add` invocations associated with the same parent Git common directory SHALL serialize managed-ignore reconciliation, repository materialization, configuration persistence, and rollback as one transaction across canonical and linked parent checkouts.

#### Scenario: Canonical and linked invocations overlap

- **WHEN** one add runs from the canonical parent checkout while another runs from a linked parent worktree
- **THEN** both use the same Git-common-directory transaction lock
- **AND** the waiting invocation does not time out within an ordinary remote clone duration
- **AND** a failed invocation cannot restore config or managed-ignore state over a successful invocation

#### Scenario: A previous add was terminated while holding the lock

- **WHEN** owner metadata proves the transaction lock belongs to a process that no longer exists
- **THEN** a later add safely reclaims the abandoned lock
- **AND** a lock owned by a live process is not stolen

### Requirement: Add rollback owns both repository locations and final state

Coordinated `arashi add` SHALL track invocation-owned clone, branch, worktree, config, and managed-ignore mutations and SHALL roll them back in reverse dependency order without deleting pre-existing state.

#### Scenario: Worktree creation fails after canonical clone

- **WHEN** canonical cloning succeeds but active child worktree creation fails
- **THEN** Arashi first attempts to remove invocation-created partial linked-worktree state and verifies both its path and metadata
- **AND** removes the invocation-created branch and canonical clone only after verifying that no linked child path or worktree metadata survives
- **AND** retains the canonical clone and coordinated branch when either linked path or metadata survives
- **AND** leaves both configurations unchanged

#### Scenario: Config write fails after both child paths exist

- **WHEN** canonical clone and active child worktree creation succeed but active config persistence fails
- **THEN** Arashi restores the exact pre-command active configuration bytes and attempts to remove the invocation-created linked worktree and its metadata
- **AND** removes the invocation-created coordinated branch and canonical clone only after verifying that no linked child path or worktree metadata survives
- **AND** retains the canonical clone and coordinated branch when either linked path or metadata survives
- **AND** restores managed-ignore state when no applicable materialized state survives
- **AND** reports incomplete rollback with final observed state if byte restoration or any cleanup operation fails

#### Scenario: Cleanup is incomplete

- **WHEN** Arashi cannot remove an invocation-created worktree, ref, clone, or restore configuration/ignore state
- **THEN** the command reports the initiating failure plus each cleanup/restoration failure
- **AND** does not delete the canonical clone when a linked child path or worktree metadata still depends on its Git common directory
- **AND** reports final observed canonical path, active path, branch, config, and managed-ignore state without claiming complete rollback

#### Scenario: Pre-existing state is encountered

- **WHEN** a path, branch, worktree, config entry, or ignore rule existed before the command
- **THEN** rollback does not remove, reset, or rewrite that state

### Requirement: Direct and bare add behavior remains compatible

Topology-aware add SHALL preserve existing direct-main and configured-bare behavior, configured-only guards, duplicate handling, and command options.

#### Scenario: Configured bare workspace add runs

- **WHEN** `arashi add` runs through an existing configured bare authority without a primary non-bare parent worktree
- **THEN** Arashi retains the existing canonical configuration-root placement and persistence behavior
- **AND** does not apply the non-bare linked-parent two-location workflow

#### Scenario: Standalone workspace rejects add

- **WHEN** `arashi add` runs in implicit standalone mode
- **THEN** it retains the structured configured-workspace-required error and non-mutation behavior

#### Scenario: Duplicate repository is configured

- **WHEN** the derived or explicit repository name already exists in active configuration
- **THEN** add retains clone-oriented guidance and the interactive `arashi clone` fallback
- **AND** does not begin new canonical or active materialization

#### Scenario: Existing options are used

- **WHEN** users invoke `add` with `--name`, `--create-setup`, `--force`, or `--json`
- **THEN** those options retain their current meanings in both direct and coordinated materialization modes

### Requirement: Human add output identifies materialization roles

Human-readable successful add output SHALL distinguish portable configuration path, canonical clone/default branch, and any active child worktree/coordinated branch.

#### Scenario: Linked add human output succeeds

- **WHEN** coordinated linked add succeeds without `--json`
- **THEN** output labels the canonical clone path and child default branch
- **AND** separately labels the active worktree path and coordinated branch
- **AND** next-step setup guidance does not imply that the canonical clone is the active feature checkout

#### Scenario: Direct add human output succeeds

- **WHEN** direct or configured-bare add succeeds without a linked child worktree
- **THEN** output identifies the single canonical clone and default branch
- **AND** does not print a nonexistent active-worktree or coordinated-branch value

### Requirement: Maintained guidance explains linked-worktree add topology

Maintained CLI, website, generated agent-readable, and packaged skill guidance SHALL explain the canonical clone, active linked child, coordinated branch, and active-config ownership model without teaching manual duplicate clones.

#### Scenario: User reads add command guidance

- **WHEN** a user reads maintained `add` command or configured-workflow documentation
- **THEN** the guidance distinguishes invocation from the canonical parent checkout from invocation in a linked parent worktree
- **AND** identifies which checkout receives the config change and where both child paths are materialized

#### Scenario: Agent consumes generated or packaged guidance

- **WHEN** agent-readable docs or the packaged Arashi skill describe adding a repository from a linked parent worktree
- **THEN** they use the same path, branch, config-authority, and rollback vocabulary as the canonical CLI contract
- **AND** do not recommend manually cloning the child twice

#### Scenario: Companion guidance drifts

- **WHEN** CLI contract metadata, canonical docs, generated exports, or packaged skill guidance disagrees about linked add materialization
- **THEN** the owning repository-local or meta cross-repository deterministic checker reports the mismatch and exits unsuccessfully
