## Purpose

Specify how the npm package installs, refreshes, and verifies the matching Arashi platform binary without depending on package-manager lifecycle scripts.
## Requirements
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

### Requirement: npm package exposes canonical and alias bins

The npm package SHALL expose `arashi` and `aw` bin names mapped to the same `bin/arashi.js` entrypoint and SHALL preserve package-manager executable-collision handling rather than mutating global bin paths independently.

#### Scenario: Packed package metadata is inspected

- **WHEN** the canonical npm archive is packed and its metadata is inspected
- **THEN** `bin.arashi` and `bin.aw` both resolve to `./bin/arashi.js`
- **AND** the archive contains the shared entrypoint and every file required for first-use binary installation

#### Scenario: Package is globally installed

- **WHEN** a clean supported POSIX or Windows fixture globally installs the packed npm archive
- **THEN** both package-manager-generated executable shims resolve successfully
- **AND** neither shim requires a separate native alias binary

#### Scenario: Package manager detects an executable collision

- **WHEN** the package manager cannot claim `aw` in its managed global bin location
- **THEN** installation follows the package manager's normal collision failure behavior
- **AND** Arashi does not overwrite the unrelated executable through custom global-bin mutation

### Requirement: npm entrypoint behavior is equivalent through both names

The shared npm entrypoint SHALL provide equivalent first-use binary installation, explicit `install`, wrapper-intercepted `update`, stdout and stderr isolation, exit status, and native command dispatch through `arashi` and `aw`.

#### Scenario: Alias first use has no platform binary

- **WHEN** a user runs `aw <command>` from a packed npm installation and the matching native binary is absent
- **THEN** the shared entrypoint downloads and verifies the installed package version's platform binary
- **AND** runs the requested command with the same result as canonical `arashi` first use

#### Scenario: Explicit install runs through the alias

- **WHEN** a user runs `aw install` through the generated package-manager shim
- **THEN** the shared wrapper intercepts the command before native dispatch
- **AND** preserves the canonical install command's idempotency, JSON, error, and partial-download cleanup contracts

#### Scenario: Update runs through the alias

- **WHEN** a user runs a supported human or JSON `aw update` invocation through the generated package-manager shim
- **THEN** the shared wrapper intercepts it at the same boundary as `arashi update`
- **AND** preserves conflict precedence, lookup, confirmation, package-manager planning, binary refresh, stdout/stderr, and exit-status behavior

#### Scenario: Alias completion triggers first-use installation

- **WHEN** a clean packed installation runs `aw completion <shell>` without a native binary
- **THEN** first-use installation completes through the canonical binary installer
- **AND** stdout contains only the sourceable completion program

### Requirement: Package wrapper intercepts uninstall before native dispatch

The npm-package JavaScript wrapper SHALL recognize `uninstall` before downloading, locating, or dispatching the native executable. It SHALL derive ownership from package-root evidence, use environment evidence only as corroboration, and delegate only when exactly one supported global owner is confidently identified.

#### Scenario: Native payload is missing

- **WHEN** a package-managed user runs `aw uninstall` or `arashi uninstall` and the native payload is unavailable
- **THEN** the JavaScript wrapper still inspects and can delegate package removal
- **AND** does not attempt first-use native download

#### Scenario: Owner evidence conflicts

- **WHEN** package-root evidence is conflicting, unsupported, or insufficient
- **THEN** the wrapper exits with labeled candidate guidance
- **AND** executes no manager and directly deletes no package file or shim

### Requirement: Supported package owners use exact global removal argv

The normative package-manager invocations SHALL be exactly:

- npm: program `npm`, args `uninstall`, `-g`, `arashi`;
- pnpm: program `pnpm`, args `remove`, `-g`, `arashi`;
- Yarn classic global: program `yarn`, args `global`, `remove`, `arashi`;
- Bun: program `bun`, args `remove`, `-g`, `arashi`;
- Vite+: program `vp`, args `uninstall`, `-g`, `arashi`.

Confirmed apply SHALL execute exactly one selected command. Dry-run SHALL print but not execute it.

#### Scenario: pnpm owns the installation

- **WHEN** package-root evidence confidently identifies pnpm and the user confirms or supplies `--yes`
- **THEN** the wrapper executes exactly `pnpm remove -g arashi` once

#### Scenario: Dry-run inspects a package owner

- **WHEN** the user supplies `--dry-run` for a confidently identified owner
- **THEN** the wrapper prints the exact program and ordered arguments
- **AND** does not spawn the manager

#### Scenario: Unsupported Yarn layout is detected

- **WHEN** evidence indicates a Yarn layout other than supported classic global ownership
- **THEN** automatic delegation refuses with bounded manual guidance
