# coordinated-branch-publishing Specification

## Purpose
Define how Arashi publishes coordinated feature branches across the parent workspace and managed child repositories while avoiding unnecessary remote branches for untouched repositories.
## Requirements
### Requirement: Coordinated branch push command

The Arashi CLI SHALL provide an `arashi push` command that publishes the current coordinated branch for eligible selected repositories in the parent workspace and configured child repositories.

#### Scenario: Push publishes eligible repositories
- **WHEN** a user runs `arashi push` from a coordinated workspace with unpublished local branch commits in the parent repo and one child repo
- **THEN** Arashi pushes the eligible repositories' current branches to their configured remotes
- **AND** the command summarizes each pushed repository and aggregate totals

#### Scenario: Push skips untouched coordinated child repositories
- **WHEN** a coordinated child repository has no branch commits or remote differences that need publishing
- **AND** a user runs `arashi push`
- **THEN** Arashi skips that repository rather than creating or updating an unnecessary remote branch
- **AND** the summary identifies the repository as skipped with a reason

#### Scenario: Push reports per-repository failures
- **WHEN** a selected repository push fails because Git returns a non-zero exit code
- **THEN** Arashi reports that repository as failed with the Git failure details
- **AND** the command exits non-zero if any selected repository failed
- **AND** successful and skipped repositories remain visible in the summary

### Requirement: Repository filtering for push

The `arashi push` command SHALL support the project's standard repository filters so users can publish only explicitly selected repositories, and SHALL reject explicitly supplied filters that normalize to no usable repository or group values before evaluating or publishing repositories.

#### Scenario: Filtered push only considers named repositories
- **WHEN** a user runs `arashi push --only arashi,arashi-docs`
- **THEN** Arashi only evaluates and pushes the named repositories
- **AND** repositories outside the filter are not pushed or reported as failures

#### Scenario: Filtered push rejects unknown repositories
- **WHEN** a user runs `arashi push --only missing-repo`
- **THEN** Arashi exits non-zero with an error identifying the unknown repository selection
- **AND** no repository is pushed

#### Scenario: Push rejects explicitly empty only filter
- **WHEN** publishable repositories exist and a user runs `arashi push --only ,`
- **THEN** Arashi exits non-zero with a usage error identifying `--only` as empty
- **AND** no repository is selected, evaluated for publishing, or pushed

#### Scenario: Push rejects explicitly empty group filter
- **WHEN** publishable repositories exist and a user runs `arashi push --group ,`
- **THEN** Arashi exits non-zero with a usage error identifying `--group` as empty
- **AND** no repository is selected, evaluated for publishing, or pushed
- **AND** JSON mode returns one error envelope with structured details identifying `--group`

#### Scenario: Unfiltered push preserves default selection
- **WHEN** a user runs `arashi push` without `--only` or `--group`
- **THEN** Arashi evaluates the normal default repository set
- **AND** omitted filters are not treated as invalid empty filters

### Requirement: Upstream setup for new branch pushes

The `arashi push` command SHALL support `--set-upstream` for publishing branches that do not yet have upstream tracking configured.

#### Scenario: Set upstream publishes a new branch
- **WHEN** a selected repository is on a local branch with unpublished commits and no upstream
- **AND** a user runs `arashi push --set-upstream`
- **THEN** Arashi pushes the branch to the repository's configured remote with upstream tracking set
- **AND** the summary identifies that upstream tracking was set for the repository

#### Scenario: Missing upstream without set-upstream is skipped with guidance
- **WHEN** a selected repository is on a local branch with unpublished commits and no upstream
- **AND** a user runs `arashi push` without `--set-upstream`
- **THEN** Arashi does not publish that repository
- **AND** the summary explains that `--set-upstream` is required for the new branch

### Requirement: Push dry-run preview

The `arashi push --dry-run` mode SHALL provide a non-mutating preview of selected repository push operations and skipped repositories.

