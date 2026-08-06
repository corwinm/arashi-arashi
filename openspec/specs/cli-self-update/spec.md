# cli-self-update Specification

## Purpose
Define how Arashi checks for, reports, and applies CLI updates across npm-managed package installs and direct-binary installs while keeping non-mutating inspection modes safe.
## Requirements
### Requirement: Update command availability
The Arashi CLI SHALL provide an `update` command that is discoverable from CLI help and works in both npm-managed and direct-binary execution contexts.

#### Scenario: Command appears in CLI help
- **WHEN** a user runs `arashi --help`
- **THEN** the output lists an `update` command for checking and applying Arashi updates

#### Scenario: Command runs from npm package entrypoint
- **WHEN** a user runs `arashi update` through the npm package entrypoint
- **THEN** the entrypoint handles the update flow before spawning the native binary

#### Scenario: Command runs from direct binary
- **WHEN** a user runs `arashi update` from a directly downloaded native binary
- **THEN** the native CLI handles the command and reports direct-binary update guidance

### Requirement: Install method detection
The update command SHALL classify the current installation method before attempting to update Arashi.

#### Scenario: npm-managed install is detected
- **WHEN** `arashi update` is running from the npm package entrypoint with readable package metadata
- **THEN** the command classifies the install as npm-managed and records the package root and current package version

#### Scenario: direct binary install is detected
- **WHEN** `arashi update` is running inside the compiled native binary without npm package entrypoint context
- **THEN** the command classifies the install as direct-binary/manual

#### Scenario: ambiguous install is detected
- **WHEN** the command cannot confidently determine a supported update method
- **THEN** it exits without modifying files and prints manual update guidance

### Requirement: Update availability check
The update command SHALL compare the current Arashi version with the latest available Arashi version before running an updater.

#### Scenario: Installed version is current
- **WHEN** the detected current version is greater than or equal to the latest available version
- **THEN** the command reports that Arashi is already up to date and exits successfully without running package-manager or binary-download steps

#### Scenario: Newer version is available
- **WHEN** the latest available version is newer than the detected current version
- **THEN** the command reports the current version, latest version, and selected update method

#### Scenario: Version check fails
- **WHEN** release or package metadata cannot be fetched
- **THEN** the command exits non-zero without modifying files and reports the failed check plus manual update guidance

### Requirement: Safe check and dry-run modes
The update command SHALL support distinct non-mutating modes for update inspection and SHALL reject a single invocation that requests both `--check` and `--dry-run` before release lookup, installer planning, package-manager execution, binary replacement, or other mutation.

#### Scenario: Check mode reports no update
- **WHEN** a user runs `arashi update --check` and no newer version is available
- **THEN** the command reports that Arashi is current and does not modify the installation

#### Scenario: Check mode reports available update
- **WHEN** a user runs `arashi update --check` and a newer version is available
- **THEN** the command reports the available version and does not modify the installation

#### Scenario: Dry run reports planned update
- **WHEN** a user runs `arashi update --dry-run` and a newer version is available for a supported install method
- **THEN** the command prints the package-manager command and binary refresh steps it would run without executing them

#### Scenario: Human check and dry run conflict
- **WHEN** a user runs `arashi update --check --dry-run` without JSON mode
- **THEN** Arashi exits non-zero with an actionable usage error explaining that exactly one inspection mode may be selected
- **AND** it performs no network lookup, installer planning, package-manager execution, binary replacement, or other mutation

#### Scenario: JSON check and dry run conflict
- **WHEN** a user runs `arashi update --json --check --dry-run`
- **THEN** stdout contains exactly one structured error envelope identifying both conflicting options
- **AND** no human output is mixed into stdout
- **AND** it performs no network lookup, installer planning, package-manager execution, binary replacement, or other mutation

#### Scenario: npm entrypoint enforces the conflict
- **WHEN** an npm-managed invocation reaches the wrapper-intercepted update path with `--check --dry-run` or `--check -n`
- **THEN** it rejects the conflict before delegated update work
- **AND** its human or JSON result matches the compiled command contract

#### Scenario: Direct binary enforces the conflict
- **WHEN** a direct-binary invocation reaches the native Commander update path with `--check --dry-run`
- **THEN** it rejects the same conflict before update work
- **AND** does not silently choose check precedence

### Requirement: npm-managed package update
For npm-managed installations, the update command SHALL run the detected supported package-manager update command and refresh the matching platform binary.

#### Scenario: Supported package manager is detected
- **WHEN** an npm-managed install has a newer version available and a supported package manager can be determined
- **THEN** the command runs the corresponding package-manager command to update `arashi` to the latest version

#### Scenario: Package manager is ambiguous
- **WHEN** an npm-managed install has a newer version available but the package manager cannot be confidently determined
- **THEN** the command does not run an updater and prints manual commands for supported package managers

#### Scenario: Non-interactive update requires confirmation flag
- **WHEN** `arashi update` is running without an interactive terminal and no confirmation flag is provided
- **THEN** the command exits without updating and tells the user to rerun with `--yes` or use `--dry-run`

#### Scenario: Package-manager command fails
- **WHEN** the selected package-manager update command exits non-zero
- **THEN** the update command exits non-zero and preserves the existing working binary when possible

### Requirement: Direct-binary installer update
For official curl installer/direct-binary installations, the update command SHALL provide safe inspection modes and SHALL be able to rerun the official installer against the current binary directory when the user confirms with `--yes`.

#### Scenario: Direct binary is current
- **WHEN** a direct-binary install runs `arashi update` and no newer release is available
- **THEN** the command reports that the binary is already current

#### Scenario: Direct binary has newer release
- **WHEN** a direct-binary install runs `arashi update` and a newer release is available
- **THEN** the command prints the official installer URL, target install directory, and platform-specific asset name

#### Scenario: Direct binary dry run
- **WHEN** a direct-binary install runs `arashi update --dry-run`
- **THEN** the command prints the release check and installer update plan without modifying files

#### Scenario: Direct binary confirmed update
- **WHEN** a direct-binary install runs `arashi update --yes` and a newer release is available
- **THEN** the command reruns the official installer with `ARASHI_VERSION` set to the latest version and `ARASHI_INSTALL_DIR` set to the current binary directory

### Requirement: Update command result reporting
The update command SHALL report clear final status for successful, skipped, and failed update attempts.

#### Scenario: Update succeeds
- **WHEN** an npm-managed update completes and the refreshed binary verifies successfully
- **THEN** the command reports the previous version, new version, package-manager command used, and binary path

#### Scenario: Update is skipped
- **WHEN** an update is not performed because Arashi is current or the install method is unsupported
- **THEN** the command reports why no update was performed and what the user can do next

#### Scenario: Update fails after package update
- **WHEN** package update succeeds but binary refresh or verification fails
- **THEN** the command exits non-zero, reports the failing step, and points to `arashi install` or manual release guidance for recovery

