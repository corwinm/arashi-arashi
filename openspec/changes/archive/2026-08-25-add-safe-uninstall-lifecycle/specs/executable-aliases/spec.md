# executable-aliases Delta Specification

## ADDED Requirements

### Requirement: Official direct payload includes one bundled uninstall helper

Each official direct-install platform payload SHALL include the canonical executable/native payload, canonical `arashi` wrappers, `aw` alias wrappers, and exactly one platform-appropriate bundled uninstall helper. The schema-v2 manifest SHALL record each installed payload file with an exact role, relative destination, and digest. The helper is an installed release-owned file; the ownership manifest itself is metadata outside the hashed payload list.

#### Scenario: POSIX payload is installed

- **WHEN** the official POSIX installer installs a current release
- **THEN** the manifest lists the executable/native payload, both executable-name wrappers, and the bundled POSIX helper
- **AND** all listed destinations remain beneath the exact install directory

#### Scenario: Windows payload is installed

- **WHEN** the official PowerShell installer installs a current release
- **THEN** the manifest lists the executable, canonical and alias wrappers, and the bundled PowerShell helper

#### Scenario: Payload member is modified

- **WHEN** any present manifest-listed executable, wrapper, alias, or helper digest differs
- **THEN** direct uninstall refuses before deleting any payload member

### Requirement: Release artifacts publish uninstall helpers with the executable matrix

Release packaging and checksums SHALL include the POSIX and PowerShell helper appropriate to each published platform archive, and generated executable-distribution contracts SHALL remain the source of truth for their names and roles.

#### Scenario: Release archive is assembled

- **WHEN** the release workflow builds a platform archive
- **THEN** the archive contains the platform's bundled uninstall helper at the contract-defined path
- **AND** checksum and archive-freshness validation cover that helper
