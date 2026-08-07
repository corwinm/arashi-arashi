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
- **THEN** the installer downloads `arashi-windows-x64.exe`, `arashi`, `arashi.ps1`, `arashi.bat`, and `arashi-checksums.txt` from the latest Arashi release download endpoint

#### Scenario: Pinned install resolves versioned release URLs
- **WHEN** the user provides `-Version 1.15.0` or sets `ARASHI_VERSION=1.15.0`
- **THEN** the installer downloads every required asset from the `v1.15.0` release download endpoint

#### Scenario: Download fails
- **WHEN** any required release asset cannot be downloaded
- **THEN** the installer exits non-zero without replacing installed files and prints the direct GitHub Releases fallback URL

### Requirement: Windows installer checksum validation
The Windows installer MUST verify SHA-256 checksums for every downloaded install asset before replacing installed files.

#### Scenario: Checksums match manifest
- **WHEN** the downloaded checksum manifest contains matching SHA-256 entries for the executable and `arashi`, `arashi.ps1`, and `arashi.bat` wrapper assets
- **THEN** the installer treats the staged downloads as eligible for installation

#### Scenario: Checksum entry is missing
- **WHEN** the checksum manifest does not contain an expected asset entry, including the extensionless `arashi` wrapper
- **THEN** the installer exits non-zero before replacing installed files and identifies the missing asset entry

#### Scenario: Checksum mismatch is detected
- **WHEN** a downloaded asset hash differs from the checksum manifest entry
- **THEN** the installer exits non-zero before replacing installed files and reports the failed asset plus fallback guidance

### Requirement: Windows user-level install layout
The Windows installer SHALL install Arashi into a user-writable bin directory by default, SHALL support an explicit install-directory override, and MUST replace its managed payload as one recoverable set.

#### Scenario: Default install directory is used
- **WHEN** no install directory override is provided
- **THEN** the installer installs into `%USERPROFILE%\.arashi\bin`

#### Scenario: Custom install directory is used
- **WHEN** the user provides `-InstallDir C:\Tools\Arashi` or sets `ARASHI_INSTALL_DIR=C:\Tools\Arashi`
- **THEN** the installer installs all Arashi files into the specified directory

#### Scenario: Verified staged files are installed together
- **WHEN** all staged asset checksums pass and replacement succeeds
- **THEN** the installer writes `arashi.bin.exe`, `arashi`, `arashi.ps1`, and `arashi.bat` into the install directory as one coherent installed set

#### Scenario: Validation fails before replacement
- **WHEN** download or checksum validation fails
- **THEN** the installer preserves any existing installed files in the target directory

#### Scenario: Replacement or smoke test fails after mutation begins
- **WHEN** replacing any managed payload destination or running the post-install executable smoke test fails after mutation begins
- **THEN** the installer exits non-zero after restoring every managed destination to its exact pre-install state, including removing newly created managed files that were previously absent, and reports the failed phase

#### Scenario: Rollback fails
- **WHEN** the installer cannot restore one or more managed destinations after a replacement or smoke-test failure
- **THEN** it exits non-zero, identifies the rollback failure, retains recoverable backups, and prints actionable manual recovery guidance

### Requirement: Windows PATH management
The Windows installer SHALL add the install directory to the persistent user PATH by default, SHALL support a no-modify-PATH mode, and MUST NOT modify Git Bash shell-profile files.

#### Scenario: Install directory is missing from user PATH
- **WHEN** the install succeeds and PATH modification is enabled
- **THEN** the installer appends the install directory to the user PATH and tells the user to open a new terminal, including a new Git Bash window when that shell will be used

#### Scenario: Install directory is already on user PATH
- **WHEN** the install succeeds and the install directory is already present in the user PATH
- **THEN** the installer does not duplicate the PATH entry

#### Scenario: PATH modification is disabled
- **WHEN** the user provides `-NoModifyPath` or sets `ARASHI_NO_MODIFY_PATH=1`
- **THEN** the installer does not modify PATH and prints the command or directory the user must add manually

