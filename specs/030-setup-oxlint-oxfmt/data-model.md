# Data Model: Linter and Formatter Setup

## Entities

### Code Quality Rule Set

- **Represents**: The approved linting and formatting standards used for local checks and pull request validation.
- **Fields**:
  - **Rule Set Name**: Human-readable identifier for the ruleset.
  - **Lint Rule Profile**: Enabled lint categories and severity levels.
  - **Format Rule Profile**: Canonical formatting style settings.
  - **Ignore Patterns**: File and directory patterns excluded from checks.
  - **Version Pin**: Tool version(s) used to ensure deterministic results.
- **Validation Rules**:
  - Lint and format profiles must be explicitly defined.
  - Ignore patterns must not exclude primary source or test directories by default.
  - Version pin must be present for deterministic local and CI behavior.

### Quality Check Run

- **Represents**: A single invocation of linting, formatting, or combined quality validation.
- **Fields**:
  - **Run ID**: Unique identifier for the check execution.
  - **Run Scope**: Full repository or filtered file subset.
  - **Check Type**: lint, format, or combined validation.
  - **Started At**: Execution start timestamp.
  - **Finished At**: Execution end timestamp.
  - **Duration**: Total elapsed runtime.
  - **Outcome**: passed or failed.
  - **Issue Count**: Number of violations detected.
  - **Issue Details**: File-level diagnostics including location and rule/category.
- **Validation Rules**:
  - Duration must be non-negative.
  - Failed runs must contain at least one issue or execution error detail.
  - Passed runs must not include blocking violations.

### Validation Outcome

- **Represents**: The merge-gating decision generated from pull request quality checks.
- **Fields**:
  - **Pull Request Identifier**: Unique pull request reference.
  - **Lint Status**: pass or fail.
  - **Format Status**: pass or fail.
  - **Overall Gate Status**: pass or fail.
  - **Failure Summary**: Contributor-facing explanation of what must be fixed.
  - **Evaluated At**: Timestamp of decision.
- **Validation Rules**:
  - Overall Gate Status must be fail if either lint or format status is fail.
  - Failure Summary is required whenever Overall Gate Status is fail.

## Relationships

- A Code Quality Rule Set governs many Quality Check Runs.
- A Validation Outcome references one or more Quality Check Runs for the same pull request event.
- A Validation Outcome consumes lint and format run outcomes to compute the final gate decision.

## State Transitions

- **Code Quality Rule Set**: drafted -> approved -> active -> revised.
- **Quality Check Run**: queued -> running -> passed | failed.
- **Validation Outcome**: pending -> evaluated -> pass | fail.
