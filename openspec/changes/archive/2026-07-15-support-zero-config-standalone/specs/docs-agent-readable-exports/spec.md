## ADDED Requirements

### Requirement: Agent-readable exports include standalone workflow guidance
Generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL make the supported zero-config standalone workflow discoverable from authored documentation.

#### Scenario: Agent fetches standalone workflow Markdown
- **WHEN** an agent requests the standalone workflow's `.md` route
- **THEN** the response includes explicit CLI bootstrap, supported lifecycle commands, `.worktrees/<branch>` layout, ignore safety, configured-mode contrast, and upgrade guidance

#### Scenario: Agent fetches the curated entrypoint
- **WHEN** an agent requests `/llms.txt`
- **THEN** the curated guidance links directly or through a high-priority workflow index to zero-config standalone usage
- **AND** does not describe configured meta-repositories as the only valid Arashi workflow

#### Scenario: Full export is regenerated
- **WHEN** documentation validation generates `/llms-full.txt`
- **THEN** the standalone workflow and updated Getting Started and command guidance appear in the deterministic export
- **AND** validation fails when required standalone source pages or generated routes are stale or missing
