## ADDED Requirements

### Requirement: Execute commands across selected repositories

The system SHALL provide an `arashi exec` command that runs a caller-provided child command once for each selected managed repository, using each selected repository path as the child process working directory.

#### Scenario: Command runs in all managed repositories
- **WHEN** a user runs `arashi exec -- git status --short` from a configured Arashi workspace
- **THEN** Arashi executes `git status --short` once in each locally present managed repository selected by the command defaults
- **AND** each child process uses that repository's path as its working directory
- **AND** the command reports one result for each selected repository

#### Scenario: Child command receives arguments after delimiter
- **WHEN** a user runs `arashi exec -- bun run test -- --watch=false`
- **THEN** Arashi treats `bun run test -- --watch=false` as the child command and arguments
- **AND** Arashi does not parse child command flags as Arashi CLI options

#### Scenario: No child command is provided
- **WHEN** a user runs `arashi exec` without a child command after the delimiter
- **THEN** Arashi exits non-zero
- **AND** the output explains that a command must be provided after `--`
- **AND** no repository command is executed

### Requirement: Repository filtering

The system SHALL support repository selection for `arashi exec` so users can run commands across all managed repositories, explicitly selected repositories, or repositories with local changes.

#### Scenario: Only selected repositories are targeted
- **WHEN** a user runs `arashi exec --only arashi-docs -- bun run validate`
- **THEN** Arashi executes the child command only in the managed repository named `arashi-docs`
- **AND** repositories not named by the filter are not executed

#### Scenario: Multiple explicit repositories are targeted
- **WHEN** a user runs `arashi exec --only arashi,arashi-docs -- git status --short`
- **THEN** Arashi executes the child command in `arashi` and `arashi-docs`
- **AND** the command reports an error for any requested repository name that is not configured or locally present

#### Scenario: Dirty repository filter is requested
- **WHEN** a user runs `arashi exec --dirty -- git diff --stat`
- **THEN** Arashi checks the selected managed repositories for local working-tree changes before execution
- **AND** Arashi executes the child command only in repositories that have local changes
- **AND** clean repositories are reported as skipped or omitted according to the documented human and JSON output modes

#### Scenario: Dirty filter matches no repositories
- **WHEN** a user runs `arashi exec --dirty -- git diff --stat` and no selected repository has local changes
- **THEN** Arashi exits successfully without running the child command
- **AND** the output explains that no dirty repositories matched

### Requirement: Human output grouping

The system SHALL present human `arashi exec` output in repository-scoped groups so users can identify which repository produced each child command output and result.

#### Scenario: Command succeeds in human mode
- **WHEN** a user runs `arashi exec -- git status --short` and all child commands exit successfully
- **THEN** human stdout includes a clearly labeled section for each selected repository that produced output or a documented empty-output marker
- **AND** the final summary reports the number of successful, failed, and skipped repositories
- **AND** the Arashi process exits with status code 0

#### Scenario: Command fails in one repository
- **WHEN** a user runs `arashi exec -- bun run test` and the child command exits non-zero in one selected repository
- **THEN** human output identifies the failing repository and its child exit code
- **AND** output from other executed repositories remains grouped under their repository names
- **AND** the final summary reports the failure
- **AND** the Arashi process exits non-zero

### Requirement: Parallel execution controls

The system SHALL support bounded parallel execution for `arashi exec` while preserving per-repository result reporting.

#### Scenario: Bounded parallelism is requested
- **WHEN** a user runs `arashi exec --jobs 4 -- bun run test`
- **THEN** Arashi runs at most four child commands concurrently
- **AND** every selected repository is executed unless fail-fast prevents scheduling additional repositories
- **AND** the reported results remain associated with the correct repository

#### Scenario: Invalid jobs value is provided
- **WHEN** a user runs `arashi exec --jobs 0 -- git status --short`
- **THEN** Arashi exits non-zero before running child commands
- **AND** the output explains that `--jobs` must be a positive integer

### Requirement: Fail-fast execution

The system SHALL support `--fail-fast` for `arashi exec` to stop scheduling additional repository executions after the first child command failure.

#### Scenario: Fail-fast stops later serial execution
- **WHEN** a user runs `arashi exec --fail-fast -- bun run test` and a selected repository fails during serial execution
- **THEN** Arashi does not start child commands for later selected repositories
- **AND** the final summary reports executed failures and unstarted repositories
- **AND** the Arashi process exits non-zero

#### Scenario: Fail-fast with parallel execution
- **WHEN** a user runs `arashi exec --jobs 4 --fail-fast -- bun run test` and one child command fails
- **THEN** Arashi stops scheduling additional repositories after observing the failure
- **AND** already-running child commands are allowed to finish and are included in the reported results
- **AND** repositories not started because of fail-fast are reported as skipped or not started

### Requirement: Documentation and agent guidance

The system SHALL document `arashi exec` for human users and automation consumers.

#### Scenario: User reads command documentation
- **WHEN** a user opens the Arashi command documentation
- **THEN** `arashi exec` is listed with examples for all repositories, `--only`, `--dirty`, `--jobs`, `--fail-fast`, and `--json`
- **AND** the documentation states that the child command follows `--` and runs with each selected repository as its working directory

#### Scenario: Agent consults Arashi skill guidance
- **WHEN** an agent reads the Arashi skill package
- **THEN** the guidance describes when to use `arashi exec` for repeated multi-repo validation or inspection commands
- **AND** the guidance cautions agents to use explicit filters for mutating or expensive commands
