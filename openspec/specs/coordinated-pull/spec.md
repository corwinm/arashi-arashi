# coordinated-pull Specification

## Purpose

Define how `arashi pull` synchronizes configured workspaces against each repository's effective configured base while preserving protected rollback, ordering, filtering, and structured outcome behavior.

## Requirements
### Requirement: Configured pull incorporates the effective remote base

For each selected repository in a configured workspace, `arashi pull` SHALL resolve the effective configured base using repository override then root fallback. When a base exists, pull SHALL resolve and refresh that branch on the command's selected remote, compare `HEAD` with the remote base ref, and, when behind, use the existing rollback-protected merge pull from `<remote> <baseBranch>` into the current branch. It MUST NOT silently substitute the current upstream or remote default after a configured-base failure.

#### Scenario: Feature branch tracks a different upstream

- **WHEN** the current feature branch tracks `origin/feature-api` and child `api` configures base `develop`
- **THEN** pull refreshes and compares `origin/develop`
- **AND** when behind runs the protected merge pull from `origin develop` into the feature branch
- **AND** it does not pull `origin/feature-api`

#### Scenario: Root, meta, and child precedence

- **WHEN** root base is `main`, meta overrides it with `meta/develop`, and child `api` overrides it with `api/develop`
- **THEN** pull uses `meta/develop` for the parent, `api/develop` for `api`, and `main` for selected children without overrides

#### Scenario: Current branch is the configured base

- **WHEN** the checked-out branch is the configured base and its remote base is ahead
- **THEN** pull updates that branch through the same protected pull path
- **AND** does not skip it merely because branch and base names match

#### Scenario: Current branch is not behind the configured base

- **WHEN** comparison shows no remote base commits missing from `HEAD`
- **THEN** pull performs no merge mutation for that repository
- **AND** reports an up-to-date/skipped outcome using existing command conventions

### Requirement: Pull preserves upstream behavior when configured base is absent

When a selected configured repository has no effective configured base, pull SHALL preserve its established upstream/current-branch resolution, comparison, and protected merge behavior exactly in intent. Implicit standalone pull SHALL remain unchanged.

#### Scenario: Configured workspace omits base policy

- **WHEN** neither the owning repository nor root configuration defines `baseBranch`
- **THEN** pull resolves and updates from the current branch upstream using existing behavior
- **AND** it does not invent a remote-default configured base

#### Scenario: Standalone pull runs

- **WHEN** pull runs in an implicit standalone workspace
- **THEN** it follows the established standalone/upstream path
- **AND** does not resolve persisted configured-base policy

### Requirement: Configured-base failures are explicit per repository

A configured base that is missing from the selected remote or cannot be refreshed, resolved, or compared SHALL produce a clear per-repository failure/manual-action result naming the remote base ref. Pull MUST NOT fall back to the current upstream or default branch. Existing partial-failure processing SHALL continue for independent selected repositories.

#### Scenario: Remote configured base is missing

- **WHEN** child `api` configures `develop` but the selected remote has no `refs/heads/develop`
- **THEN** pull reports `api` as failed or requiring manual action and names the selected remote and `develop`
- **AND** does not pull the feature upstream or remote default
- **AND** no pull mutation runs for `api`

#### Scenario: Refresh fails for one repository

- **WHEN** one selected repository's configured-base fetch fails and another selected repository is independent
- **THEN** the failed repository retains a specific failure outcome
- **AND** existing partial-failure policy determines continued processing and aggregate exit status
- **AND** no stale ref is silently treated as fresh

### Requirement: Pull retains coordinated ordering and safety boundaries

Configured-base integration SHALL preserve parent-first processing, post-parent configuration reload, repository/group filters, managed-ignore reconciliation, timeouts, JSON output, conflict rollback, and partial-failure behavior. Child base resolution MUST use the reloaded configuration and effective selected set.

#### Scenario: Parent pull changes child base configuration

- **WHEN** the parent pull updates `.arashi/config.json`
- **THEN** pull reloads and validates configuration before resolving child bases
- **AND** selected children use the reloaded root and repository overrides
- **AND** removed or newly invalid legacy configuration fails before child fetch or mutation

#### Scenario: Filters limit configured-base work

- **WHEN** `--only` and/or `--group` selects a subset of children
- **THEN** pull refreshes, compares, and mutates only the established parent plus effective selected-child set
- **AND** unselected children perform no base fetch

#### Scenario: Configured-base merge conflicts

- **WHEN** the protected pull from the configured remote base conflicts
- **THEN** existing rollback restores the repository to its pre-pull state where promised
- **AND** JSON/human output records the repository failure without hiding outcomes for other repositories

#### Scenario: JSON pull reports target and outcome

- **WHEN** configured pull runs with `--json`
- **THEN** each selected repository result identifies configured-base source, logical branch, concrete remote/ref, comparison state, and pull/skipped/failed outcome
- **AND** stdout remains one structured document

