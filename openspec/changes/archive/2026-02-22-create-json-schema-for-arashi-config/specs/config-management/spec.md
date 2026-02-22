## MODIFIED Requirements

### Requirement: Configuration persistence uses canonical camelCase keys
The system MUST persist `.arashi/config.json` using canonical camelCase keys for all root and nested properties, including `reposDir`, `autoSetup`, and repository-level fields such as `gitUrl`.

#### Scenario: New config is written in canonical key format
- **WHEN** the system initializes a new config file
- **THEN** the written JSON uses canonical camelCase keys only

#### Scenario: Existing config is saved after mutation
- **WHEN** a loaded config is modified and saved
- **THEN** the saved file is normalized to canonical camelCase keys

### Requirement: Repository collection key is `repos`
The system MUST use `repos` as the canonical root repository map key in persisted configuration and internal normalized representation.

#### Scenario: Config save writes repository map as repos
- **WHEN** one or more repositories are present in configuration
- **THEN** persisted config stores them under `repos`

#### Scenario: Legacy repository map key is accepted for compatibility
- **WHEN** a legacy config contains `discovered_repos` or `discoveredRepos`
- **THEN** load normalization maps entries to canonical `repos` without data loss

### Requirement: Derived repository metadata is not persisted
The system MUST NOT persist repository metadata fields that are derivable from live git state, including `defaultBranch`, `isBare`, and `worktrees`, unless explicitly reintroduced by a future requirement.

#### Scenario: Save omits derived metadata fields
- **WHEN** repository entries in memory include derived metadata values
- **THEN** persisted config excludes those fields

#### Scenario: Runtime still functions without persisted derived metadata
- **WHEN** commands require branch, bare, or worktree state
- **THEN** the system resolves that state from git/runtime sources rather than expecting persisted cache fields

### Requirement: Legacy config keys remain readable during migration
The system MUST load legacy snake_case configuration keys for backward compatibility and normalize them into canonical keys before validation and downstream use.

#### Scenario: Legacy config loads successfully
- **WHEN** a workspace contains a valid legacy snake_case config
- **THEN** config loading succeeds and returns canonical normalized structure

#### Scenario: Invalid legacy shape still fails validation
- **WHEN** a legacy config has missing required fields or invalid types
- **THEN** validation fails with actionable errors referencing the invalid fields
