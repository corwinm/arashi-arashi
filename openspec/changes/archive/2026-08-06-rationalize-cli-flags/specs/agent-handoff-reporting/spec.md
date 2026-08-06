## ADDED Requirements

### Requirement: Explicit Markdown spelling is deprecated without changing default output
`arashi handoff` SHALL continue to emit Markdown by default and SHALL treat `--markdown` as a deprecated compatibility spelling throughout Arashi 1.x rather than as a distinct output mode. Removal MUST occur no earlier than Arashi 2.0 through a separately approved breaking-change issue.

#### Scenario: Handoff defaults to Markdown
- **WHEN** a user runs `arashi handoff` without a format option
- **THEN** Arashi emits the existing non-mutating Markdown report
- **AND** no explicit Markdown flag is required

#### Scenario: Deprecated Markdown spelling remains compatible
- **WHEN** a user runs `arashi handoff --markdown` during Arashi 1.x
- **THEN** Arashi emits the same report, exit code, and side effects as `arashi handoff`
- **AND** preferred help and examples do not teach `--markdown`

#### Scenario: JSON and deprecated Markdown are combined
- **WHEN** a user runs `arashi handoff --json --markdown`
- **THEN** the existing JSON selection remains authoritative throughout Arashi 1.x
- **AND** stdout contains exactly one valid JSON envelope with no human deprecation text

#### Scenario: Migration guidance is published
- **WHEN** users read release notes or command migration guidance
- **THEN** the guidance tells them to omit `--markdown` because Markdown is the default
- **AND** identifies Arashi 2.0 as the earliest removal boundary and the separately approved breaking-change issue required for eventual removal
