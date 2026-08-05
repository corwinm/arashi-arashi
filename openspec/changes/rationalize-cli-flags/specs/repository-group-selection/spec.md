## ADDED Requirements

### Requirement: Repository selectors accept repeated and comma-separated values consistently
Every command that registers `--only` or `--group` SHALL accept repeated option occurrences, comma-separated values within an occurrence, or both together. Shared normalization SHALL preserve the existing distinction between omission and explicitly empty input and SHALL retain all fail-closed repository and group selection requirements.

#### Scenario: Repeated values are normalized
- **WHEN** a user supplies `--only arashi --only arashi-docs` or `--group core --group docs`
- **THEN** the command applies both requested normalized values in encounter order

#### Scenario: Comma-separated values are normalized
- **WHEN** a user supplies `--only arashi,arashi-docs` or `--group core,docs`
- **THEN** the command applies the same values as the equivalent repeated invocation

#### Scenario: Repeated and comma-separated values are mixed
- **WHEN** a user supplies `--only arashi,arashi-docs --only arashi-vscode` or the corresponding group form
- **THEN** normalization flattens every occurrence and segment into one ordered selector set
- **AND** duplicate normalized values do not cause duplicate repository work

#### Scenario: Blank segments accompany valid values
- **WHEN** supplied selector occurrences contain commas or whitespace alongside at least one valid value
- **THEN** blank segments are ignored and valid values are applied
- **AND** the selector is not misclassified as explicitly empty

#### Scenario: Explicitly empty input remains fail-closed
- **WHEN** one or more supplied occurrences normalize to no usable values overall
- **THEN** the command reports the existing explicit-empty usage error before selection or mutation
- **AND** does not reinterpret the option as omitted

#### Scenario: Short selector aliases use identical normalization
- **WHEN** a user supplies `-o` or `-g`, including repeated and comma-separated forms
- **THEN** normalization, unknown-value errors, intersection behavior, standalone restrictions, JSON errors, and non-mutation guarantees are identical to `--only` or `--group`

### Requirement: Selector normalization preserves filter authority
Normalization SHALL NOT weaken unknown repository/group errors, explicit `--only` and `--group` intersection, empty-intersection rejection, configured-workspace requirements, or command-specific default selection.

#### Scenario: Valid only and group values intersect
- **WHEN** normalized `--only` and `--group` values are both supplied
- **THEN** Arashi selects their intersection using the existing fail-closed policy

#### Scenario: Unknown values remain errors
- **WHEN** normalization produces an unknown repository identity or group
- **THEN** Arashi reports the existing missing/unknown selection error
- **AND** does not drop the unknown value silently

#### Scenario: Omitted selectors retain defaults
- **WHEN** neither selector is supplied
- **THEN** the command preserves its normal default repository selection
