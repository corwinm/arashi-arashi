## ADDED Requirements

### Requirement: Meta-repo README reflects the consolidated OpenSpec layout
After legacy consolidation, the root `README.md` SHALL describe `openspec/changes/` and `openspec/specs/` as the repository's specification sources and SHALL NOT claim that a tracked top-level `specs/` tree, `.specify/` toolkit, or `/speckit.*` commands remain available.

#### Scenario: User reviews repository layout
- **WHEN** a user reads the root overview, workflow, layout, framework summary, or quick path
- **THEN** those sections consistently describe the OpenSpec-only tracked workflow
- **AND** no active step points to a removed Spec Kit path or command
