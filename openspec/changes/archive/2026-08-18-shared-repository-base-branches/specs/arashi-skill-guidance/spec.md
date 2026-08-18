## MODIFIED Requirements

### Requirement: Skill guidance teaches configurable create base branches
The packaged Arashi skill SHALL teach shared repository base policy for configured create and clone: root `baseBranch`, `meta.baseBranch`, `repos.<name>.baseBranch`, invocation-wide `--base`, and repeatable `--repo-base <repository=branch>`. Guidance SHALL explain precedence, `@meta`, local-then-origin resolution, selected-set preflight, coordinated clone target alignment, existing-target preservation, legacy migration, and standalone scope.

#### Scenario: Agent configures mixed repository bases
- **WHEN** meta and child repositories use different integration branches
- **THEN** skill guidance uses a root fallback plus only necessary meta/child overrides
- **AND** does not duplicate values under create and clone defaults

#### Scenario: Agent selects one-off bases
- **WHEN** an agent needs an invocation-wide base and one repository exception
- **THEN** guidance uses `--base` plus `--repo-base`
- **AND** states the complete precedence and fail-before-mutation boundary

#### Scenario: Agent clones a missing coordinated child
- **WHEN** clone runs in a coordinated worktree
- **THEN** guidance preserves the coordinated target branch and treats the effective base only as its creation point

#### Scenario: Agent reuses a target branch
- **WHEN** create or coordinated clone finds an existing target
- **THEN** guidance does not claim Arashi resets, rebases, or validates its ancestry against the base

#### Scenario: Agent migrates old configuration
- **WHEN** an agent encounters `defaults.create.baseBranch`
- **THEN** it migrates the value to root `baseBranch`
- **AND** recognizes that the canonical value applies to configured create and clone

#### Scenario: Agent uses implicit standalone mode
- **WHEN** an agent runs standalone create
- **THEN** guidance permits invocation-only `--base`
- **AND** rejects configured or repository-specific base policy and does not invent clone support

#### Scenario: Agent writes hooks
- **WHEN** an agent needs target-branch context after policy resolution
- **THEN** guidance continues to use `ARASHI_BRANCH_NAME`
- **AND** does not invent or advertise `ARASHI_BASE_BRANCH`
