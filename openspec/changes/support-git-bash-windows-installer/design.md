## Context

The direct Windows install flow is owned by `repos/arashi/scripts/install.ps1`. It downloads `arashi-windows-x64.exe`, `arashi.ps1`, `arashi.bat`, and `arashi-checksums.txt` from one release, verifies the executable and wrappers, installs the binary as `arashi.bin.exe`, updates the persistent user PATH unless disabled, and supports deferred replacement for `arashi update --yes`.

The release already publishes and checksums `bin/arashi`, the extensionless Bash wrapper used by the POSIX installer. That wrapper currently starts from `arashi.bin` and falls back only to macOS ARM64 or Linux x64 release filenames. In Git Bash, invoking `arashi` requires an extensionless file on PATH; neither `arashi.bat` nor `arashi.ps1` is a reliable replacement because Git Bash does not consistently resolve Windows `PATHEXT` entries for a bare command.

This installation concern is separate from preserving or launching a user's terminal host. The active `corwinm/arashi#106` work remains independent and is not a dependency of this change.

## Goals / Non-Goals

**Goals:**

- Install one maintained extensionless wrapper that can execute `arashi.bin.exe` from Git Bash while preserving current POSIX behavior and stdin handling.
- Treat the wrapper as a required release asset: same-release download, checksum verification, coherent replacement, rollback, and deferred-update parity.
- Preserve the existing PowerShell and Command Prompt entry points, installer options, user-PATH behavior, and direct-update flow.
- Prove the installed command path with deterministic tests and a real Windows Git Bash smoke invocation.
- Explain Git Bash support and new-shell PATH inheritance in CLI and docs-site guidance.

**Non-Goals:**

- Installing Git for Windows or Git Bash.
- Editing `.bashrc`, `.bash_profile`, or other Git Bash profile files.
- Reimplementing Windows installation behavior in Bash or changing the canonical Windows installer away from PowerShell.
- Changing terminal detection, terminal switching, or launcher behavior covered by `corwinm/arashi#106`.
- Supporting additional Windows architectures.

## Decisions

### 1. Reuse the existing extensionless release wrapper

`bin/arashi` remains the only maintained Bash wrapper. Its binary resolution will retain `arashi.bin` as the normal installed/POSIX candidate, recognize a colocated `arashi.bin.exe` only under explicit `MINGW*`, `MSYS*`, or Cygwin `uname` evidence, and retain existing platform-specific release-name fallback behavior. If both `arashi.bin` and `arashi.bin.exe` exist, `arashi.bin` retains precedence. A stray `.exe` must never be selected on macOS or Linux merely because it exists. The wrapper's symlink resolution, argument/exit-code forwarding, interactive stdin, and narrowly scoped stdin closure for piped `list`/forced `remove` remain unchanged.

A separate `arashi-git-bash` wrapper was rejected because it would duplicate wrapper behavior and create another release, checksum, documentation, and update contract.

### 2. Keep PowerShell as the single Windows installer authority

`install.ps1` will add the `arashi` wrapper to its required asset set. Latest and pinned installs will resolve it from the same release as every other payload file, validate its manifest entry before mutation, and install it under the extensionless name.

Delegation from `install.sh` is not part of this change. The existing `MINGW*`, `MSYS*`, and Cygwin rejection remains until a separate convenience requirement justifies forwarding arguments and environment to hosted PowerShell without creating a second Windows implementation.

### 3. Replace the four-file payload as one recoverable set

The staged payload is:

- `arashi-windows-x64.exe` → `arashi.bin.exe`
- `arashi` → `arashi`
- `arashi.ps1` → `arashi.ps1`
- `arashi.bat` → `arashi.bat`

All downloads and checksums must succeed before replacement starts. Before mutation, replacement must back up the complete pre-existing state of all four managed destinations, including which files were absent in a fresh or partial installation. It must restore that exact state if any destination update or the post-install executable smoke test fails, including during deferred updates. A successful rollback removes new managed files that did not exist before the attempt; temporary and backup files are cleaned after success or completed rollback. If rollback itself fails, the installer must exit non-zero, identify the rollback failure, and retain recoverable backups with actionable manual recovery guidance. This makes the issue's transactional requirement explicit rather than treating sequential per-file moves as sufficient.

Atomic directory replacement was rejected because the install directory may be user-selected and may contain unrelated files. Per-file backup and rollback keeps ownership limited to Arashi-managed payload names.

### 4. Reuse persistent Windows user PATH without shell profiles

The installer continues to add only the install directory to the persistent Windows user PATH, with case-insensitive duplicate detection and existing no-modify-PATH behavior. It will not write Git Bash startup files. Success and troubleshooting guidance will explicitly tell users to open a new Git Bash window after installation or a PATH change.

### 5. Validate both contracts and the actual shell path

Deterministic tests will cover wrapper binary selection, installer asset lists, checksum loops, destination mappings, rollback, and preserved option/deferred-update behavior. Release metadata and checksum tests will prove the extensionless asset remains published and manifest-covered.

A Windows CI integration path will execute the canonical `install.ps1` orchestration with no install-directory or no-PATH override in an isolated temporary `USERPROFILE`. The harness will intercept only the release-download boundary with a deterministic same-release fixture containing the actual four-file payload and checksum manifest; it must not add a public alternate-source installer option. It will snapshot and restore the runner's persistent user PATH in a `finally` path. After installation, it will reconstruct a child-process PATH from persisted machine and user values to model a newly opened shell, then require successful version output from Git for Windows Bash via extensionless `arashi`, PowerShell via `arashi.ps1`, and Command Prompt via `arashi.bat`. This proves the default `%USERPROFILE%\.arashi\bin` destination, persistent PATH mutation, installed payload, and fresh-shell command resolution together rather than manually staging files or injecting a process-only PATH. Regression fixtures will also prove a colocated `.exe` is ignored without Windows shell evidence.

## Risks / Trade-offs

- **Git Bash executable-bit or checkout behavior differs between environments** → Exercise the installer-produced wrapper through Git for Windows Bash on `windows-latest`; assert the extensionless command path rather than only source text.
- **Default-install validation mutates the CI account's persistent user PATH** → Snapshot the exact value, use a unique temporary `USERPROFILE`, restore PATH in an unconditional cleanup path, and fail validation if cleanup cannot be confirmed.
- **Adding a fourth managed file increases partial-update risk** → Validate all assets before mutation and use explicit backup/rollback for every managed destination.
- **A stale release without the wrapper cannot satisfy a newly fetched installer** → The hosted installer on `main` and release payload are already version-coupled by selected release; tests must prove supported releases contain the asset, and failures must preserve the installed set with release fallback guidance.
- **PATH changes are not visible to the current Git Bash process** → Continue persistent user-PATH mutation only and document that a new shell is required.
- **Wrapper changes could regress POSIX/fzf behavior** → Retain selection precedence, argument forwarding, and conditional stdin closure, with regression tests for existing macOS/Linux candidates and piped interactive commands.

## Migration Plan

1. Land and release the CLI wrapper, installer, tests, release-contract updates, and CLI installation docs.
2. Land docs-site guidance and generated-content checks, cross-linked to the CLI implementation.
3. Verify the first release includes `arashi`, all Windows wrappers, the Windows binary, and corresponding checksum entries.
4. Existing installations receive the extensionless wrapper on the next direct installer run or deferred `arashi update --yes`; no configuration migration is required.
5. Roll back by reverting the release change. Installer rollback preserves the previous managed payload when an individual installation fails.

## Open Questions

None. POSIX-installer delegation is intentionally excluded from this change and can be proposed separately if demand warrants it.
