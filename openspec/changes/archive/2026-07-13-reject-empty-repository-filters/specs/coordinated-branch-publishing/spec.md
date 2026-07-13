## MODIFIED Requirements

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