#### Scenario: Environment change broadcast fails
- **WHEN** the installer cannot broadcast a Windows environment change after updating PATH
- **THEN** the installer still reports the persistent PATH update result and tells the user to open a new terminal

#### Scenario: Git Bash support does not mutate profiles
- **WHEN** the installer adds or reports the install directory for Git Bash use
- **THEN** it does not create or modify `.bashrc`, `.bash_profile`, `.profile`, or other shell startup files

#### Scenario: Default installation is inherited by a fresh Git Bash process
- **WHEN** Windows integration validation runs canonical `install.ps1` without an install-directory or no-PATH override in an isolated user environment and then starts a separate Git Bash process using the persisted machine and user PATH values
- **THEN** the installer has written the verified four-file payload to `%USERPROFILE%\.arashi\bin`, the persistent user PATH contains that directory exactly once, and extensionless `arashi --version` resolves successfully without a Git Bash profile edit

### Requirement: Windows install smoke test and fallback reporting
The Windows installer SHALL verify the installed executable after installation, the Windows validation workflow MUST verify the extensionless Git Bash command path, and failures SHALL include actionable fallback guidance.

#### Scenario: Installed executable reports a version
- **WHEN** the installer has replaced files in the install directory
- **THEN** it runs `arashi.bin.exe --version` without depending on PowerShell script execution policy and reports success if the command exits successfully with version output

#### Scenario: Fresh Git Bash resolves the installed command
- **WHEN** a fresh Git Bash process inherits a user PATH containing the install directory
- **THEN** invoking the extensionless `arashi --version` command executes the colocated `arashi.bin.exe` and returns successful version output

#### Scenario: Smoke test fails
- **WHEN** an installed executable or Git Bash command smoke test exits non-zero
- **THEN** validation fails, any in-progress installer transaction restores the pre-install managed payload, and the failure reports the command with direct GitHub release/manual install fallback guidance where user remediation is required

#### Scenario: Install succeeds
- **WHEN** downloads, checksum validation, coherent file replacement, PATH handling, and installer smoke testing complete successfully
- **THEN** the installer reports the installed Arashi version, install directory, and next step for using `arashi` from a new terminal

### Requirement: Windows direct-installer updates
Arashi SHALL update Windows direct-binary installs by deferring the PowerShell installer until the current Arashi process can exit, and the deferred installer MUST apply the same verified four-file payload and rollback contract as a fresh install. Arashi SHALL pin the detected latest version after a successful release check and SHALL omit the version pin only for an explicitly confirmed fallback after identified GitHub API rate limiting.

#### Scenario: Windows direct install runs update with confirmed known release
- **WHEN** a Windows direct-binary install runs `arashi update --yes` after detecting a newer release
- **THEN** Arashi starts the hosted PowerShell installer for the detected latest version, targets the current binary directory, disables PATH mutation, and passes the current process ID for deferred replacement

#### Scenario: Windows direct install accepts rate-limited fallback
- **WHEN** a Windows direct-binary install receives an identified rate-limited HTTP 403 and the fallback is confirmed interactively or with `--yes`
- **THEN** Arashi starts the hosted PowerShell installer after removing `ARASHI_VERSION` from the spawned environment, including any inherited caller value, targets the current binary directory, disables PATH mutation, and passes the current process ID for deferred replacement

#### Scenario: Deferred installer waits for the running process
- **WHEN** the PowerShell installer receives a parent process ID from `ARASHI_WAIT_FOR_PID`
- **THEN** it waits for that process to exit before replacing installed files and reports a timeout with rerun guidance if the process does not exit in time

#### Scenario: Deferred update installs Git Bash support
- **WHEN** the deferred installer validates and replaces a supported Windows direct installation
- **THEN** the updated coherent payload includes `arashi.bin.exe`, `arashi`, `arashi.ps1`, and `arashi.bat`

#### Scenario: POSIX direct install runs update with confirmed known release
- **WHEN** a macOS or Linux direct-binary install runs `arashi update --yes` after detecting a newer release
- **THEN** Arashi continues to use the POSIX curl/bash installer against the current binary directory without mutating shell integration or PATH and pins the detected latest version

