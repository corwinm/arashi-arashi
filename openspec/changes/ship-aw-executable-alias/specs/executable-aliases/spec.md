## ADDED Requirements

### Requirement: Canonical and alias executable identity
Arashi SHALL ship canonical executable name `arashi` and supported executable alias `aw`, expanded in user-facing alias guidance as “Arashi Workspace.” Both names SHALL dispatch to the same installed package entrypoint or native platform binary. `arashi` SHALL remain canonical for product identity, Commander help and usage, configuration, `ARASHI_*` environment variables, managed shell-block markers, package identity, repositories, and native binary names.

#### Scenario: User invokes the alias help
- **WHEN** a user runs `aw --help`
- **THEN** the invocation succeeds through the same CLI implementation as `arashi --help`
- **AND** help MAY retain canonical `arashi` usage and branding

#### Scenario: User invokes the canonical executable
- **WHEN** an existing user runs any supported `arashi` command after the alias release
- **THEN** canonical command behavior remains supported without configuration or invocation migration

#### Scenario: Companion integration selects an executable
- **WHEN** a maintained editor or packaged skill needs a canonical executable spelling
- **THEN** it continues to use `arashi` unless that surface explicitly teaches the supported shorthand
- **AND** `aw` is not serialized as a Commander command path or subcommand alias

### Requirement: Canonical and alias command parity
For identical arguments, environment, installation, and workspace state, `arashi` and `aw` SHALL preserve equivalent exit status, stdout and stderr contracts, prompts, non-interactive safety, mutations, configured-workspace behavior, zero-config standalone behavior, and parent-shell directives. Canonical product wording MAY differ only by retaining `arashi` where human output names the product or canonical command.

#### Scenario: Representative human commands use both names
- **WHEN** process-level acceptance runs representative inspection and mutating commands through real `arashi` and `aw` entrypoints
- **THEN** both invocations have equivalent exit status, prompt and mutation counts, and semantic human results
- **AND** differences are limited to intentional canonical Arashi wording

#### Scenario: Representative JSON commands use both names
- **WHEN** process-level acceptance runs representative successful and failing JSON commands through both entrypoints
- **THEN** each invocation writes exactly one equivalent structured document to stdout
- **AND** neither entrypoint leaks human progress, banners, prompts, or diagnostics into JSON stdout

#### Scenario: Version parity is checked
- **WHEN** source, compiled, packed-package, installed-direct, or published-release acceptance runs `arashi --version` and `aw --version`
- **THEN** both exit successfully with identical non-empty version output from the same installed implementation

### Requirement: POSIX direct distribution includes a managed alias
Supported macOS and Linux direct releases SHALL publish checksummed `arashi` and `aw` wrappers that execute one adjacent `arashi.bin`, and the canonical POSIX installer SHALL install all three files as one managed payload.

#### Scenario: POSIX release assets are produced
- **WHEN** release metadata, checksum generation, or retained archive packaging enumerates supported POSIX install assets
- **THEN** it includes canonical `arashi`, managed alias `aw`, the applicable platform binary, and the checksum manifest
- **AND** it does not publish a second compiled native binary for `aw`

#### Scenario: Fresh POSIX install succeeds
- **WHEN** the canonical installer downloads and verifies a supported POSIX release and no managed destination collides
- **THEN** it installs `arashi.bin`, `arashi`, and `aw` into the selected directory
- **AND** atomically records the installed alias path, SHA-256 hash, release version, and selected install directory in `.arashi-managed-entrypoints.json`
- **AND** smoke-tests both executable names before PATH or shell-startup mutation

#### Scenario: POSIX update adds or refreshes the alias
- **WHEN** an existing direct installation runs a confirmed official-installer update
- **THEN** the installer replaces the canonical and alias payload coherently in the current binary directory
- **AND** both names report the selected release version afterward

