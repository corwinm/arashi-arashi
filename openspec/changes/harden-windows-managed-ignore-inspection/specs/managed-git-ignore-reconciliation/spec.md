## MODIFIED Requirements

### Requirement: Arashi resolves effective managed ignore state through Git
The system SHALL inspect Git's effective ignore rules for each safe configured managed path before planning or applying any ignore-file change, SHALL support ignore files with platform-native LF or CRLF line endings, and MUST accept provenance only from a complete, unambiguous Git result.

#### Scenario: Existing tracked rule applies
- **WHEN** a configured managed path is already ignored by a tracked Git ignore rule
- **THEN** Arashi reports the path as already ignored
- **AND** Arashi does not add a repository-local or duplicate tracked rule

#### Scenario: Existing repository-local rule applies
- **WHEN** a configured managed path is already ignored by the common repository's local exclude file
- **THEN** Arashi preserves the existing rule without duplication

#### Scenario: Existing global rule applies
- **WHEN** Git reports that a configured managed path is ignored through the user's existing global excludes file
- **THEN** Arashi honors the effective rule
- **AND** Arashi does not create or modify global Git configuration

#### Scenario: Tracked ignore file uses CRLF
- **WHEN** Git resolves an effective rule from a tracked `.gitignore` checked out with CRLF line endings
- **THEN** Arashi reports the effective tracked source normally
- **AND** initialization does not require the user to rewrite the file to LF

#### Scenario: Primary provenance payload is unusable
- **WHEN** the primary Git provenance query exits successfully but does not return one complete unambiguous source record
- **THEN** Arashi performs one independent Git-authoritative provenance query for the same managed path
- **AND** uses the recovered source only when that query returns one complete unambiguous record

#### Scenario: Provenance recovery is also unusable
- **WHEN** neither the primary nor recovery Git query yields one complete unambiguous source record
- **THEN** Arashi fails managed-ignore inspection before applying ignore-file changes
- **AND** reports actionable diagnostics for the primary parse failure and recovery outcome
- **AND** does not guess provenance from ignore-file contents

#### Scenario: Primary query reports no effective rule
- **WHEN** the primary Git provenance query reports the managed path is not ignored
- **THEN** Arashi reports the path as unignored
- **AND** does not invoke malformed-output recovery

#### Scenario: Primary query fails fatally
- **WHEN** the primary Git provenance query cannot start or exits with a fatal Git error
- **THEN** Arashi reports that failure
- **AND** does not replace it with malformed-output recovery