#### Scenario: POSIX direct install accepts rate-limited fallback
- **WHEN** a macOS or Linux direct-binary install receives an identified rate-limited HTTP 403 and the fallback is confirmed interactively or with `--yes`
- **THEN** Arashi uses the POSIX curl/bash installer against the current binary directory without mutating shell integration or PATH and after removing `ARASHI_VERSION` from the spawned environment, including any inherited caller value

### Requirement: Windows installer implementation coverage
The Windows installer implementation SHALL have automated coverage for deterministic helper behavior, supported option handling, managed release payload completeness, and the actual Git Bash command path.

#### Scenario: Helper tests run
- **WHEN** repository tests run for the installer implementation
- **THEN** they cover architecture detection, asset URL construction, checksum parsing or verification, install directory selection, no-modify-PATH behavior, four-file destination mapping, fresh and partial pre-existing payloads, rollback after replacement and smoke-test failures, and rollback-failure reporting

#### Scenario: Wrapper regression tests run
- **WHEN** repository tests exercise the extensionless `arashi` wrapper
- **THEN** they prove `arashi.bin.exe` selection on Windows/Git Bash and preserve existing macOS/Linux selection, argument forwarding, and conditional stdin behavior

#### Scenario: Release contract tests run
- **WHEN** release validation inspects published assets and `arashi-checksums.txt`
- **THEN** it requires the extensionless `arashi` wrapper together with the Windows binary and both Windows-specific wrappers

#### Scenario: Git Bash smoke validation runs
- **WHEN** Windows CI validates the direct-install payload
- **THEN** a hermetic run of canonical `install.ps1` against a deterministic same-release fixture uses the default `%USERPROFILE%\.arashi\bin` destination, persists that directory to user PATH, and returns successful version output in separately launched Git for Windows Bash, PowerShell, and Command Prompt processes using the installer-produced wrappers
- **AND** the harness restores the runner's original persistent user PATH and removes its temporary user profile even when installation or shell validation fails

#### Scenario: Documentation publish path is tested or smoke-checked
- **WHEN** docs/build validation runs for the hosted installer endpoint
- **THEN** it verifies that `install.ps1` is present at the published `/install.ps1` path

### Requirement: Installed Windows shell wrapper parity
The installed Windows payload MUST provide shell-appropriate `arashi` entry points for Git Bash, PowerShell, and Command Prompt that execute the same colocated `arashi.bin.exe`, forward the user's arguments, and preserve stdin for interactive commands.

#### Scenario: Git Bash resolves the extensionless wrapper
- **WHEN** the install directory is on PATH in a fresh process with `MINGW*`, `MSYS*`, or Cygwin shell evidence and the user invokes `arashi <arguments>`
- **THEN** Git Bash executes the extensionless `arashi` wrapper, which forwards the arguments to the colocated `arashi.bin.exe`

#### Scenario: POSIX shell has a stray Windows executable
- **WHEN** the extensionless wrapper runs on macOS or Linux without `arashi.bin` but a colocated `arashi.bin.exe` exists
- **THEN** it does not select the Windows executable and follows the existing supported-platform fallback or error behavior

#### Scenario: PowerShell resolves its existing wrapper
- **WHEN** the install directory is on PATH in PowerShell and the user invokes `arashi <arguments>` through the installed PowerShell wrapper
- **THEN** the wrapper forwards the arguments to the colocated `arashi.bin.exe`

#### Scenario: Command Prompt resolves its existing wrapper
- **WHEN** the install directory is on PATH in Command Prompt and the user invokes `arashi <arguments>` through `arashi.bat`
- **THEN** the wrapper forwards the arguments to the colocated `arashi.bin.exe`

#### Scenario: Interactive command uses a Windows shell wrapper
- **WHEN** a user runs an interactive Arashi command through the Git Bash, PowerShell, or Command Prompt entry point
- **THEN** the wrapper leaves interactive stdin available to `arashi.bin.exe`
