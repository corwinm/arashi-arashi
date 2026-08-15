# create-base-branch-selection Specification

## Purpose
Define how configured and explicit create-base requests are normalized, resolved across selected repositories, captured as immutable commit OIDs, applied to newly created targets, reported, and kept non-mutating for reused targets and failed preflight.

## Requirements
### Requirement: Resolve a requested create base in every selected repository
The system SHALL treat a configured or explicit create base as one logical branch name, SHALL normalize at most one leading `origin/`, and SHALL resolve that name independently in every effective selected repository by preferring `refs/heads/<branch>` and then `refs/remotes/origin/<branch>`. The system MUST NOT fall back to a detected default branch, another local ref, a tag, or another remote when a requested base is present.

#### Scenario: Local base exists in every selected repository
- **WHEN** a configured create selects a parent and child repositories that each contain local branch `feature/FEAT-1234`
- **AND** the user creates a new target with base `feature/FEAT-1234`
- **THEN** every new target branch starts at its repository-local `refs/heads/feature/FEAT-1234`

#### Scenario: Base exists only as an origin tracking ref
- **WHEN** a selected repository lacks local branch `feature/FEAT-1234` but contains `refs/remotes/origin/feature/FEAT-1234`
- **THEN** its new target branch starts at that remote-tracking ref
- **AND** Arashi does not create or switch a local base branch

#### Scenario: Origin-prefixed request is normalized
- **WHEN** the user requests base `origin/feature/FEAT-1234`
- **THEN** Arashi resolves logical branch `feature/FEAT-1234` using the same local-first order
- **AND** does not construct `origin/origin/feature/FEAT-1234`

#### Scenario: Local and origin refs diverge
- **WHEN** both candidate refs exist at different commits
- **THEN** the local ref wins deterministically
- **AND** Arashi does not classify the pair as ambiguous or inspect another remote

#### Scenario: Selected ref moves after planning
- **WHEN** a resolved local or origin ref moves after preflight but before sequential branch creation
- **THEN** the target branch is created from the commit OID captured during preflight
- **AND** result metadata still identifies the selected ref and captured OID

### Requirement: Validate all selected base refs before create side effects
The system SHALL validate branch syntax and resolve the requested base for the complete effective selected repository set before managed-ignore reconciliation, lifecycle hooks, branch creation, worktree creation, setup, or launch. Missing-base diagnostics SHALL identify every affected selected repository and the attempted local and origin refs.

#### Scenario: Multiple selected repositories lack the base
- **WHEN** more than one selected repository cannot resolve the requested base
- **THEN** create exits nonzero with one complete actionable diagnostic covering all affected repositories
- **AND** no create hook or mutation runs in any repository

#### Scenario: Filters exclude a repository without the base
- **WHEN** `--only`, `--group`, or interactive selection excludes a repository that lacks the requested base
- **THEN** that repository does not participate in base validation
- **AND** the selected repositories can proceed when their bases resolve

#### Scenario: Dry-run base is unavailable
- **WHEN** a dry-run requests a base that is unavailable in a selected repository
- **THEN** dry-run fails with the same non-mutating resolution diagnostic
- **AND** does not present the create plan as executable

### Requirement: Apply a requested base only to newly created target branches
The system SHALL validate the requested base in every selected repository but SHALL use the resolved ref only when creating a target branch. Existing target branches retained through the selected reuse strategy MUST remain unchanged and MUST NOT be reset, rebased, or represented as newly derived from the requested base.

#### Scenario: Existing target branch is reused
- **WHEN** the target branch already exists and conflict strategy `REUSE_EXISTING` is selected
- **THEN** Arashi reuses the existing branch under current conflict semantics
- **AND** reports the repository's independently resolved base without claiming or enforcing that the existing target derives from it
- **AND** performs no base-ancestry mutation for that target

#### Scenario: New and reused targets are mixed
- **WHEN** one selected repository reuses the target while another must create it
- **THEN** Arashi requires the requested base in both repositories and uses it only for the newly created target
- **AND** reports which repository reused an existing branch

### Requirement: Roll back only invocation-owned base-driven mutations
Base-driven create SHALL retain the existing ownership-aware rollback boundary. If failure occurs after preflight and partial mutation, Arashi SHALL remove only target branches and worktrees created by that invocation and MUST preserve requested base refs, captured base objects, reused target branches, and pre-existing worktrees.

#### Scenario: Mixed new and reused repositories fail after partial creation
- **WHEN** base preflight succeeds for repositories containing both new and reused targets
- **AND** a later branch, worktree, setup, or hook operation fails after one new target was created
- **THEN** rollback removes the invocation-created target branch and worktree
- **AND** preserves every requested base ref, captured base object, reused target branch, and pre-existing worktree
- **AND** reports any rollback failure without claiming the preserved repositories were reverted

### Requirement: Preview requested and resolved create bases
The system SHALL expose the requested logical base and each selected repository's effective resolution in non-mutating create previews.

#### Scenario: Human dry-run resolves mixed local and remote bases
- **WHEN** a dry-run resolves the base locally in one repository and from `origin` in another
- **THEN** human output names the requested base and each repository's exact resolved ref
- **AND** no ref, hook, ignore file, or worktree is mutated

### Requirement: Support explicit base selection in implicit standalone create
Implicit standalone create SHALL accept explicit `--base <branch>`, resolve it local-first then `origin`-second in the standalone main repository, and fail before hooks or mutation when unavailable. Standalone create SHALL NOT load or persist `defaults.create.baseBranch`.

#### Scenario: Standalone explicit base succeeds
- **WHEN** a user runs `arashi create task --base feature/FEAT-1234` in implicit standalone mode
- **THEN** the new `task` branch starts from the resolved standalone base
- **AND** no `.arashi` configuration is created

#### Scenario: Standalone explicit base is missing
- **WHEN** the requested standalone base cannot be resolved
- **THEN** create fails before standalone hooks or worktree mutation with attempted-ref guidance
