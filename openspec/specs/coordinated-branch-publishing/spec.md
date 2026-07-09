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

The `arashi push` command SHALL support the project's standard repository filter so users can publish only explicitly selected repositories.

#### Scenario: Filtered push only considers named repositories
- **WHEN** a user runs `arashi push --only arashi,arashi-docs`
- **THEN** Arashi only evaluates and pushes the named repositories
- **AND** repositories outside the filter are not pushed or reported as failures

#### Scenario: Filtered push rejects unknown repositories
- **WHEN** a user runs `arashi push --only missing-repo`
- **THEN** Arashi exits non-zero with an error identifying the unknown repository selection
- **AND** no repository is pushed

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

