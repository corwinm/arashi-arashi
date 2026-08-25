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
- **THEN** the installer downloads `arashi-windows-x64.exe`, `arashi`, `arashi.ps1`, `arashi.bat`, `aw`, `aw.ps1`, `aw.bat`, and `arashi-checksums.txt` from the latest Arashi release download endpoint

#### Scenario: Pinned install resolves versioned release URLs

- **WHEN** the user provides `-Version 1.15.0` or sets `ARASHI_VERSION=1.15.0`
- **THEN** the installer downloads every required canonical and alias asset from the `v1.15.0` release download endpoint

#### Scenario: Download fails

- **WHEN** any required release asset cannot be downloaded
- **THEN** the installer exits non-zero without replacing installed files and prints the direct GitHub Releases fallback URL

### Requirement: Windows installer checksum validation

The Windows installer MUST verify SHA-256 checksums for every downloaded install asset before replacing installed files.

#### Scenario: Checksums match manifest

- **WHEN** the downloaded checksum manifest contains matching SHA-256 entries for the executable and `arashi`, `arashi.ps1`, `arashi.bat`, `aw`, `aw.ps1`, and `aw.bat` wrapper assets
- **THEN** the installer treats the staged downloads as eligible for installation

#### Scenario: Checksum entry is missing

- **WHEN** the checksum manifest does not contain an expected asset entry, including either extensionless `arashi` or `aw` wrapper
- **THEN** the installer exits non-zero before replacing installed files and identifies the missing asset entry

#### Scenario: Checksum mismatch is detected

- **WHEN** a downloaded asset hash differs from the checksum manifest entry
- **THEN** the installer exits non-zero before replacing installed files and reports the failed asset plus fallback guidance

### Requirement: Windows user-level install layout

The Windows installer SHALL install Arashi into a user-writable bin directory by default, SHALL support an explicit install-directory override, and MUST replace its canonical and alias executable payload plus versioned `.arashi-managed-entrypoints.json` ownership ledger as one recoverable set. Before downloads, directory creation, backups, target mutation, or PATH changes, it MUST reject each existing required alias destination unless it is a readable marked regular file whose current hash/path matches a valid ledger bound to the selected install directory; malformed/mismatched ledgers, directories, symlinks, reparse points, unreadable paths, and filesystem-backed alias commands resolved outside the selected directory MUST fail closed. Git Bash collision evidence MUST be collected from a verified Git for Windows Bash rather than an arbitrary PATH-preferred `bash.exe`, and the result MUST be converted through that shell's native path conversion before comparison with the exact managed alias destinations.

#### Scenario: Default install directory is used

- **WHEN** no install directory override is provided
- **THEN** the installer installs into `%USERPROFILE%\.arashi\bin`

#### Scenario: Custom install directory is used

- **WHEN** the user provides `-InstallDir C:\Tools\Arashi` or sets `ARASHI_INSTALL_DIR=C:\Tools\Arashi`
- **THEN** the installer installs all Arashi files into the specified directory

#### Scenario: Verified staged files are installed together

- **WHEN** all staged asset checksums pass and replacement succeeds
- **THEN** the installer writes `arashi.bin.exe`, `arashi`, `arashi.ps1`, `arashi.bat`, `aw`, `aw.ps1`, and `aw.bat` into the install directory as one coherent installed set
- **AND** atomically records the three alias paths, hashes, release version, and selected install directory in `.arashi-managed-entrypoints.json`

#### Scenario: Validation fails before replacement

- **WHEN** download or checksum validation fails
- **THEN** the installer preserves any existing installed files in the target directory

#### Scenario: Replacement or smoke test fails after mutation begins

- **WHEN** replacing any managed payload destination, running either post-install executable smoke test, or committing the ownership ledger fails after mutation begins
- **THEN** the installer exits non-zero after restoring every managed destination and prior ledger to their exact pre-install state, including removing newly created managed files or ledger that were previously absent, and reports the failed phase

#### Scenario: Rollback fails