### Requirement: Direct installers fail closed on alias ownership
Every direct alias launcher SHALL carry a stable shell-appropriate Arashi-managed alias marker. Each direct installer SHALL own a versioned `.arashi-managed-entrypoints.json` ledger that binds the selected install directory and every managed alias destination to its SHA-256 hash and release version. Before downloads, directory creation, backups, target replacement, PATH changes, or shell-startup mutation, the installer MUST reject any existing `aw`, `aw.ps1`, or `aw.bat` destination unless it is a readable regular marked file whose hash and path match the valid ledger for that installation. It MUST also reject a malformed or mismatched ledger and a filesystem-backed `aw` command resolved outside the selected install directory. POSIX preflight MUST ignore aliases, functions, builtins, keywords, and other non-filesystem shell names, and MUST compare filesystem-backed command paths by physical identity so a managed wrapper reached through a symlinked PATH directory is not misclassified as external. Windows Git Bash evidence MUST come from verified Git for Windows Bash rather than an arbitrary PATH-preferred `bash.exe`, and its resolved command path MUST be converted through that shell's native path conversion before comparison.

#### Scenario: Alias destination is absent
- **WHEN** a direct installer preflights alias destinations that do not exist and finds no conflicting ownership ledger
- **THEN** it treats the destination as eligible Arashi-managed state for the current transaction

#### Scenario: Managed alias is upgraded
- **WHEN** an alias destination is a readable regular file carrying the exact Arashi-managed marker
- **AND** its current hash and path match a valid ledger bound to the selected install directory
- **THEN** the installer may back it up and replace it through the payload transaction

#### Scenario: Unrelated alias command exists
- **WHEN** any required alias destination is an unmarked regular file or is marked but lacks matching ledger ownership
- **THEN** the installer exits non-zero before downloading assets, creating the destination directory, making backups, replacing any installed file, modifying PATH, or changing shell startup state
- **AND** identifies the exact collision path with guidance to move or remove it deliberately

#### Scenario: Ambiguous alias path exists
- **WHEN** any required alias destination is a directory, symlink, reparse point, unreadable path, or otherwise cannot be proven through marker plus ledger hash ownership
- **THEN** the installer fails closed before downloads or installed-state mutation
- **AND** preserves that path unchanged

#### Scenario: Ownership ledger is malformed or mismatched
- **WHEN** `.arashi-managed-entrypoints.json` exists but has an unsupported schema, another install directory, missing/extra alias ownership, or a hash that disagrees with an existing alias
- **THEN** the installer fails before downloads or mutation and reports the exact ledger defect
- **AND** does not adopt, execute, back up, replace, or remove the ambiguous files

#### Scenario: Manual release wrapper has no installer ownership
- **WHEN** a user manually placed a marked checksummed release alias without an installer ledger
- **THEN** a later direct-installer run treats it as unmanaged and fails before downloads or mutation
- **AND** guidance requires the user to deliberately move or remove the manual alias before retrying so the installer can create managed state

#### Scenario: Alias resolves from another PATH location
- **WHEN** the target alias destination is absent but current POSIX or Windows command resolution finds a filesystem-backed `aw` outside the selected install directory
- **THEN** the installer exits non-zero before downloads, directory creation, backups, file replacement, PATH modification, or shell startup changes
- **AND** reports the resolved collision path without executing or altering it

#### Scenario: Parent shell exports an aw function
- **WHEN** POSIX installer preflight runs in an environment where `aw` resolves as an alias, function, builtin, keyword, or other non-filesystem shell name
- **THEN** filesystem collision preflight does not classify that namespace entry as an external executable
- **AND** does not execute, remove, or replace the namespace entry
- **AND** parent-shell integration continues to preserve it under the shell-namespace collision contract

#### Scenario: Managed alias resolves through a symlinked PATH directory
- **WHEN** the selected install directory contains a ledger- and hash-verified regular `aw` wrapper
- **AND** POSIX PATH resolution returns the same wrapper through a different directory spelling whose physical target is the selected install directory
- **THEN** the installer treats the filesystem result as the managed alias destination and permits the managed upgrade
- **AND** it does not relax rejection of an alias whose final destination path component is itself a symlink

#### Scenario: Windows has another Bash ahead of Git for Windows
- **WHEN** WSL, Cygwin, or another `bash.exe` wins ordinary Windows PATH precedence while Git for Windows is installed
- **THEN** Windows collision preflight obtains Git Bash evidence only from the verified Git for Windows Bash
- **AND** converts the Git Bash result to a native Windows path through that shell before managed-destination comparison
- **AND** does not reject an installer-owned alias because another Bash emitted `/mnt/<drive>/...`, `/cygdrive/<drive>/...`, or another foreign path spelling

