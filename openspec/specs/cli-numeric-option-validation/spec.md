# cli-numeric-option-validation Specification

## Purpose
Define strict validation requirements for CLI numeric options that bound filesystem traversal so malformed values fail before repository discovery begins.

## Requirements
### Requirement: Filesystem depth options reject malformed values
The CLI MUST validate numeric options that bound filesystem traversal before command execution. The `list --max-depth` option SHALL accept only non-negative safe integers and SHALL provide the validated number to repository discovery.

#### Scenario: Valid positive depth
- **WHEN** a user runs `arashi list --max-depth 3`
- **THEN** the list command receives a maximum depth of `3`

#### Scenario: Valid zero depth
- **WHEN** a user runs `arashi list --max-depth 0`
- **THEN** the list command receives a maximum depth of `0`

#### Scenario: Non-numeric depth
- **WHEN** a user supplies a non-numeric value such as `abc`
- **THEN** the CLI exits with an invalid-argument error before repository discovery begins

#### Scenario: Partially numeric or fractional depth
- **WHEN** a user supplies a value such as `2junk` or `1.5`
- **THEN** the CLI exits with an invalid-argument error before repository discovery begins

#### Scenario: Negative or unsafe depth
- **WHEN** a user supplies a negative integer or an integer larger than JavaScript can represent safely
- **THEN** the CLI exits with an invalid-argument error before repository discovery begins

