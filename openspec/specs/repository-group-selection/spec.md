# repository-group-selection Specification

## Purpose
Define how managed repositories declare group membership and how repository-selecting commands apply `--group` and `--only` filters consistently and safely.
## Requirements
### Requirement: Repository configuration supports group membership
The system SHALL allow each managed repository configuration entry to declare zero or more repository groups while preserving existing configuration compatibility.

#### Scenario: Repository declares multiple groups
- **WHEN** `.arashi/config.json` defines a repository with `"groups": ["core", "cli"]`
- **THEN** Arashi loads the repository successfully
- **AND** the repository is considered a member of both `core` and `cli`
- **AND** existing repository fields such as `path` and `gitUrl` retain their current behavior

#### Scenario: Repository omits groups
- **WHEN** `.arashi/config.json` defines a repository without a `groups` field
- **THEN** Arashi loads the repository successfully
- **AND** the repository is treated as having no group membership

#### Scenario: Repository group values are invalid
- **WHEN** `.arashi/config.json` defines a repository with a blank group name, non-string group value, or duplicate group after normalization
- **THEN** Arashi rejects the configuration with a validation error identifying the repository and invalid group entry

### Requirement: Commands can select repositories by group
The system SHALL provide a consistent `--group <group>` filter for commands that operate across selected managed repositories.

#### Scenario: Group filter selects matching repositories
- **WHEN** a workspace has repositories in the `docs` group
- **AND** the user runs `arashi status --group docs`
- **THEN** Arashi inspects only repositories that declare membership in the `docs` group
- **AND** repositories outside the `docs` group are not included in the status summary

#### Scenario: Group filter supports multiple requested groups
- **WHEN** a workspace has repositories in `core`, `docs`, and `extensions` groups
- **AND** the user runs `arashi exec --group core --group docs -- bun run validate`
- **THEN** Arashi selects repositories that belong to either `core` or `docs`
- **AND** repositories that belong only to `extensions` are not executed

#### Scenario: Group filter is available on repo-selecting commands
- **WHEN** a user views help for a command that selects managed repositories, such as `status`, `create`, `exec`, `push`, `pull`, `setup`, or `sync`
- **THEN** the command documents a `--group <group>` option
- **AND** the option description says it filters to repositories in the requested group

#### Scenario: Group filter is not added to commands without repository selection
- **WHEN** a user views help for a command whose primary target is not a managed repository set
- **THEN** the command does not need to expose `--group`
- **AND** existing command behavior remains unchanged

### Requirement: Group filters compose predictably with explicit repository filters
The system SHALL compose group-based filters with explicit repository-name filters by intersection.

#### Scenario: Explicit and group filters intersect
- **WHEN** `arashi`, `arashi-docs`, and `arashi-vscode` are configured repositories
- **AND** only `arashi-docs` belongs to the `docs` group
- **AND** the user runs `arashi exec --only arashi,arashi-docs --group docs -- git status --short`
- **THEN** Arashi executes the child command only in `arashi-docs`
- **AND** `arashi` is skipped because it does not match the requested group

#### Scenario: Valid filters produce an empty intersection
- **WHEN** `arashi-docs` belongs to `docs`
- **AND** `arashi` belongs to `core`
- **AND** the user runs a mutating command with `--only arashi --group docs`
- **THEN** Arashi exits non-zero before mutating repositories
- **AND** the output explains that no repositories matched the combined filters

#### Scenario: Existing explicit filters continue working
- **WHEN** a user runs a repo-selecting command with `--only arashi-docs` and no `--group`
- **THEN** Arashi selects the explicitly named repository using existing `--only` semantics
- **AND** no group membership is required

### Requirement: Unknown groups are reported clearly
The system SHALL treat requested groups with no configured repository membership as selection errors rather than silently selecting nothing.

#### Scenario: Human output reports unknown group
- **WHEN** the user runs `arashi status --group missing-group`
- **THEN** Arashi exits non-zero
- **AND** human output identifies `missing-group` as an unknown repository group
- **AND** no repository status is reported as if the workspace were clean

#### Scenario: JSON output reports unknown group
- **WHEN** the user runs `arashi exec --json --group missing-group -- git status --short`
- **THEN** stdout contains one JSON error envelope
- **AND** the structured error details include `missing-group` in an unknown or missing groups field
- **AND** no child command is executed

### Requirement: Output exposes effective group selection
The system SHALL make group-based selection visible in command output without mixing human text into JSON stdout.

#### Scenario: Human output summarizes group selection
- **WHEN** the user runs `arashi create feat/example --group core --dry-run`
- **THEN** human output identifies that the operation is filtered to the `core` group
- **AND** selected and skipped repositories remain clear in the operation summary

#### Scenario: JSON output includes effective filters
- **WHEN** the user runs a JSON-capable repo-selecting command with `--group docs`
- **THEN** the JSON payload or error details include the effective group filter values
- **AND** selected repository records remain machine-readable
- **AND** stdout contains only the JSON document required by the command's existing JSON contract

### Requirement: Documentation and skill guidance describe repository groups
The system SHALL document repository groups for both human users and automation agents.

#### Scenario: User reads configuration documentation
- **WHEN** a user opens the Arashi configuration documentation
- **THEN** it shows how to add `groups` arrays to repository entries
- **AND** it includes examples for common group layouts such as `core`, `docs`, `extensions`, `agents`, and `infra`

#### Scenario: User reads command documentation
- **WHEN** a user opens command documentation for repo-selecting commands
- **THEN** the documentation includes examples such as `arashi status --group docs`, `arashi create feat/example --group core`, and `arashi exec --group docs -- bun run validate`
- **AND** it explains that `--group` narrows `--only` when both are supplied

#### Scenario: Agent reads Arashi skill guidance
- **WHEN** an agent consults the Arashi skill package before running multi-repo commands
- **THEN** the guidance describes when to use `--group` instead of enumerating repositories with `--only`
- **AND** it cautions agents to use explicit group filters for expensive or mutating commands when a relevant group exists

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

### Requirement: Repository and group filters require configured selection context
Arashi MUST reject repository-name, group, or interactive multi-repository selection options in implicit standalone mode when the command cannot assign those options meaningful single-repository semantics.

#### Scenario: Only filter is supplied
- **WHEN** a standalone lifecycle invocation supplies `--only`
- **THEN** Arashi returns an actionable usage error before mutation
- **AND** does not silently select, exclude, or rename the standalone repository

#### Scenario: Group filter is supplied
- **WHEN** a standalone lifecycle invocation supplies `--group`
- **THEN** Arashi explains that groups require configured workspace repository metadata
- **AND** suggests ordinary `arashi init` when coordination is needed

#### Scenario: Interactive repository selection is requested
- **WHEN** standalone create requests interactive multi-repository selection
- **THEN** Arashi rejects the meaningless selection mode without prompting or broadening scope

#### Scenario: Switch repository collection flags are supplied
- **WHEN** standalone switch receives `--repos` or `--all`
- **THEN** Arashi rejects the configured multi-repository scope before target discovery or launch
- **AND** preserves ordinary single-repository switch behavior without those flags

#### Scenario: Configured filters are used
- **WHEN** the workspace is configured
- **THEN** existing name/group intersection, unknown, empty, and no-match behavior remains unchanged

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
