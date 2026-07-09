## ADDED Requirements

### Requirement: Push JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi push --json` and `arashi push --dry-run --json` using the standard JSON envelope and stdout-isolation contract.

#### Scenario: Push JSON succeeds
- **WHEN** a user runs `arashi push --json` and all selected repositories are pushed or skipped without failures
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "push"`
- **AND** the data object includes per-repository results, effective options, aggregate totals, and warnings if any repositories were skipped
- **AND** no human-readable progress, spinners, or summaries are mixed into stdout

#### Scenario: Push JSON reports partial failure
- **WHEN** a user runs `arashi push --json` and one or more selected repository pushes fail
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "push"`
- **AND** the data or error details identify each failed repository and preserve successful or skipped repository results
- **AND** the process exits non-zero

#### Scenario: Push dry-run JSON is non-mutating
- **WHEN** a user runs `arashi push --dry-run --json --set-upstream`
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "push"`
- **AND** the data object includes `dryRun: true`, effective options, planned push operations, skipped repositories, and aggregate totals
- **AND** no remote branch is created or updated

#### Scenario: Push JSON remains non-interactive
- **WHEN** a user runs `arashi push --json` and required repository selection or upstream information is ambiguous
- **THEN** the command exits non-zero with a structured error or skipped repository result that explains how automation can retry with explicit flags such as `--only` or `--set-upstream`
- **AND** the command does not prompt for interactive input
