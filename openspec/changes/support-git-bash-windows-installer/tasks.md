## 1. Wrapper and Installer TDD

- [ ] 1.1 Add failing wrapper regression tests for colocated `arashi.bin.exe` selection plus retained POSIX binary selection, argument forwarding, and conditional stdin behavior.
- [ ] 1.2 Add failing PowerShell installer tests for the extensionless wrapper's same-release download, checksum verification, installed destination, fallback guidance, and preserved latest/pinned/custom-directory/no-PATH/deferred-update behavior.
- [ ] 1.3 Add failing transaction tests for fresh and partial pre-existing payloads, destination failure after mutation begins, smoke-test failure, exact restoration/removal, and rollback-failure backup/reporting behavior.
- [ ] 1.4 Add a failing Windows integration fixture that runs canonical `install.ps1` with default options in an isolated temporary user environment against a deterministic same-release payload, verifies `%USERPROFILE%\.arashi\bin` and persistent user PATH, launches fresh Git Bash/PowerShell/Command Prompt processes from persisted PATH, and unconditionally restores the runner environment.
- [ ] 1.5 Add failing release-contract checks for one canonical required asset set across installer metadata, `.releaserc.json`, `scripts/generate-checksums.sh`, and the maintained Windows archive.
- [ ] 1.6 Add failing semantic documentation checks for Git Bash support, the verified four-file manual payload, persistent user-PATH inheritance, new-shell guidance, and no shell-profile mutation before editing canonical or generated docs.

## 2. CLI Repository Implementation

- [ ] 2.1 Update `bin/arashi` to execute a colocated `arashi.bin.exe` only with explicit MINGW/MSYS/Cygwin evidence, retain `arashi.bin` precedence, and preserve existing macOS/Linux resolution, symlink, argument/exit-code, and stdin behavior.
- [ ] 2.2 Update `scripts/install.ps1` to stage and verify `arashi`, then install `arashi.bin.exe`, `arashi`, `arashi.ps1`, and `arashi.bat` as a recoverable coherent set with cleanup after success or rollback.
- [ ] 2.3 Update release and archive producers to satisfy the canonical asset-set checks, including `scripts/package-releases.sh` and its Windows archive guidance.
- [ ] 2.4 Update `README.md` and `docs/INSTALLATION.md` with Git Bash command resolution, new-shell PATH inheritance, no shell-profile mutation, manual verified payload contents, and troubleshooting guidance.

## 3. Windows Shell Validation

- [ ] 3.1 Run the pre-existing default-installer Windows integration fixture and require the installer-produced Git Bash, PowerShell, and Command Prompt command paths plus environment cleanup to pass.
- [ ] 3.2 Run the installer-option, transaction/rollback, wrapper-selection/stdin, release-contract, and deferred-update regression fixtures.
- [ ] 3.3 Run the CLI repository's focused wrapper, installer, rollback, release-contract, and Windows smoke tests, then its complete format/lint, test, typecheck, and multi-platform build gates.

## 4. Docs Site Guidance

- [ ] 4.1 Update Windows onboarding and troubleshooting content to keep PowerShell as the canonical installer while documenting Git Bash support and the requirement to open a new shell after PATH changes.
- [ ] 4.2 Update manual fallback guidance to include all four managed payload files from one release and checksum verification without adding Git Bash profile edits.
- [ ] 4.3 Regenerate agent-readable documentation exports if affected and satisfy the pre-existing semantic content checks for the Git Bash/new-shell guidance.
- [ ] 4.4 Audit `repos/arashi-skills` for duplicated stale Windows command-not-found guidance; update only the smallest troubleshooting reference if needed, otherwise record that canonical docs routing remains correct.
- [ ] 4.5 Run docs and any affected skill-package formatting, validation, build, and rendered/content checks for the affected install surfaces and generated exports.

## 5. Coordinated Delivery

- [ ] 5.1 Open cross-linked CLI and docs implementation PRs using non-closing references to `corwinm/arashi-arashi#241`, and record final local and CI validation evidence.
- [ ] 5.2 Reconcile OpenSpec tasks and validate `support-git-bash-windows-installer` after the final implementation and documentation edits.
- [ ] 5.3 Verify the packaged release payload and checksum manifest contain `arashi`, `arashi.bin.exe`'s source release binary, `arashi.ps1`, and `arashi.bat`, then prepare the meta change for archive/sync and final issue closeout after child PRs are green.