- **WHEN** the installer cannot restore one or more managed destinations or the prior ownership ledger after a replacement, smoke-test, or ledger-commit failure
- **THEN** it exits non-zero, identifies the rollback failure, retains recoverable backups, and prints actionable manual recovery guidance

#### Scenario: Unrelated alias destination is present

- **WHEN** `aw`, `aw.ps1`, or `aw.bat` exists as an unmarked regular file or as a marked file without matching ledger ownership
- **THEN** the installer exits non-zero before downloads, directory creation, backups, replacing any installed destination, or modifying PATH
- **AND** identifies the exact collision path with deliberate move-or-remove guidance

#### Scenario: Alias destination type is ambiguous

- **WHEN** any required alias destination or ownership ledger is malformed, mismatched, a directory, symlink, reparse point, unreadable path, or otherwise cannot be proven through marker plus ledger-hash ownership
- **THEN** the installer fails closed before downloads or installed-state mutation and preserves the path unchanged

#### Scenario: Existing aw command resolves outside the selected directory

- **WHEN** PowerShell, Command Prompt, or verified Git for Windows Bash PATH evidence resolves a filesystem-backed `aw` outside the selected install directory
- **THEN** the installer reports the resolved collision and exits before downloads, directory creation, backups, target replacement, or PATH changes
- **AND** does not execute or alter the unrelated command

#### Scenario: Another Bash precedes Git for Windows on PATH

- **WHEN** WSL, Cygwin, or another unrelated `bash.exe` precedes Git for Windows on the invoking PowerShell PATH
- **THEN** the installer does not use that arbitrary Bash for Git Bash collision evidence
- **AND** locates a verified Git for Windows Bash from installed Git evidence
- **AND** converts `command -v aw` through that Git Bash process to a native Windows path before exact managed-destination comparison
- **AND** an installer-owned alias is not rejected because an unrelated shell would describe it as `/mnt/<drive>/...`, `/cygdrive/<drive>/...`, or another foreign path form

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
- **THEN** the installer has written the verified seven-file canonical-plus-alias executable payload plus ownership ledger to `%USERPROFILE%\.arashi\bin`, the persistent user PATH contains that directory exactly once, and extensionless `arashi --version` plus `aw --version` resolve successfully with identical output and without a Git Bash profile edit

### Requirement: Windows install smoke test and fallback reporting

The Windows installer SHALL verify the installed native executable and both canonical and alias entrypoints after installation, the Windows validation workflow MUST verify both extensionless Git Bash command paths, and failures SHALL include actionable fallback guidance.

#### Scenario: Installed executable reports a version

- **WHEN** the installer has replaced files in the install directory
- **THEN** it runs `arashi.bin.exe --version` without depending on PowerShell script execution policy, then smoke-tests installed `arashi` and `aw` entrypoints
- **AND** reports success only when all commands exit successfully with identical non-empty version output

#### Scenario: Fresh Git Bash resolves the installed command

- **WHEN** a fresh Git Bash process inherits a user PATH containing the install directory
- **THEN** invoking extensionless `arashi --version` and `aw --version` executes the colocated `arashi.bin.exe` and returns identical successful version output

#### Scenario: Smoke test fails

- **WHEN** an installed native, canonical-wrapper, alias-wrapper, or Git Bash command smoke test exits non-zero or the version outputs differ
- **THEN** validation fails, any in-progress installer transaction restores the pre-install managed payload and prior ownership ledger, and the failure reports the command with direct GitHub release/manual install fallback guidance where user remediation is required

#### Scenario: Install succeeds

- **WHEN** downloads, checksum validation, coherent file replacement, PATH handling, and installer smoke testing complete successfully
- **THEN** the installer reports the installed Arashi version, install directory, and next step for using canonical `arashi` or shorthand `aw` from a new terminal

### Requirement: Windows direct-installer updates

