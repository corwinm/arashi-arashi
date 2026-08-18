## ADDED Requirements

### Requirement: VS Code guidance uses aw for terminal examples
Maintained VS Code README, walkthrough, settings descriptions, and user-facing terminal examples SHALL use `aw` for recommended CLI invocations while preserving extension command IDs, setting IDs, product labels, executable discovery defaults, and native binary names.

#### Scenario: Extension user follows terminal guidance
- **WHEN** a user copies a CLI command from a maintained extension surface
- **THEN** the executable spelling is `aw`
- **AND** `arashi.*` extension identifiers and configured binary-path behavior remain unchanged
