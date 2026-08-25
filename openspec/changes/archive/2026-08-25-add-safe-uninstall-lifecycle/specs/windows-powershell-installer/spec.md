# windows-powershell-installer Delta Specification

## ADDED Requirements

### Requirement: PowerShell installer writes equivalent minimal uninstall ownership

The official PowerShell installer SHALL install the complete current Windows payload including `uninstall.ps1`, record exact file roles/digests in the schema-v2 official-direct manifest, and record the exact user-PATH entry spelling plus whether the installer created it. It SHALL NOT claim machine PATH, pre-existing user PATH, parent directories, shell blocks, project state, or unrelated files.

#### Scenario: Installer appends the user PATH entry

- **WHEN** the exact install-directory entry was absent and the installer appends it to user PATH
- **THEN** the manifest records the exact stored spelling and `created: true`

#### Scenario: User PATH entry pre-exists

- **WHEN** an equivalent required entry already exists before installation
- **THEN** the manifest records `created: false`
- **AND** uninstall never removes that entry

### Requirement: Bundled PowerShell helper performs deferred narrow cleanup

The bundled PowerShell helper SHALL accept an explicit install directory or deterministic default, support `-DryRun` and `-Yes`, wait for an optional parent PID, re-read the local manifest, reject reparse points and modified present files, remove only exact created user-PATH state and manifest-owned payload, remove the manifest last, and narrowly delete its temporary copy. It SHALL never scan PATH or the filesystem for candidates.

#### Scenario: Running executable hands off on Windows

- **WHEN** confirmed direct uninstall stages the bundled helper and passes its parent PID
- **THEN** the helper waits for the parent process to exit before deleting active wrappers or executable files

#### Scenario: CLI is unavailable

- **WHEN** the user runs the helper directly with `-InstallDir` and `-DryRun`
- **THEN** it prints the same bounded ownership plan without invoking Arashi
- **AND** performs no mutation

#### Scenario: Partial prior removal is retried

- **WHEN** the valid manifest remains and one listed payload file is already absent
- **THEN** the helper skips that exact item, revalidates every remaining present item, and can finish manifest-last cleanup