#### Scenario: Dry-run reports planned pushes without mutating remotes
- **WHEN** a user runs `arashi push --dry-run --set-upstream`
- **THEN** Arashi reports which repositories would be pushed and which upstreams would be set
- **AND** no `git push` mutation is performed
- **AND** the output is clearly labeled as a preview

#### Scenario: Dry-run includes skipped reasons
- **WHEN** a dry-run includes repositories that are unchanged, already up to date, or missing upstream setup
- **THEN** Arashi reports those repositories as skipped with their reasons

### Requirement: Push documentation and agent guidance

Arashi documentation and skill guidance SHALL describe when and how to use `arashi push` in the coordinated multi-repo workflow.

#### Scenario: User reads push command documentation
- **WHEN** a user reads the command reference for `push`
- **THEN** the documentation describes default push behavior, `--only`, `--set-upstream`, `--dry-run`, and `--json`
- **AND** the documentation explains that untouched coordinated child repositories are skipped rather than published unnecessarily

#### Scenario: Agent follows Arashi workflow guidance
- **WHEN** an agent prepares cross-repo PRs for an Arashi feature branch
- **THEN** the Arashi skill guidance directs the agent to use `arashi push` to publish relevant coordinated branches before opening PRs
- **AND** the guidance warns against manufacturing remote branches for untouched child repositories

### Requirement: No-upstream publishability uses the effective configured base

When a selected configured repository's current branch has no upstream, `arashi push` SHALL use the refreshed effective configured base as the fallback baseline for determining whether `HEAD` contains publishable branch-unique commits. The base SHALL resolve by repository override then root fallback. If no configured base exists, push SHALL preserve its established remote-default fallback. This comparison MUST NOT change the destination branch, selected remote, or requirement for `--set-upstream`.

#### Scenario: No-upstream branch has commits beyond configured base

- **WHEN** a current branch has no upstream, child `api` configures base `develop`, and `HEAD` contains commits not reachable from refreshed `origin/develop`
- **THEN** push classifies the branch as having publishable commits
- **AND** publishes the current branch only when existing `--set-upstream` requirements are satisfied
- **AND** does not push to `develop`

#### Scenario: No-upstream branch has no commits beyond configured base

- **WHEN** a current no-upstream branch contains no commits beyond its refreshed configured base
- **THEN** push skips it as untouched rather than manufacturing a coordinated remote branch
- **AND** the outcome identifies the configured base as the comparison baseline

#### Scenario: No configured base exists

- **WHEN** a current branch has no upstream and its repository has no configured base
- **THEN** push preserves the existing remote-default publishability fallback

### Requirement: Existing upstream remains authoritative for push

When a current branch has a usable upstream, push SHALL preserve its existing upstream comparison and destination behavior regardless of configured base. Configured base MUST NOT replace the current branch upstream or alter the push refspec.

#### Scenario: Upstream differs from configured base

- **WHEN** a feature branch tracks `origin/feature-api` and its configured base is `origin/develop`
- **THEN** push evaluates and publishes against `origin/feature-api` using existing behavior
- **AND** configured base does not become the destination or upstream

### Requirement: Configured-base comparison failure does not fall back silently

When push needs a no-upstream publishability baseline and an effective configured base exists but cannot be refreshed, resolved, or compared, push SHALL report a per-repository failure/manual-action outcome naming the configured remote base and SHALL NOT fall back to the remote default. Independent repositories SHALL retain existing partial-failure processing.

#### Scenario: Configured base is missing remotely

- **WHEN** a no-upstream branch configures base `develop` but the selected remote lacks that branch
- **THEN** push does not classify the branch from the remote default or stale base state
- **AND** does not create a remote branch
- **AND** reports the repository failure with the selected remote and base branch

#### Scenario: Standalone push runs

- **WHEN** push runs in implicit standalone mode
- **THEN** its established upstream/default behavior remains unchanged
- **AND** no persisted configured-base policy is applied

