## Why

Arashi's PowerShell installer installs only Windows-specific executable and wrapper filenames, so the default installation is not discoverable as `arashi` in Git Bash, which does not reliably apply Windows `PATHEXT` command resolution. The existing extensionless Bash wrapper is already published and checksum-covered, so the Windows payload can support Git Bash without introducing a second installer or shell-profile mutation path.

## What Changes

- Extend the maintained extensionless `arashi` wrapper to select `arashi.bin.exe` when it is installed beside the wrapper on Windows/Git Bash, while preserving existing macOS/Linux binary selection and interactive stdin behavior.
- Make `install.ps1` download the extensionless `arashi` asset from the selected release, verify it against `arashi-checksums.txt`, and install it transactionally with `arashi.bin.exe`, `arashi.ps1`, and `arashi.bat`.
- Preserve the existing persistent Windows user PATH, pinned-version, custom-directory, no-PATH-modification, deferred-update, Command Prompt, and PowerShell contracts; do not edit Git Bash profile files.
- Cover wrapper selection, Windows installer asset/checksum/install behavior, release payload completeness, and a Windows Git Bash `arashi --version` smoke path in automated validation.
- Update Windows installation and troubleshooting documentation to identify Git Bash support and require a newly opened shell after PATH changes.
- Keep the hosted PowerShell installer as the canonical Windows installation path. POSIX-installer delegation from Git Bash is deferred unless implementation research demonstrates a necessary, independently justified convenience path.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `windows-powershell-installer`: Expand the verified Windows release payload and coherent installed set with the extensionless Bash wrapper, define Git Bash command resolution and smoke validation, and preserve existing installer/update options and Windows shell behavior.
- `docs-landing-and-social-content`: Extend Windows installation guidance to state Git Bash support and the new-shell requirement after user PATH changes without changing PowerShell's status as the canonical Windows installer.

## Impact

- `repos/arashi/bin/arashi`, `scripts/install.ps1`, release/checksum/archive packaging contracts, installer/wrapper/release tests, Windows CI smoke coverage, `README.md`, and `docs/INSTALLATION.md`.
- `repos/arashi-docs` Windows installation and troubleshooting content plus generated agent-readable exports and semantic content checks where those pages are represented.
- `repos/arashi-skills` is an audit surface only: update its smallest troubleshooting reference if it duplicates stale installation recovery guidance; otherwise keep routing to canonical platform-aware docs.
- Existing `corwinm/arashi` terminal-launch behavior, including the separate work on `corwinm/arashi#106`, remains out of scope.
- No new runtime dependency, installer endpoint, shell-profile mutation, or Git for Windows installation behavior is introduced.
