# installer-ownership-lifecycle Delta Specification

## ADDED Requirements

### Requirement: Current official direct installs write a closed minimal manifest

Official POSIX and PowerShell installers SHALL atomically write schema version 2 ownership metadata after installing the complete current payload. The closed record SHALL contain the official-direct channel, platform, normalized absolute install directory, an ordered exact set of relative file paths with roles and lowercase SHA-256 digests, and optional exact installer PATH-mutation provenance. Unknown fields, duplicate roles or paths, absolute/escaping paths, malformed hashes, unsupported channels/platforms, and symlinked/reparse destinations SHALL invalidate the record.

#### Scenario: New direct install completes

- **WHEN** the official installer finishes writing every current executable, wrapper, alias, and bundled platform helper
- **THEN** it atomically writes one schema-v2 manifest describing exactly that installed payload
- **AND** the manifest does not claim project data, parent directories, unrelated files, or shell blocks

#### Scenario: Existing PATH state predates installation

- **WHEN** the required PATH entry already exists before installation
- **THEN** Windows records `created: false` and POSIX records no installer-added byte sequence
- **AND** later uninstall preserves the pre-existing state

#### Scenario: Legacy metadata is present

- **WHEN** uninstall reads schema-v1 or otherwise unsupported ownership metadata
- **THEN** it refuses automatic removal
- **AND** directs the user to refresh the same direct install through the current official installer before retrying

### Requirement: Direct uninstall completely preflights exact manifest-owned state

Before first mutation, the planner SHALL resolve only manifest-listed paths beneath the manifest install directory without following symlinks/reparse points. A present regular file with the recorded digest is removable; an absent listed file is an already-completed no-op; any present type or digest mismatch is a blocker. No filename, location, marker, PATH resolution, or known release hash outside the manifest SHALL establish ownership.

#### Scenario: All remaining files match

- **WHEN** every present manifest-listed file is a regular non-link file with its recorded digest and every absent listed file has no replacement object
- **THEN** preflight emits a deterministic plan containing removable and already-absent items

#### Scenario: One present file was modified

- **WHEN** any manifest-listed path contains a different digest or file type
- **THEN** the whole direct apply refuses before changing any file, profile, PATH, or shell block

#### Scenario: A listed path escapes or traverses a link

- **WHEN** path normalization escapes the recorded install directory or any destination is a symlink/reparse point
- **THEN** preflight refuses before mutation

### Requirement: Direct uninstall reverses only exact installer-created PATH state

POSIX cleanup SHALL remove the exact recorded inserted byte sequence only when it appears exactly once in the recorded regular profile file. Windows cleanup SHALL remove exactly one matching user-PATH entry only when the manifest records `created: true`; `created: false` SHALL always preserve it. Absent owned state is a no-op; duplicate, changed, unreadable, or linked state SHALL be preserved and reported rather than broadly edited.

#### Scenario: Exact POSIX PATH bytes remain

- **WHEN** the recorded byte sequence appears exactly once in the recorded regular profile
- **THEN** apply removes exactly those bytes and preserves every byte before and after them

#### Scenario: PATH state is ambiguous

- **WHEN** recorded POSIX bytes occur more than once or the exact created Windows entry cannot be uniquely identified
- **THEN** uninstall leaves PATH/profile state unchanged
- **AND** does not use semantic or substring matching as a fallback

### Requirement: Manifest-last cleanup is safely rerunnable

Direct apply SHALL remove exact safe shell/PATH state and matching manifest-owned files, then remove the manifest last. It SHALL never recursively remove the install directory. If interruption leaves some listed files absent while the valid manifest remains, a later run SHALL revalidate every remaining present item and continue; absent listed items SHALL authorize no other deletion.

#### Scenario: Apply completes

- **WHEN** every planned mutation succeeds
- **THEN** the manifest is the final installation artifact removed
- **AND** unrelated files and containing directories remain

#### Scenario: Apply is interrupted after one file removal

- **WHEN** one manifest-listed file is absent on retry and the valid manifest remains
- **THEN** retry treats only that exact listed path as completed
- **AND** revalidates every remaining present file before any further mutation

#### Scenario: Failure occurs before manifest removal

- **WHEN** any planned mutation fails
- **THEN** the manifest remains for bounded inspection and retry
- **AND** uninstall reports partial progress without claiming rollback
