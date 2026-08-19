## MODIFIED Requirements

### Requirement: Skill guidance teaches configurable create base branches

The packaged Arashi skill SHALL teach shared repository base policy across configured create, clone, status, pull, push fallback, handoff, and doctor: root `baseBranch`, `meta.baseBranch`, and `repos.<name>.baseBranch`, plus create/clone invocation-wide `--base` and repeatable `--repo-base <repository=branch>`. Guidance SHALL distinguish upstream, configured base, and remote default; explain precedence, resolution, selected-set preflight, target reuse, failure without silent fallback, same-target de-duplication, removal of `defaults.create.baseBranch`, and unchanged standalone scope.

#### Scenario: Agent configures mixed repository bases

- **WHEN** meta and child repositories use different integration branches
- **THEN** skill guidance uses a root fallback plus only necessary meta/child overrides
- **AND** does not duplicate values under create defaults

#### Scenario: Agent selects one-off bases

- **WHEN** an agent needs an invocation-wide base and one repository exception for create or clone
- **THEN** guidance uses `--base` plus `--repo-base`
- **AND** states complete command-applicable precedence and fail-before-mutation boundaries

#### Scenario: Agent evaluates and updates feature branches

- **WHEN** a feature branch upstream differs from its configured base
- **THEN** guidance keeps upstream, base, and remote-default status distinct
- **AND** uses configured pull to incorporate the remote base
- **AND** does not silently fall back if that base is unavailable

#### Scenario: Agent publishes a no-upstream branch

- **WHEN** an agent uses coordinated push on a branch without an upstream
- **THEN** guidance treats configured base only as the publishability baseline
- **AND** preserves `--set-upstream` and the current-branch push destination
- **AND** avoids manufacturing a branch whose commits are only base commits

#### Scenario: Agent interprets diagnostics

- **WHEN** configured base and remote default differ or share a target
- **THEN** guidance preserves both semantic roles
- **AND** expects separate diagnostics when different and de-duplicated human work when identical

#### Scenario: Agent clones a missing coordinated child

- **WHEN** clone runs in a coordinated worktree
- **THEN** guidance preserves the coordinated target branch and treats effective base only as its creation point

#### Scenario: Agent reuses a target branch

- **WHEN** create or coordinated clone finds an existing target
- **THEN** guidance does not claim Arashi resets, rebases, or validates its ancestry against the base

#### Scenario: Agent encounters removed configuration

- **WHEN** an agent encounters `defaults.create.baseBranch`
- **THEN** it treats the property as unsupported rather than accepted compatibility input
- **AND** migrates a workspace-wide value to root `baseBranch` or a repository-specific value to the owning override before running workspace commands

#### Scenario: Agent uses implicit standalone mode

- **WHEN** an agent runs standalone commands
- **THEN** guidance permits established invocation-only create `--base` behavior
- **AND** does not invent persisted configured-base policy or changed pull/push/diagnostic semantics

#### Scenario: Agent writes hooks

- **WHEN** an agent needs target-branch context after policy resolution
- **THEN** guidance continues to use `ARASHI_BRANCH_NAME`
- **AND** does not invent or advertise `ARASHI_BASE_BRANCH`
