## ADDED Requirements

### Requirement: Canonical docs explain configured path budgeting

Canonical configuration and create guidance SHALL document optional `worktreeNaming.maxPathLength` with one exact nested JSON example, positive-integer validation, UTF-16 absolute-destination scope, deterministic readable-prefix plus eight-hex SHA-256 shortening, complete coordinated-child sizing, omission preservation, structured impossible-budget failure, unchanged Git branches/existing worktrees/standalone behavior, and the fact that repository-internal file paths are not guaranteed to fit.

#### Scenario: User configures a Windows-oriented reserve

- **WHEN** a user reads canonical configuration or create guidance
- **THEN** the guidance explains that the numeric budget covers each absolute configured worktree root rather than one folder component
- **AND** provides a copyable nested configuration example
- **AND** does not claim that enabling this field or Windows long paths protects every downstream tool or repository file

#### Scenario: Documentation preserves compatibility boundaries

- **WHEN** path-budget guidance is generated or reviewed
- **THEN** it states that omission preserves current names, only newly planned configured paths may shorten, children share one authoritative parent, Git branches stay exact, existing worktrees are not renamed, and standalone is unchanged
