## ADDED Requirements

### Requirement: Exec JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi exec --json` using the standard single-document JSON envelope and per-repository execution details.

#### Scenario: Exec JSON succeeds for all repositories
- **WHEN** a user runs `arashi exec --json -- git status --short` and all selected repository commands exit successfully
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "exec"`
- **AND** the data object includes the child command arguments, effective execution options, selected repository list, per-repository results, and aggregate totals
- **AND** each per-repository result includes repository name, path, execution status, child exit code, stdout, stderr, and duration information
- **AND** no grouped human output, progress text, or prompts are mixed into stdout

#### Scenario: Exec JSON reports child command failure
- **WHEN** a user runs `arashi exec --json -- bun run test` and one or more selected repository commands exit non-zero
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "exec"`
- **AND** the data or error details identify each failed repository and its child exit code
- **AND** successful and skipped repository results remain available in the JSON payload
- **AND** the Arashi process exits non-zero

#### Scenario: Exec JSON reports selection or validation error
- **WHEN** a user runs `arashi exec --json` with invalid options, missing child command arguments, missing selected repositories, or an invalid `--jobs` value
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "exec"`
- **AND** the structured error identifies the validation or selection problem
- **AND** no repository child command is executed

#### Scenario: Exec JSON with fail-fast leaves repositories unstarted
- **WHEN** a user runs `arashi exec --json --fail-fast --jobs 2 -- bun run test` and fail-fast prevents one or more selected repositories from starting
- **THEN** the JSON payload distinguishes successful, failed, skipped, and not-started repository results
- **AND** the payload identifies that fail-fast caused the not-started results
