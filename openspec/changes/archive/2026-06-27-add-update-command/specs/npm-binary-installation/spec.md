## MODIFIED Requirements

### Requirement: Explicit install command
The npm entrypoint SHALL provide an `arashi install` command that explicitly installs or refreshes the matching platform binary for the selected package version.

#### Scenario: Explicit install downloads missing binary
- **WHEN** a user runs `arashi install` from the npm package and the matching platform binary is absent
- **THEN** the command downloads the binary for the installed package version, verifies it, and reports successful installation

#### Scenario: Explicit install is idempotent
- **WHEN** a user runs `arashi install` from the npm package and the matching platform binary is already present for the installed package version
- **THEN** the command reports that the binary is already installed and exits successfully without downloading another binary

#### Scenario: Explicit install refreshes stale binary during update
- **WHEN** the update flow selects a newer package version and the existing platform binary does not match that version
- **THEN** the installer replaces the stale binary with the matching release asset, verifies it, and reports successful installation

#### Scenario: Explicit install on unsupported platform
- **WHEN** a user runs `arashi install` on an unsupported operating system or CPU architecture
- **THEN** the command exits non-zero and reports that the platform is unsupported with a link to manual build or issue guidance

### Requirement: Matching version binary resolution
The installer MUST download release assets that match the selected Arashi package version and current supported platform.

#### Scenario: Version-specific asset URL is selected
- **WHEN** the installer runs for package version `<version>` on a supported platform
- **THEN** it downloads from the `v<version>` GitHub release using the platform-specific Arashi asset name

#### Scenario: Updated package version is selected
- **WHEN** the update flow has completed a package-manager update to a newer installed package version
- **THEN** the installer uses the updated package version when resolving the release asset URL

#### Scenario: Downloaded binary is verified
- **WHEN** the installer downloads a binary
- **THEN** it marks the file executable where required and runs the binary with `--version` before treating installation as successful

### Requirement: Installation guidance reflects script-free behavior
User-facing npm installation documentation SHALL describe first-use binary installation, the explicit `arashi install` command, and the `arashi update` command instead of lifecycle-script recovery.

#### Scenario: npm install guidance is reviewed
- **WHEN** a user reads npm installation or troubleshooting documentation
- **THEN** the documentation explains that lifecycle scripts are not required and recommends `arashi install` for explicit binary installation

#### Scenario: update guidance is reviewed
- **WHEN** a user reads npm installation, command, or troubleshooting documentation
- **THEN** the documentation explains how to use `arashi update`, when to use `--check` or `--dry-run`, and what direct-binary users should do for manual updates
