## MODIFIED Requirements

### Requirement: Add persists repository configuration in the active parent branch

In coordinated linked mode, `arashi add` SHALL persist the new repository entry only in the active parent worktree's configuration after both canonical and active child paths are materialized successfully and optional onboarding has produced a complete validated candidate and safe active-script plan. The single persisted entry SHALL contain the existing config-relative `path` and `gitUrl` plus only user-confirmed canonical repository `copy`, `symlink`, and inline `hooks` values; file-mode lifecycles SHALL remain file-owned and absent from inline config. Direct-main and configured-bare modes SHALL use the same candidate, native-file topology, and single-write rule at their existing configuration authority.

#### Scenario: Linked add succeeds

- **WHEN** canonical clone and active child worktree creation succeed and onboarding is declined or suppressed
- **THEN** Arashi adds the existing config-relative `path` and `gitUrl` entry to the active parent's `.arashi/config.json`
- **AND** does not modify the canonical parent checkout's tracked configuration

#### Scenario: Linked add with onboarding succeeds

- **WHEN** canonical clone and active child worktree creation succeed and the user confirms a valid onboarding candidate
- **THEN** Arashi adds the complete repository entry to the active parent's `.arashi/config.json` in one save
- **AND** atomically installs only confirmed active safe no-op create scripts at the active configuration root and remove scripts at the runtime-resolved configured target repository path with runtime-ready permissions
- **AND** does not modify the canonical parent checkout's tracked configuration

#### Scenario: Materialization fails before config persistence

- **WHEN** canonical clone or active child worktree creation fails
- **THEN** onboarding does not begin and the active configuration remains byte-equivalent to its pre-command repository configuration
- **AND** the canonical parent configuration remains unchanged

#### Scenario: Onboarding cancels before persistence

- **WHEN** repository materialization succeeds but onboarding returns controlled cancellation before the final save
- **THEN** the active configuration remains byte-equivalent to its pre-command repository configuration
- **AND** add applies its existing rollback ownership and final-observation rules to invocation-created repository state

#### Scenario: Direct main add succeeds

- **WHEN** the active configuration/execution root is the canonical non-bare parent worktree
- **THEN** Arashi preserves direct behavior by cloning once beneath that root and updating its configuration once with the complete confirmed repository candidate
- **AND** does not create a second child worktree

### Requirement: Add rollback owns both repository locations and final state

Coordinated `arashi add` SHALL track invocation-owned clone, branch, worktree, config, active hook-script, setup-script, and managed-ignore mutations and SHALL roll them back in reverse dependency order without deleting pre-existing or user-modified state. Configuration rollback ownership SHALL compare the complete invocation-persisted repository entry, including confirmed `copy`, `symlink`, and sanitized-in-output but exact-in-memory `hooks` values, rather than assuming an entry with matching `path` and `gitUrl` remains invocation-owned after a concurrent edit. Script rollback SHALL remove only exact planned paths that remain byte-and-mode-identical regular files created by this invocation.

#### Scenario: Worktree creation fails after canonical clone

- **WHEN** canonical cloning succeeds but active child worktree creation fails
- **THEN** Arashi first attempts to remove invocation-created partial linked-worktree state and verifies both its path and metadata
- **AND** removes the invocation-created branch and canonical clone only after verifying that no linked child path or worktree metadata survives
- **AND** retains the canonical clone and coordinated branch when either linked path or metadata survives
- **AND** leaves both configurations unchanged

#### Scenario: Onboarding cancels after repository materialization

- **WHEN** canonical clone and any active child worktree succeed but a selected onboarding prompt or final confirmation is cancelled
- **THEN** Arashi performs no configuration or hook-script write and attempts to remove invocation-owned setup-script, linked worktree, branch, clone, and managed-ignore state in dependency-safe order
- **AND** reports final observed state without revealing entered hook bodies

#### Scenario: Config write fails after both child paths exist

- **WHEN** canonical clone and active child worktree creation succeed but complete-candidate config persistence fails
- **THEN** Arashi restores the exact pre-command active configuration bytes and attempts to remove the invocation-created linked worktree and its metadata
- **AND** removes the invocation-created coordinated branch and canonical clone only after verifying that no linked child path or worktree metadata survives
- **AND** retains the canonical clone and coordinated branch when either linked path or metadata survives
- **AND** restores managed-ignore state when no applicable materialized state survives
- **AND** reports incomplete rollback with final observed state if byte restoration or any cleanup operation fails

#### Scenario: Concurrent actor edits the new repository entry

- **WHEN** a later actor changes any field of the complete persisted repository entry before add rollback evaluates ownership
- **THEN** rollback preserves the newer unowned entry rather than deleting it based only on matching `path` and `gitUrl`
- **AND** reports incomplete restoration without exposing hook bodies

#### Scenario: User changes an invocation-created hook script before rollback

- **WHEN** a later failure starts rollback after a generated script was edited, chmodded, replaced, or changed into a symlink
- **THEN** rollback preserves that path rather than deleting user-modified or unowned state
- **AND** reports incomplete cleanup with the script path but no script contents

#### Scenario: Cleanup is incomplete

- **WHEN** Arashi cannot remove an invocation-created worktree, ref, clone, byte-and-mode-identical active hook script, setup script, or restore configuration/ignore state
- **THEN** the command reports the initiating failure plus each cleanup/restoration failure
- **AND** does not delete the canonical clone when a linked child path or worktree metadata still depends on its Git common directory
- **AND** reports final observed canonical path, active path, branch, config, and managed-ignore state without claiming complete rollback

#### Scenario: Pre-existing state is encountered

- **WHEN** a path, branch, worktree, config entry, hook script, setup script, or ignore rule existed before the command
- **THEN** rollback does not remove, reset, or rewrite that state

### Requirement: Direct and bare add behavior remains compatible

Topology-aware add SHALL preserve existing direct-main and configured-bare behavior, configured-only guards, duplicate handling, command options, and human/JSON output while adding onboarding only under the approved human-TTY predicate.

#### Scenario: Configured bare workspace add runs

- **WHEN** `arashi add` runs through an existing configured bare authority without a primary non-bare parent worktree
- **THEN** Arashi retains the existing canonical configuration-root placement and persistence behavior
- **AND** applies optional onboarding only when the invocation is eligible
- **AND** does not apply the non-bare linked-parent two-location workflow

#### Scenario: Standalone workspace rejects add

- **WHEN** `arashi add` runs in implicit standalone mode
- **THEN** it retains the structured configured-workspace-required error and non-mutation behavior
- **AND** does not begin onboarding

#### Scenario: Duplicate repository is configured

- **WHEN** the derived or explicit repository name already exists in active configuration
- **THEN** add retains clone-oriented guidance and the interactive `arashi clone` fallback
- **AND** does not begin new canonical or active materialization or onboarding

#### Scenario: Existing options are used

- **WHEN** users invoke `add` with `--name`, `--create-setup`, `--force`, or `--json`
- **THEN** those options retain their current meanings in both direct and coordinated materialization modes
- **AND** `--force` and `--json` suppress onboarding while `--create-setup` remains separate from both inline hooks and generated active no-op lifecycle scripts
