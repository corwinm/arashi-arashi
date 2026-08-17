## ADDED Requirements

### Requirement: Agent-readable exports include repository materialization guidance
Canonical website generation SHALL include repository worktree materialization guidance in agent-readable Markdown exports and `/llms.txt` discovery using the same field names, configured-only scope, source ownership, lifecycle ordering, safety, output, and copy-versus-symlink recommendations as maintained user documentation.

#### Scenario: Agent discovers materialization guidance
- **WHEN** an automation consumer follows `/llms.txt` or a canonical Markdown route for configuration/create guidance
- **THEN** it can discover direct `repos.<name>.copy` and `repos.<name>.symlink` arrays and their same-relative-path behavior
- **AND** it receives canonical safety and lifecycle guidance rather than generated implementation details

#### Scenario: Generated export is stale
- **WHEN** maintained materialization guidance changes without regenerating agent-readable output
- **THEN** docs freshness or semantic validation fails before publication

#### Scenario: Export invents unsupported behavior
- **WHEN** a generated or authored agent surface claims globs, remapping, external sources, implicit fallback, or standalone support
- **THEN** registered docs semantic validation identifies the contradiction and exits unsuccessfully
