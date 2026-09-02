## ADDED Requirements

### Requirement: Add validates identity before cloning
Configured `aw add <git-url>` SHALL validate that the remote is a supported Git URL, derive the default repository key from the final remote path segment without a `.git` suffix unless `--name` supplies an explicit valid key, and reject duplicate keys or occupied canonical destinations before starting a clone.

#### Scenario: Name is derived from the remote
- **WHEN** a user adds `ssh://git@example.com/acme/widget.git` without `--name`
- **THEN** add uses `widget` as the candidate canonical repository key and destination name

#### Scenario: Duplicate key is detected
- **WHEN** the candidate key already exists in workspace configuration
- **THEN** add fails before cloning and reports the conflicting key

### Requirement: Add persists only a successfully inspected clone
After a clone succeeds, add SHALL inspect the repository's canonical remote and default branch, complete any topology-specific materialization and accepted onboarding plan, and then persist one validated repository entry containing the exact remote and configuration-relative path. Clone, inspection, materialization, onboarding, or persistence failure SHALL not leave a partial configuration entry.

#### Scenario: Basic add succeeds
- **WHEN** a supported remote clones successfully and no optional onboarding is accepted
- **THEN** add persists one minimal repository entry with its exact remote and relative path
- **AND** reports the repository key, location, and detected default branch

#### Scenario: Clone fails
- **WHEN** Git cannot clone the requested remote
- **THEN** add reports the Git failure, does not modify configuration, and removes only an incomplete destination created by this invocation
