# Data Model: Setup Command

## Entities

### Repository Setup Target

- **Represents**: A repository considered for setup execution in the current command run.
- **Fields**:
  - **Repository Name**: Unique repository identifier used for selection and reporting.
  - **Repository Path**: Workspace path to the repository.
  - **Has Setup Task**: Indicates whether a setup task is defined and executable.
  - **Selection Status**: Included or excluded based on user filter input.
  - **Scope Type**: Main repository or sub-repository.
- **Validation Rules**:
  - Repository Name and Repository Path must be present.
  - Selection Status must be explicit before execution begins.

### Setup Task Execution

- **Represents**: One attempted setup task execution for a selected repository.
- **Fields**:
  - **Repository Name**: Repository this execution belongs to.
  - **Started At**: Execution start timestamp.
  - **Finished At**: Execution end timestamp.
  - **Duration**: Elapsed execution time.
  - **Output Mode**: Normal or verbose output mode.
  - **Execution Status**: success, skipped, failed, or timed-out.
  - **Failure Detail**: Optional diagnostic reason for failed or timed-out execution.
- **Validation Rules**:
  - Duration must be non-negative.
  - Failed and timed-out statuses must include Failure Detail when available.
  - Skipped status must not be recorded as successful.

### Setup Run Summary

- **Represents**: Aggregated result for a full setup command invocation.
- **Fields**:
  - **Overall Status**: Success, partial-failure, or failure.
  - **Total Repositories Evaluated**: Count of repositories considered.
  - **Executed Count**: Count of repositories with setup execution attempts.
  - **Success Count**: Count of successful setup executions.
  - **Skipped Count**: Count of repositories skipped due to missing setup task or out-of-scope selection.
  - **Failed Count**: Count of repositories with setup failures.
  - **Timed-out Count**: Count of repositories that exceeded timeout.
  - **Execution Results**: Collection of Setup Task Execution entities.
- **Validation Rules**:
  - Summary counts must equal the total of execution result classifications.
  - Overall Status must reflect presence of failed or timed-out results.

## Relationships

- A Setup Run Summary includes one or more Repository Setup Targets.
- A Repository Setup Target has zero or one Setup Task Execution for a given command run.
- A Setup Run Summary aggregates all Setup Task Execution results for selected targets.

## State Transitions

- **Repository Setup Target**: discovered -> selected/excluded -> eligible/skipped.
- **Setup Task Execution**: pending -> running -> success | failed | timed-out | skipped.
- **Setup Run Summary**: initializing -> executing -> completed.