### Requirement: POSIX direct installation is recoverable as one payload
The POSIX installer MUST preflight ownership before downloads, verify staged assets, back up the complete pre-existing managed payload and ownership ledger, replace canonical and alias files, smoke-test both names, and atomically commit the new ledger before discarding backups. From the start of managed mutation until successful ledger commit and backup removal, it MUST keep transaction-scoped `HUP`, `INT`, `TERM`, and abnormal-exit rollback handling armed. It MUST restore every destination and prior ledger to their exact prior state after interruption or replacement, smoke-test, or ledger-commit failure; MUST preserve the interrupted or non-zero outcome rather than continue installation; and MUST preserve unrelated neighboring files and transaction sidecars.

#### Scenario: POSIX replacement succeeds
- **WHEN** verified staged files replace every managed POSIX destination, both smoke tests pass with identical output, and the new alias ledger commits atomically
- **THEN** the installer removes transaction backups and proceeds to optional PATH and shell integration

#### Scenario: POSIX replacement or smoke test fails
- **WHEN** replacement of any managed file, either executable smoke test, or ownership-ledger commit fails after mutation begins
- **THEN** the installer restores all pre-existing managed files exactly
- **AND** restores the previous ownership ledger exactly or removes the new ledger when none existed
- **AND** removes only newly created managed destinations that were absent before the invocation

#### Scenario: POSIX transaction is terminated after mutation begins
- **WHEN** the installer receives `HUP`, `INT`, or `TERM`, or exits abnormally, after any managed destination may have changed and before successful ledger commit plus backup removal
- **THEN** transaction-scoped handling restores every pre-existing managed file and prior ledger exactly
- **AND** removes only newly created managed destinations and ledger state that were absent before the invocation
- **AND** disarms itself only after rollback or successful commit so it cannot leave a marked alias without ownership evidence
- **AND** the installer terminates non-zero instead of continuing with PATH or shell-startup mutation

#### Scenario: POSIX rollback fails
- **WHEN** one or more managed destinations cannot be restored
- **THEN** the installer exits non-zero, identifies each rollback failure, retains recoverable backups, and prints actionable manual recovery guidance

#### Scenario: Pre-existing transaction neighbor exists
- **WHEN** an unrelated file or directory exists beside a destination with a name resembling installer temporary or backup state
- **THEN** the installer uses unique invocation-owned paths and leaves the unrelated neighbor unchanged

### Requirement: Published release acceptance proves both entrypoints
The feature SHALL NOT be considered delivered until one exact published additive release is verified through npm-managed and official direct-install paths with both executable names on supported POSIX and Windows platforms. The CLI repository SHALL own stable `pnpm release:verify-aw -- <version>` acceptance for public npm plus official pinned POSIX installation and a manual-dispatch native Windows stage that accepts the same exact version; neither gate SHALL accept an implicit `latest` substitute.

#### Scenario: Published-release gate lacks an exact version
- **WHEN** the post-publication entrypoint receives no version, `latest`, or a version not yet public in the required registry or release channel
- **THEN** it exits unsuccessfully before installation and identifies the missing or unavailable exact-version evidence

#### Scenario: Published npm package is verified
- **WHEN** the release package is available from the public npm registry
- **THEN** the version-pinned repository entrypoint installs that exact package in a clean prefix, resolves both generated shims, exercises canonical first use, and proves identical version output

#### Scenario: Published direct installers are verified
- **WHEN** the release assets and hosted installers are publicly available
- **THEN** the version-pinned POSIX entrypoint and same-version manual-dispatch Windows stage use official installers and resolve both names to that exact installed version
- **AND** Windows verification covers fresh Git Bash, PowerShell, and Command Prompt processes

#### Scenario: One entrypoint fails release verification
- **WHEN** either executable name fails to resolve, dispatch, complete, preserve parent-shell behavior, or report the published version on a required release path
- **THEN** delivery remains incomplete and the failure is corrected through the owning release or installer surface before closeout
