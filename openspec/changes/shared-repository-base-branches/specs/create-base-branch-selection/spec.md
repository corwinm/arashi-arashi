## MODIFIED Requirements

### Requirement: Resolve a requested create base in every selected repository
The system SHALL resolve each selected repository's independently effective configured or explicit create base, SHALL normalize at most one leading `origin/`, and SHALL prefer `refs/heads/<branch>` then `refs/remotes/origin/<branch>` within that repository. The system MUST NOT fall back to a detected default branch, another local ref, a tag, or another remote when that repository has an effective base.

#### Scenario: Selected repositories use different bases
- **WHEN** configured create selects a meta repository with effective base `meta/integration` and children with effective bases `api/integration` and `main`
- **THEN** each new target starts from its own repository-local effective base resolution
- **AND** Arashi does not require one logical branch name to exist everywhere

#### Scenario: Base exists only as an origin tracking ref
- **WHEN** a selected repository lacks its effective local branch but contains the matching `refs/remotes/origin/<branch>`
- **THEN** its new target branch starts at that remote-tracking ref
- **AND** Arashi does not create or switch a local base branch

#### Scenario: Origin-prefixed request is normalized
- **WHEN** an effective base is `origin/feature/FEAT-1234`
- **THEN** Arashi resolves logical branch `feature/FEAT-1234` using the same local-first order
- **AND** does not construct `origin/origin/feature/FEAT-1234`

#### Scenario: Local and origin refs diverge
- **WHEN** both candidate refs for one repository exist at different commits
- **THEN** the local ref wins deterministically
- **AND** Arashi does not classify the pair as ambiguous or inspect another remote

#### Scenario: Selected ref moves after planning
- **WHEN** a resolved local or origin ref moves after preflight but before sequential branch creation
- **THEN** the target branch is created from the commit OID captured during preflight
- **AND** result metadata still identifies the selected ref and captured OID

### Requirement: Validate all selected base refs before create side effects
The system SHALL validate CLI selectors, branch syntax, and every effective base for the complete selected repository set before managed-ignore reconciliation, lifecycle hooks, branch creation, worktree creation, setup, or launch. Diagnostics SHALL aggregate every invalid selector and affected selected repository with its own effective branch and attempted local/origin refs.

#### Scenario: Multiple selected repositories lack different bases
- **WHEN** more than one selected repository cannot resolve its independently effective base
- **THEN** create exits nonzero with one complete actionable diagnostic covering all affected repositories
- **AND** no create hook or mutation runs in any repository

#### Scenario: Filters exclude a repository without the base
- **WHEN** `--only`, `--group`, or interactive selection excludes a repository that cannot resolve its configured base
- **THEN** that repository does not participate in base validation
- **AND** selected repositories can proceed when their effective bases resolve

#### Scenario: Dry-run base is unavailable
- **WHEN** dry-run cannot resolve an effective base in a selected repository
- **THEN** dry-run fails with the same non-mutating aggregated diagnostic
- **AND** does not present the create plan as executable

### Requirement: Preview requested and resolved create bases
The system SHALL expose every selected repository's normalized effective base, policy source, resolved ref, and captured OID in non-mutating create previews whenever a base policy applies.

#### Scenario: Human dry-run resolves mixed branches and sources
- **WHEN** dry-run resolves meta and child bases from mixed CLI and configuration sources
- **THEN** human output names each repository's effective base, source, and exact resolved ref
- **AND** no ref, hook, ignore file, or worktree is mutated

### Requirement: Support explicit base selection in implicit standalone create
Implicit standalone create SHALL accept explicit `--base <branch>`, resolve it local-first then `origin`-second in the standalone main repository, and fail before hooks or mutation when unavailable. Standalone create SHALL NOT load configured workspace base policy and SHALL reject repository-specific override flags.

#### Scenario: Standalone explicit base succeeds
- **WHEN** a user runs `arashi create task --base feature/FEAT-1234` in implicit standalone mode
- **THEN** the new `task` branch starts from the resolved standalone base
- **AND** no `.arashi` configuration is created

#### Scenario: Standalone explicit base is missing
- **WHEN** the requested standalone base cannot be resolved
- **THEN** create fails before standalone hooks or worktree mutation with attempted-ref guidance

#### Scenario: Standalone repository override is rejected
- **WHEN** implicit standalone create receives `--repo-base api=develop`
- **THEN** create fails before hooks or mutation with configured-workspace guidance
