## ADDED Requirements

### Requirement: Self-update preserves both executable entrypoints

Supported npm-managed and direct-binary update flows SHALL preserve availability and version parity of canonical `arashi` and alias `aw`, and wrapper-intercepted npm update behavior SHALL be equivalent through either generated package-manager shim.

#### Scenario: npm-managed update is invoked through the alias

- **WHEN** a user runs `aw update` through the npm package entrypoint
- **THEN** the shared wrapper performs the same install-method detection, inspection conflict validation, release lookup, confirmation, package-manager command, binary refresh, JSON/human output, and exit-status behavior as `arashi update`

#### Scenario: npm-managed package update completes

- **WHEN** the selected package manager installs the newer Arashi package and the matching native binary refresh succeeds
- **THEN** the resulting managed bin directory exposes both `arashi` and `aw`
- **AND** both report the same updated version

#### Scenario: POSIX direct update completes

- **WHEN** a confirmed POSIX direct-binary update runs the official installer against the current binary directory
- **THEN** the installer applies the recoverable `arashi.bin`, `arashi`, and `aw` payload plus the versioned alias-ownership ledger
- **AND** the update succeeds only after both executable smoke tests pass and the ledger commits atomically

#### Scenario: Windows deferred update completes

- **WHEN** a confirmed Windows direct-binary update schedules and completes the official PowerShell installer
- **THEN** the recoverable installed payload includes canonical and alias Git Bash, PowerShell, and CMD entrypoints around one `arashi.bin.exe` plus the versioned alias-ownership ledger
- **AND** both names report the selected version in each supported shell

#### Scenario: Update encounters an unrelated alias

- **WHEN** a direct update installer finds an unowned, ledger-mismatched, PATH-resolved external, or ambiguous required alias destination
- **THEN** it exits non-zero before downloads, directory creation, backups, or replacement of the existing canonical installation
- **AND** reports the collision path and deliberate remediation without claiming that an update completed

### Requirement: Update recovery guidance remains canonical

Update output, errors, and documentation SHALL continue to name canonical `arashi install`, `arashi update`, official installer URLs, package name, environment variables, and manual release guidance while stating where needed that a successful update installs or refreshes supported alias `aw`.

#### Scenario: Binary refresh fails after package update

- **WHEN** an npm-managed update changes the package but native binary verification fails
- **THEN** recovery guidance continues to recommend canonical `arashi install` or manual Arashi release installation
- **AND** does not invent an `AW_*` environment variable, package, or release stream

#### Scenario: Direct alias update fails

- **WHEN** an update invoked as `aw update` fails during lookup, planning, installer start, replacement, smoke test, or rollback
- **THEN** its human or JSON error retains the canonical Arashi error contract and actionable recovery
- **AND** does not falsely report either entrypoint as updated
