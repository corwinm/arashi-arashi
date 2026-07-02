# windows-powershell-installer Specification

## Purpose

Define the Windows direct-binary installation and update behavior for Arashi, including the hosted PowerShell installer, release asset verification, user-level install layout, PATH handling, smoke testing, and deferred update flow.

## Requirements
### Requirement: Windows PowerShell installer availability
Arashi SHALL provide a hosted Windows PowerShell installer for direct binary installs that do not require Node.js or npm.

#### Scenario: User inspects the installer
- **WHEN** a user opens the hosted PowerShell installer URL in a browser or downloads it directly
- **THEN** they can inspect the script contents before executing it

#### Scenario: User runs the documented one-line PowerShell installer
- **WHEN** a Windows user runs the documented `powershell -c "irm https://arashi.haphazard.dev/install.ps1 | iex"` command
- **THEN** the script downloads, verifies, installs, and smoke-tests the latest supported Arashi Windows release assets without requiring Node.js or npm

#### Scenario: Unsupported Windows platform attempts install
- **WHEN** the installer runs on an unsupported operating system or CPU architecture
- **THEN** it exits non-zero before downloading release assets and prints the direct GitHub Releases fallback URL

### Requirement: Windows release asset resolution
The Windows installer MUST resolve all installation assets from a single Arashi GitHub release.

#### Scenario: Latest install resolves release download URLs
- **WHEN** no version override is provided
- **THEN** the installer downloads `arashi-windows-x64.exe`, `arashi.ps1`, `arashi.bat`, and `arashi-checksums.txt` from the latest Arashi release download endpoint

#### Scenario: Pinned install resolves versioned release URLs
- **WHEN** the user provides `-Version 1.15.0` or sets `ARASHI_VERSION=1.15.0`
- **THEN** the installer downloads every required asset from the `v1.15.0` release download endpoint

#### Scenario: Download fails
- **WHEN** any required release asset cannot be downloaded
- **THEN** the installer exits non-zero without replacing installed files and prints the direct GitHub Releases fallback URL

### Requirement: Windows installer checksum validation
The Windows installer MUST verify SHA-256 checksums for every downloaded install asset before replacing installed files.

#### Scenario: Checksums match manifest
- **WHEN** the downloaded checksum manifest contains matching SHA-256 entries for the executable and wrapper assets
- **THEN** the installer treats the staged downloads as eligible for installation

#### Scenario: Checksum entry is missing
- **WHEN** the checksum manifest does not contain an expected asset entry
- **THEN** the installer exits non-zero before replacing installed files and identifies the missing asset entry

#### Scenario: Checksum mismatch is detected
- **WHEN** a downloaded asset hash differs from the checksum manifest entry
- **THEN** the installer exits non-zero before replacing installed files and reports the failed asset plus fallback guidance

### Requirement: Windows user-level install layout
The Windows installer SHALL install Arashi into a user-writable bin directory by default and SHALL support an explicit install-directory override.

#### Scenario: Default install directory is used
- **WHEN** no install directory override is provided
- **THEN** the installer installs into `%USERPROFILE%\.arashi\bin`

#### Scenario: Custom install directory is used
- **WHEN** the user provides `-InstallDir C:\Tools\Arashi` or sets `ARASHI_INSTALL_DIR=C:\Tools\Arashi`
- **THEN** the installer installs all Arashi files into the specified directory

#### Scenario: Verified staged files are installed together
- **WHEN** all staged asset checksums pass
- **THEN** the installer writes `arashi.bin.exe`, `arashi.ps1`, and `arashi.bat` into the install directory as one coherent installed set

#### Scenario: Validation fails before replacement
- **WHEN** download or checksum validation fails
- **THEN** the installer preserves any existing installed files in the target directory

### Requirement: Windows PATH management
The Windows installer SHALL add the install directory to the persistent user PATH by default and SHALL support a no-modify-PATH mode.

#### Scenario: Install directory is missing from user PATH
- **WHEN** the install succeeds and PATH modification is enabled
- **THEN** the installer appends the install directory to the user PATH and tells the user to open a new terminal

#### Scenario: Install directory is already on user PATH
- **WHEN** the install succeeds and the install directory is already present in the user PATH
- **THEN** the installer does not duplicate the PATH entry

#### Scenario: PATH modification is disabled
- **WHEN** the user provides `-NoModifyPath` or sets `ARASHI_NO_MODIFY_PATH=1`
- **THEN** the installer does not modify PATH and prints the command or directory the user must add manually

#### Scenario: Environment change broadcast fails
- **WHEN** the installer cannot broadcast a Windows environment change after updating PATH
- **THEN** the installer still reports the persistent PATH update result and tells the user to open a new terminal

### Requirement: Windows install smoke test and fallback reporting
The Windows installer SHALL verify the installed wrapper after installation and SHALL provide actionable fallback guidance on failures.

#### Scenario: Installed wrapper reports a version
- **WHEN** the installer has replaced files in the install directory
- **THEN** it runs an installed Arashi wrapper with `--version` and reports success if the command exits successfully

#### Scenario: Smoke test fails
- **WHEN** the installed wrapper smoke test exits non-zero
- **THEN** the installer exits non-zero, reports the failing command, and prints direct GitHub release/manual install fallback guidance

#### Scenario: Install succeeds
- **WHEN** downloads, checksum validation, file replacement, PATH handling, and smoke testing complete successfully
- **THEN** the installer reports the installed Arashi version, install directory, and next step for using `arashi`

### Requirement: Windows direct-installer updates
Arashi SHALL update Windows direct-binary installs by deferring the PowerShell installer until the current Arashi process can exit.

#### Scenario: Windows direct install runs update with confirmation
- **WHEN** a Windows direct-binary install runs `arashi update --yes`
- **THEN** Arashi starts the hosted PowerShell installer for the detected latest version, targets the current binary directory, disables PATH mutation, and passes the current process ID for deferred replacement

#### Scenario: Deferred installer waits for the running process
- **WHEN** the PowerShell installer receives a parent process ID from `ARASHI_WAIT_FOR_PID`
- **THEN** it waits for that process to exit before replacing installed files and reports a timeout with rerun guidance if the process does not exit in time

#### Scenario: POSIX direct install runs update with confirmation
- **WHEN** a macOS or Linux direct-binary install runs `arashi update --yes`
- **THEN** Arashi continues to use the POSIX curl/bash installer against the current binary directory without mutating shell integration or PATH

### Requirement: Windows installer implementation coverage
The Windows installer implementation SHALL have automated coverage for deterministic helper behavior and supported option handling.

#### Scenario: Helper tests run
- **WHEN** repository tests run for the installer implementation
- **THEN** they cover architecture detection, asset URL construction, checksum parsing or verification, install directory selection, and no-modify-PATH behavior

#### Scenario: Documentation publish path is tested or smoke-checked
- **WHEN** docs/build validation runs for the hosted installer endpoint
- **THEN** it verifies that `install.ps1` is present at the published `/install.ps1` path

