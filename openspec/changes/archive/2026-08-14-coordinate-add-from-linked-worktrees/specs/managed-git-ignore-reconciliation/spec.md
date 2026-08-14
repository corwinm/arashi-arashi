## ADDED Requirements

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
