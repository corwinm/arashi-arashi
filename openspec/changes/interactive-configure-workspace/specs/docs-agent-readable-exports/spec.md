## ADDED Requirements

### Requirement: Generated agent-readable exports include configure behavior

Generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL carry canonical `aw configure` guidance from the owning docs source, including explicit supported scopes, configured/effective distinction, keep/edit/clear actions, TTY-only editing, exact final preview, non-mutating JSON inspection, and the unsupported-field boundary.

#### Scenario: Agent-readable exports are generated

- **WHEN** the canonical docs generator runs
- **THEN** each maintained discovery export includes or links to the configure command contract
- **AND** no generated surface exposes inline command bodies or claims implicit mutation

#### Scenario: Authored guidance changes without regeneration

- **WHEN** canonical configure guidance changes but generated exports are stale
- **THEN** repository-local freshness or semantic validation fails
- **AND** reports the owning generated surface
