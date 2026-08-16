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

The update command SHALL compare the current Arashi version with the latest available Arashi version before running an updater, except that a direct-binary user MAY explicitly approve an unpinned official-installer attempt when the GitHub latest-release API cannot complete because response evidence identifies rate limiting.

#### Scenario: Installed version is current

- **WHEN** the detected current version is greater than or equal to the latest available version
- **THEN** the command reports that Arashi is already up to date and exits successfully without running package-manager or binary-download steps

#### Scenario: Newer version is available

- **WHEN** the latest available version is newer than the detected current version
- **THEN** the command reports the current version, latest version, and selected update method

#### Scenario: GitHub primary rate limit is identified

- **WHEN** a direct-binary latest-release request receives HTTP 403 or 429 with `x-ratelimit-remaining: 0`
- **THEN** Arashi classifies the failed check as GitHub rate limiting
- **AND** it does not claim that an update is available or report an unverified latest version

#### Scenario: GitHub secondary rate limit is identified by a header

- **WHEN** a direct-binary latest-release request receives HTTP 403 or 429 with a `retry-after` response header
- **THEN** Arashi classifies the failed check as GitHub rate limiting
- **AND** it does not claim that an update is available or report an unverified latest version

#### Scenario: GitHub secondary rate limit is identified by its error message

- **WHEN** a direct-binary latest-release request receives HTTP 403 or 429 without `retry-after` and its JSON `message` identifies a secondary rate limit
- **THEN** Arashi classifies the failed check as GitHub rate limiting
- **AND** it does not claim that an update is available or report an unverified latest version

#### Scenario: Generic forbidden or throttled response remains a failure

- **WHEN** a direct-binary latest-release request receives HTTP 403 or 429 without a primary or secondary GitHub rate-limit response signal
- **THEN** the command exits non-zero without modifying files and reports the failed check plus manual update guidance
- **AND** it does not offer or run the unpinned installer fallback

#### Scenario: Other version check fails

- **WHEN** release or package metadata cannot be fetched for a reason other than identified GitHub API rate limiting
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

For official curl installer/direct-binary installations, the update command SHALL provide safe inspection modes, SHALL rerun the official installer against the current binary directory after normal update confirmation, and SHALL permit an explicitly confirmed unpinned installer attempt after identified GitHub API rate limiting.

#### Scenario: Direct binary is current

- **WHEN** a direct-binary install runs `arashi update` and no newer release is available
- **THEN** the command reports that the binary is already current

#### Scenario: Direct binary has newer release

- **WHEN** a direct-binary install runs `arashi update` and a newer release is available
- **THEN** the command prints the official installer URL, target install directory, and platform-specific asset name

#### Scenario: Direct binary dry run with known release

- **WHEN** a direct-binary install runs `arashi update --dry-run` and the release check succeeds
- **THEN** the command prints the release check and version-pinned installer update plan without modifying files

#### Scenario: Direct binary confirmed update with known release

- **WHEN** a direct-binary install runs `arashi update --yes` and a newer release is available
- **THEN** the command reruns the official installer with `ARASHI_VERSION` set to the latest version and `ARASHI_INSTALL_DIR` set to the current binary directory

#### Scenario: Interactive rate-limited fallback is confirmed

- **WHEN** an interactive direct-binary update receives an identified rate-limit response and the user confirms the fallback prompt
- **THEN** Arashi runs the official installer against the current binary directory after removing `ARASHI_VERSION` from the spawned environment, including any inherited caller value
- **AND** it explains that update availability and the target version could not be verified

#### Scenario: Confirmation flag accepts rate-limited fallback

- **WHEN** a direct-binary update receives an identified rate-limit response and `--yes` is present
- **THEN** Arashi runs the same unpinned official-installer fallback without prompting and without forwarding an inherited `ARASHI_VERSION`

#### Scenario: Interactive rate-limited fallback is declined or cancelled

- **WHEN** an interactive direct-binary update receives an identified rate-limit response and the user declines or cancels the fallback prompt
- **THEN** Arashi does not spawn the installer or modify the installation
- **AND** it reports that the fallback was skipped or cancelled

#### Scenario: Non-interactive rate-limited fallback lacks confirmation

- **WHEN** a non-interactive direct-binary update receives an identified rate-limit response and `--yes` is absent
- **THEN** Arashi does not spawn the installer or modify the installation
- **AND** it tells the user that `--yes` is required to attempt the fallback

#### Scenario: Rate-limited check mode

- **WHEN** a direct-binary update receives an identified rate-limit response while `--check` is active
- **THEN** Arashi exits non-zero because availability could not be checked
- **AND** it does not prompt, construct an apply action, spawn the installer, or modify the installation

#### Scenario: Rate-limited human dry run

- **WHEN** a direct-binary update receives an identified rate-limit response while human `--dry-run` is active
- **THEN** Arashi prints the unpinned official-installer fallback plan and the unresolved-version warning
- **AND** it does not prompt, spawn the installer, or modify the installation

#### Scenario: Rate-limited JSON inspection variants

- **WHEN** a direct-binary update receives an identified rate-limit response while bare `--json`, `--json --check`, or `--json --dry-run` is active
- **THEN** stdout contains exactly one `ok: false` envelope with error code `GITHUB_RATE_LIMITED`
- **AND** error details contain the actual HTTP `status: 403 | 429`, the identified `primary` or `secondary` rate-limit signal, `fallbackAvailable: true`, and `versionPinned: false`
- **AND** Arashi exits with status 1 without prompting, spawning the installer, or modifying the installation

#### Scenario: JSON apply remains unsupported before lookup

- **WHEN** a direct-binary update requests `--json --yes`
- **THEN** Arashi emits the existing `JSON_UNSUPPORTED_FOR_MODE` error and exits non-zero before release lookup, prompting, installer planning, or mutation

### Requirement: Update command result reporting

The update command SHALL report clear final status for successful, skipped, and failed update attempts and SHALL use version-neutral status when a rate-limited fallback could not verify a target version.

#### Scenario: Update succeeds

- **WHEN** an npm-managed update completes and the refreshed binary verifies successfully
- **THEN** the command reports the previous version, new version, package-manager command used, and binary path

#### Scenario: Update is skipped

- **WHEN** an update is not performed because Arashi is current or the install method is unsupported
- **THEN** the command reports why no update was performed and what the user can do next

#### Scenario: Update fails after package update

- **WHEN** package update succeeds but binary refresh or verification fails
- **THEN** the command exits non-zero, reports the failing step, and points to `arashi install` or manual release guidance for recovery

#### Scenario: POSIX rate-limited fallback completes

- **WHEN** a confirmed POSIX unpinned latest-release installer attempt exits successfully
- **THEN** Arashi reports that the latest-release installer attempt completed without claiming a target version

#### Scenario: Windows rate-limited fallback is scheduled

- **WHEN** a confirmed Windows unpinned latest-release installer attempt is started successfully for deferred replacement
- **THEN** Arashi reports that the latest-release installer attempt was scheduled without claiming a target version

#### Scenario: Rate-limited fallback installer fails

- **WHEN** the unpinned installer fails to start or exits non-zero
- **THEN** Arashi exits non-zero and reports the installer failure without claiming that an update or particular version was installed

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