Arashi SHALL update Windows direct-binary installs by deferring the PowerShell installer until the current Arashi process can exit, and the deferred installer MUST apply the same verified seven-file canonical-plus-alias executable payload, ownership-ledger commit, and rollback contract as a fresh install. Arashi SHALL pin the detected latest version after a successful release check and SHALL omit the version pin only for an explicitly confirmed fallback after identified GitHub API rate limiting.

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
- **THEN** the updated coherent payload includes `arashi.bin.exe`, `arashi`, `arashi.ps1`, `arashi.bat`, `aw`, `aw.ps1`, and `aw.bat`
- **AND** the committed ownership ledger matches every installed alias hash

#### Scenario: POSIX direct install runs update with confirmed known release

- **WHEN** a macOS or Linux direct-binary install runs `arashi update --yes` after detecting a newer release
- **THEN** Arashi continues to use the POSIX curl/bash installer against the current binary directory without mutating shell integration or PATH and pins the detected latest version

#### Scenario: POSIX direct install accepts rate-limited fallback

- **WHEN** a macOS or Linux direct-binary install receives an identified rate-limited HTTP 403 and the fallback is confirmed interactively or with `--yes`
- **THEN** Arashi uses the POSIX curl/bash installer against the current binary directory without mutating shell integration or PATH and after removing `ARASHI_VERSION` from the spawned environment, including any inherited caller value

#### Scenario: Deferred update encounters an unrelated alias

- **WHEN** the deferred installer finds an unmarked, ledger-mismatched, PATH-resolved external, or ambiguous required alias destination
- **THEN** it exits non-zero before downloads or replacing the existing canonical installation
- **AND** reports the exact collision without claiming that the update completed

### Requirement: Windows installer implementation coverage

The Windows installer implementation SHALL have automated coverage for deterministic helper behavior, supported option handling, managed canonical-plus-alias release payload completeness, collision ownership, and the actual Git Bash, PowerShell, and Command Prompt paths for both executable names.

#### Scenario: Helper tests run

- **WHEN** repository tests run for the installer implementation
- **THEN** they cover architecture detection, asset URL construction, checksum parsing or verification, install directory selection, no-modify-PATH behavior, seven-file destination mapping, ownership-ledger schema/path/hash validation and atomic commit, absent/managed/unmarked/manual/PATH-resolved/ambiguous alias states, selection of verified Git for Windows Bash despite unrelated Bash PATH precedence, native conversion of Git Bash command paths, fresh and partial pre-existing payloads, rollback after replacement/smoke/ledger failures, and rollback-failure reporting

#### Scenario: Wrapper regression tests run

- **WHEN** repository tests exercise extensionless `arashi` and `aw` wrappers
- **THEN** they prove both select one `arashi.bin.exe` on Windows/Git Bash and preserve canonical and alias macOS/Linux selection, argument forwarding, managed markers, and conditional stdin behavior

#### Scenario: Release contract tests run

- **WHEN** release validation inspects published assets and `arashi-checksums.txt`
- **THEN** it requires extensionless `arashi` and `aw` wrappers together with the Windows binary and canonical-plus-alias PowerShell and CMD wrappers

#### Scenario: Git Bash smoke validation runs

- **WHEN** Windows CI validates the direct-install payload
- **THEN** a hermetic run of canonical `install.ps1` against a deterministic same-release fixture uses the default `%USERPROFILE%\.arashi\bin` destination, persists that directory to user PATH, and returns identical successful `arashi` and `aw` version output in separately launched Git for Windows Bash, PowerShell, and Command Prompt processes using the installer-produced wrappers
- **AND** the harness restores the runner's original persistent user PATH and removes its temporary user profile even when installation or shell validation fails

#### Scenario: Documentation publish path is tested or smoke-checked

- **WHEN** docs/build validation runs for the hosted installer endpoint
- **THEN** it verifies that `install.ps1` is present at the published `/install.ps1` path

### Requirement: Installed Windows shell wrapper parity

