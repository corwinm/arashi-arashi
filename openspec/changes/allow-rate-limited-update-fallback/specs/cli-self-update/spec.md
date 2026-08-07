## MODIFIED Requirements

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
