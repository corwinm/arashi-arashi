## ADDED Requirements

### Requirement: Explicitly empty repository filters fail safely
The system SHALL distinguish omitted repository filters from explicitly supplied `--only` or `--group` filters that normalize to no usable values, and SHALL reject explicitly empty filters without selecting or mutating repositories.

#### Scenario: Explicitly empty only filter is rejected
- **WHEN** a user runs a repo-selecting command with `--only` supplied as whitespace, commas, or repeated values containing no non-blank repository name
- **THEN** Arashi exits non-zero through the command's usage-error path
- **AND** the output identifies `--only` as an explicitly empty filter
- **AND** no repository is selected or mutated

#### Scenario: Explicitly empty group filter is rejected
- **WHEN** a user runs a repo-selecting command with `--group` supplied as whitespace, commas, or repeated values containing no non-blank group name
- **THEN** Arashi exits non-zero through the command's usage-error path
- **AND** the output identifies `--group` as an explicitly empty filter
- **AND** no repository is selected or mutated

#### Scenario: Both explicitly empty filters are rejected
- **WHEN** a user supplies both `--only` and `--group` and each normalizes to no usable values
- **THEN** Arashi exits non-zero before repository selection or mutation
- **AND** the output identifies both invalid filters

#### Scenario: One empty filter takes precedence over another supplied filter
- **WHEN** one of `--only` or `--group` is explicitly empty and the other contains valid or independently invalid values
- **THEN** Arashi rejects the explicitly empty filter before applying missing-repository, unknown-group, or empty-intersection behavior
- **AND** no repository is selected or mutated

#### Scenario: JSON output identifies explicitly empty filters
- **WHEN** a user supplies an explicitly empty filter to a JSON-capable repo-selecting command with `--json`
- **THEN** stdout contains exactly one JSON error envelope
- **AND** structured error details identify every explicitly empty filter
- **AND** no human progress output is mixed into JSON stdout

#### Scenario: Omitted filters retain default selection
- **WHEN** a user runs a repo-selecting command without `--only` or `--group`
- **THEN** Arashi applies the command's normal default repository selection
- **AND** omission is not reported as an empty-filter error

#### Scenario: Blank segments beside valid values remain valid
- **WHEN** a user supplies a comma-separated or repeated filter containing at least one valid non-blank value plus blank segments
- **THEN** Arashi ignores the blank segments and applies the normalized valid values
- **AND** the filter is not reported as explicitly empty
