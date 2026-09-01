## ADDED Requirements

### Requirement: Workspace configuration loads from the canonical path with actionable validation
Configured commands SHALL resolve `.arashi/config.json` from the canonical workspace authority, parse JSON, and validate the maintained schema before command mutation. Missing, malformed, or invalid configuration SHALL produce an actionable error identifying the file and relevant parse or field failure.

#### Scenario: Valid configuration loads
- **WHEN** a configured command resolves a valid `.arashi/config.json`
- **THEN** the normalized configuration is available to command planning

#### Scenario: Configuration is malformed
- **WHEN** the canonical configuration contains malformed JSON
- **THEN** loading fails before command mutation with the configuration path and parse detail

### Requirement: Configuration persistence is human-readable and preserves unrelated state
A configuration save SHALL create the owned `.arashi` directory when permitted, serialize deterministic indented JSON with a trailing newline, preserve schema-valid fields unrelated to the requested edit, and preserve unknown fields accepted for forward compatibility unless a separately specified migration removes them. Save failures SHALL leave the previous file recoverable and report the filesystem cause.

#### Scenario: One supported field changes
- **WHEN** a command saves a validated change to one supported configuration field
- **THEN** unrelated supported and accepted unknown fields retain their values
- **AND** the resulting file is deterministic indented JSON that can be loaded again

#### Scenario: Save cannot complete
- **WHEN** permissions, storage, or an atomic replacement failure prevents persistence
- **THEN** the command reports the configuration path and underlying failure
- **AND** does not claim that the requested configuration was saved

### Requirement: Repository keys are unique and explicit
The `repos` object SHALL use unique canonical keys for managed repositories. A command adding a repository SHALL reject a duplicate exact key before cloning or persistence unless a separately specified edit workflow owns modification of that existing entry.

#### Scenario: Duplicate add key is requested
- **WHEN** `aw add` resolves a repository name equal to an existing canonical `repos` key
- **THEN** add fails before clone or configuration mutation and directs the user to choose another name or the supported edit workflow
