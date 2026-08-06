## ADDED Requirements

### Requirement: Status supports explicit repository selection in configured workspaces
`arashi status` SHALL expose repeatable/comma-separated `-o, --only <repo>` selection in configured workspaces and SHALL compose it with `-g, --group <group>` through the shared fail-closed repository filter.

#### Scenario: Status selects named child repositories
- **WHEN** a user runs `arashi status --only arashi-docs` in a configured workspace
- **THEN** status inspection and child-repository output are limited to the selected configured repository
- **AND** unselected child repositories are not fetched or inspected

#### Scenario: Status accepts multiple names
- **WHEN** a user supplies repeated, comma-separated, or mixed `--only` values
- **THEN** status applies the shared normalized selector values exactly once per selected repository

#### Scenario: Status only and group intersect
- **WHEN** a user supplies both `--only` and `--group`
- **THEN** status inspects their existing fail-closed intersection
- **AND** reports unknown, explicitly empty, or empty-intersection errors before repository fetch or inspection

#### Scenario: JSON status preserves effective selection
- **WHEN** a user runs `arashi status --json --only arashi-docs`
- **THEN** stdout contains exactly one JSON envelope
- **AND** repository records and effective-filter metadata agree with the selected set
- **AND** no human progress text is written to stdout

#### Scenario: Status selection is rejected in standalone mode
- **WHEN** an implicit standalone invocation supplies `--only` or `--group`
- **THEN** Arashi rejects configured multi-repository selection before Git fetch or status inspection
- **AND** ordinary standalone status remains unchanged when selectors are omitted

#### Scenario: Parent repository reporting remains explicit
- **WHEN** configured status applies child repository selectors
- **THEN** the command's established main-repository reporting policy remains unchanged and is represented consistently in human summaries and JSON
- **AND** child selection is not misrepresented as selecting or excluding the main repository by child identity
