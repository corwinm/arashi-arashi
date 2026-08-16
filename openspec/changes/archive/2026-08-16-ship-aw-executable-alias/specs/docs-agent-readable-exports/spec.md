## ADDED Requirements

### Requirement: Agent-readable exports carry executable alias guidance

Generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL identify `aw` concisely as a shorter alias for `arashi`, preserve `arashi` as canonical, and route agents to current installation and shell guidance without teaching a user-created shell alias as equivalent support.

#### Scenario: Agent fetches the curated entrypoint

- **WHEN** an agent requests `/llms.txt`
- **THEN** concise guidance states that supported installations provide `arashi` and `aw` while canonical examples continue to use `arashi`
- **AND** links to getting-started or installation guidance for channel and collision details

#### Scenario: Agent fetches generated installation Markdown

- **WHEN** an agent requests the relevant getting-started, installation, shell, or troubleshooting `.md` route or reads `/llms-full.txt`
- **THEN** the export describes npm, POSIX, and Windows alias availability, one-native-binary ownership, shell integration/completion, and collision-safe direct installation consistently with authored docs

#### Scenario: Generated alias guidance is stale

- **WHEN** authored documentation changes alias naming, canonical identity, installation channel, shell behavior, or manual payload requirements without regenerating exports
- **THEN** docs validation reports the stale generated route or export and exits unsuccessfully
