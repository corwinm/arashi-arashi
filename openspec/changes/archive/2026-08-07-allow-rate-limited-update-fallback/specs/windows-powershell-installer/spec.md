## MODIFIED Requirements

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