The installed Windows payload MUST provide shell-appropriate canonical `arashi` and alias `aw` entry points for Git Bash, PowerShell, and Command Prompt that execute the same colocated `arashi.bin.exe`, forward the user's arguments, and preserve stdin for interactive commands.

#### Scenario: Git Bash resolves the extensionless wrapper

- **WHEN** the install directory is on PATH in a fresh process with `MINGW*`, `MSYS*`, or Cygwin shell evidence and the user invokes `arashi <arguments>` or `aw <arguments>`
- **THEN** Git Bash executes the matching extensionless wrapper, which forwards the arguments to the colocated `arashi.bin.exe`

#### Scenario: POSIX shell has a stray Windows executable

- **WHEN** either extensionless wrapper runs on macOS or Linux without `arashi.bin` but a colocated `arashi.bin.exe` exists
- **THEN** it does not select the Windows executable and follows the existing supported-platform fallback or error behavior

#### Scenario: PowerShell resolves its existing wrapper

- **WHEN** the install directory is on PATH in PowerShell and the user invokes `arashi <arguments>` or `aw <arguments>` through the matching installed PowerShell wrapper
- **THEN** the wrapper forwards the arguments to the colocated `arashi.bin.exe`

#### Scenario: Command Prompt resolves its existing wrapper

- **WHEN** the install directory is on PATH in Command Prompt and the user invokes `arashi <arguments>` through `arashi.bat` or `aw <arguments>` through `aw.bat`
- **THEN** the matching wrapper forwards the arguments to the colocated `arashi.bin.exe`

#### Scenario: Interactive command uses a Windows shell wrapper

- **WHEN** a user runs an interactive Arashi command through the Git Bash, PowerShell, or Command Prompt canonical or alias entry point
- **THEN** the wrapper leaves interactive stdin available to `arashi.bin.exe`

#### Scenario: Windows alias launchers prove managed ownership

- **WHEN** release or installer validation inspects `aw`, `aw.ps1`, and `aw.bat`
- **THEN** each contains the exact shell-appropriate Arashi-managed alias marker
- **AND** delegates to the same adjacent `arashi.bin.exe` without independent command behavior

### Requirement: PowerShell installer writes equivalent minimal uninstall ownership

The official PowerShell installer SHALL install the complete current Windows payload including `uninstall.ps1`, record exact file roles/digests in the schema-v2 official-direct manifest, and record the exact user-PATH entry spelling plus whether the installer created it. It SHALL NOT claim machine PATH, pre-existing user PATH, parent directories, shell blocks, project state, or unrelated files.

#### Scenario: Installer appends the user PATH entry

- **WHEN** the exact install-directory entry was absent and the installer appends it to user PATH
- **THEN** the manifest records the exact stored spelling and `created: true`

#### Scenario: User PATH entry pre-exists

- **WHEN** an equivalent required entry already exists before installation
- **THEN** the manifest records `created: false`
- **AND** uninstall never removes that entry

### Requirement: Bundled PowerShell helper performs deferred narrow cleanup

The bundled PowerShell helper SHALL accept an explicit install directory or deterministic default, support `-DryRun` and `-Yes`, wait for an optional parent PID, re-read the local manifest, reject reparse points and modified present files, remove only exact created user-PATH state and manifest-owned payload, remove the manifest last, and narrowly delete its temporary copy. It SHALL never scan PATH or the filesystem for candidates.

#### Scenario: Running executable hands off on Windows

- **WHEN** confirmed direct uninstall stages the bundled helper and passes its parent PID
- **THEN** the helper waits for the parent process to exit before deleting active wrappers or executable files

#### Scenario: CLI is unavailable

- **WHEN** the user runs the helper directly with `-InstallDir` and `-DryRun`
- **THEN** it prints the same bounded ownership plan without invoking Arashi
- **AND** performs no mutation

#### Scenario: Partial prior removal is retried

- **WHEN** the valid manifest remains and one listed payload file is already absent
- **THEN** the helper skips that exact item, revalidates every remaining present item, and can finish manifest-last cleanup
