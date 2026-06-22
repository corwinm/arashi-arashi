## ADDED Requirements

### Requirement: Script-free npm package installation
The npm package MUST NOT depend on package-manager lifecycle scripts to install the Arashi platform binary.

#### Scenario: Package metadata has no postinstall lifecycle
- **WHEN** the published package metadata is prepared
- **THEN** it MUST NOT define a `postinstall` script for downloading the Arashi binary

#### Scenario: Package installs without lifecycle scripts
- **WHEN** a user installs the npm package with lifecycle scripts disabled
- **THEN** the package installation completes with the JavaScript entrypoint and wrapper files needed to run `arashi`

### Requirement: First-use binary installation fallback
The npm entrypoint SHALL install the matching platform binary on first use when the binary is missing.

#### Scenario: Binary missing on supported platform
- **WHEN** a user runs `arashi <command>` from the npm package and the matching platform binary is absent
- **THEN** the entrypoint downloads the binary for the installed package version, verifies it, and then runs the requested command

#### Scenario: Binary already present
- **WHEN** a user runs `arashi <command>` from the npm package and a usable matching platform binary is already present
- **THEN** the entrypoint runs the requested command without downloading another binary

#### Scenario: Binary installation fails during first use
- **WHEN** first-use binary download or verification fails
- **THEN** the entrypoint exits non-zero, removes any partial downloaded binary, and reports actionable manual-install guidance

### Requirement: Explicit install command
The npm entrypoint SHALL provide an `arashi install` command that explicitly installs the matching platform binary for the installed package version.

#### Scenario: Explicit install downloads missing binary
- **WHEN** a user runs `arashi install` from the npm package and the matching platform binary is absent
- **THEN** the command downloads the binary for the installed package version, verifies it, and reports successful installation

#### Scenario: Explicit install is idempotent
- **WHEN** a user runs `arashi install` from the npm package and the matching platform binary is already present
- **THEN** the command reports that the binary is already installed and exits successfully without downloading another binary

#### Scenario: Explicit install on unsupported platform
- **WHEN** a user runs `arashi install` on an unsupported operating system or CPU architecture
- **THEN** the command exits non-zero and reports that the platform is unsupported with a link to manual build or issue guidance

### Requirement: Matching version binary resolution
The installer MUST download release assets that match the installed npm package version and current supported platform.

#### Scenario: Version-specific asset URL is selected
- **WHEN** the installer runs for package version `<version>` on a supported platform
- **THEN** it downloads from the `v<version>` GitHub release using the platform-specific Arashi asset name

#### Scenario: Downloaded binary is verified
- **WHEN** the installer downloads a binary
- **THEN** it marks the file executable where required and runs the binary with `--version` before treating installation as successful

### Requirement: Installation guidance reflects script-free behavior
User-facing npm installation documentation SHALL describe first-use binary installation and the explicit `arashi install` command instead of lifecycle-script recovery.

#### Scenario: npm install guidance is reviewed
- **WHEN** a user reads npm installation or troubleshooting documentation
- **THEN** the documentation explains that lifecycle scripts are not required and recommends `arashi install` for explicit binary installation
