# docs-agent-readable-exports Delta Specification

## ADDED Requirements

### Requirement: Agent-readable exports carry canonical uninstall safety

Generated command Markdown routes, installation and shell workflow routes, `/llms.txt`, and `/llms-full.txt` SHALL make uninstall discoverable and preserve the canonical command spellings, channel distinctions, exact package-manager commands, hosted script routes, inspection/consent/JSON policy, migration boundary, ownership refusals, retry guidance, and project-preservation guarantees from authored sources. Generated exports MUST NOT recommend heuristic or recursive deletion.

#### Scenario: Agent discovers product uninstall

- **WHEN** an agent reads the curated entrypoint or full export
- **THEN** it can find the canonical uninstall command page and distinguish direct, package-manager, and manual recovery paths
- **AND** it is told to inspect ownership rather than delete paths heuristically

#### Scenario: Agent discovers shell-only removal

- **WHEN** an agent reads shell integration guidance or its generated Markdown route
- **THEN** it receives the same exact-block, non-payload, inspection, and consent contract as the authored source

#### Scenario: Export is stale

- **WHEN** authored uninstall guidance or command policy changes without regenerated exports
- **THEN** source/export freshness and registered semantic validation exit unsuccessfully
