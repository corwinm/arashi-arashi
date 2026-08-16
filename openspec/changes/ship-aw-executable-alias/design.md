## Context

Arashi currently has three distribution paths with different entrypoint mechanics:

- npm exposes one `arashi` bin mapping to `bin/arashi.js`; that wrapper intercepts `install` and `update` before launching one downloaded native binary.
- the POSIX release installer downloads one native binary plus the extensionless `arashi` wrapper and replaces them sequentially.
- the Windows PowerShell installer downloads one native binary plus extensionless, PowerShell, and CMD `arashi` wrappers, then replaces the four installed files through a recoverable payload transaction.

Shell integration and completion are also name-sensitive. `buildShellInitScript()` currently defines only an `arashi` parent-shell function, while generated Bash, Zsh, and Fish programs register only the `arashi` command. A package-level alias alone would therefore omit completion and could bypass parent-shell directory directives.

The change crosses npm packaging, direct installers, release assets, self-update, generated artifacts, native shell behavior, documentation, and coordinated contracts. Existing users must retain the canonical executable and must not have an unrelated command named `aw` overwritten.

## Goals / Non-Goals

**Goals:**

- Make `arashi` and `aw` supported equivalent entrypoints across every supported installation path.
- Keep one native implementation binary and one canonical product/configuration vocabulary.
- Preserve output, safety, mutation, parent-shell, completion, install, and update contracts through either name.
- Make direct installation collision-safe and recoverable for the complete canonical-plus-alias payload.
- Keep release producers, checksums, installers, package metadata, docs, and coordinated validation synchronized.

**Non-Goals:**

- Rename Arashi, its npm package, repositories, release binaries, configuration, environment variables, or managed shell block.
- Deprecate `arashi`, add a Commander command alias, or make `aw` a second command vocabulary.
- Publish or maintain a second compiled native binary.
- Make the VS Code extension invoke `aw`; editor integrations continue to use canonical `arashi`.
- Rewrite packaged skill examples to prefer the shorthand; skills continue to teach canonical commands.

## Decisions

### 1. Treat `aw` as a distribution entrypoint with canonical Arashi identity

`arashi` remains the program name used by Commander, help usage, diagnostics, documentation headings, configuration, `ARASHI_*` environment variables, managed-block markers, package identity, and native release binary names. `aw` expands to “Arashi Workspace” only in concise alias guidance.

Human output is allowed to retain canonical `arashi` wording. Machine contracts, exit status, prompts, mutation behavior, and JSON envelopes must remain equivalent for identical arguments and environment.

**Alternative considered:** rename Commander dynamically from `argv[0]`. Rejected because it creates two public help/error vocabularies and unnecessary snapshot/contract drift.

### 2. Ship alias launchers, never a duplicate native binary

The distribution matrix is:

| Channel | Canonical entrypoint | Alias entrypoint | Shared implementation |
| --- | --- | --- | --- |
| npm on POSIX/Windows | package-manager shim `arashi` | package-manager shim `aw` | both map to `bin/arashi.js`, then the same installed native binary |
| direct macOS/Linux | release wrapper `arashi` | release wrapper `aw` | adjacent `arashi.bin` |
| direct Windows Git Bash | extensionless `arashi` | extensionless `aw` | adjacent `arashi.bin.exe` |
| direct Windows PowerShell | `arashi.ps1` | `aw.ps1` | adjacent `arashi.bin.exe` |
| direct Windows CMD | `arashi.bat` | `aw.bat` | adjacent `arashi.bin.exe` |

Dedicated lightweight `aw`, `aw.ps1`, and `aw.bat` release assets keep manual installation explicit, checksummed, and testable. They contain stable Arashi-managed alias markers and delegate directly to the same adjacent binary. The npm package's two `bin` keys both target `bin/arashi.js`; npm does not require separate alias wrapper assets for dispatch.

Release metadata, checksum generation, retained archive packaging, package-content expectations, installers, and manual fallback lists consume one canonical expected asset set or compare against it so aliases cannot drift independently.

**Alternatives considered:**

- A user-documented shell alias was rejected because it is unavailable to non-interactive processes and completion behavior varies by shell.
- Installer-created copies or symlinks were rejected as the cross-platform contract because Windows symlink creation may require privileges and synthesized copies weaken explicit release/checksum/manual-install verification.
- A second compiled `aw` binary was rejected as unnecessary duplication.

### 3. Fail closed on direct-install alias ownership before any installation work

Each shipped direct alias launcher contains a stable, shell-appropriate Arashi managed marker. Direct installers also own an atomic `.arashi-managed-entrypoints.json` ledger in the selected install directory. The versioned ledger binds that exact install directory and each managed alias destination to its SHA-256 hash and release version. A marker identifies an Arashi-shaped file; the ledger plus matching hash proves that this installer owns the specific path.

Before downloads, destination-directory creation, backups, PATH/profile edits, or canonical/alias replacement, the POSIX and Windows installers inspect every required alias destination and the ledger:

- absent aliases with no conflicting ledger are eligible for fresh or pre-alias upgrade installation;
- a readable regular alias file is eligible for replacement only when it carries the exact marker and its current hash matches a valid ledger entry bound to the selected install directory;
- an unmarked or ledger-mismatched regular file, directory, symlink, reparse point, unreadable path, malformed ledger, or otherwise ambiguous state causes an actionable collision error before installation work begins.

The installer also resolves an already available `aw` command through the effective shell/PATH before installation work. A filesystem command that resolves outside the selected install directory is treated as an unrelated collision. This prevents a fresh install from silently shadowing another tool even when the target filename itself is absent. Platform tests cover POSIX filesystem-command resolution plus Windows PowerShell/CMD/Git Bash resolution evidence without executing the unrelated command.

Filesystem collision preflight and parent-shell namespace preservation remain separate contracts. POSIX preflight classifies the resolved command type before path comparison: an alias, function, builtin, keyword, or other non-filesystem shell name is not an executable collision and is left untouched for the shell-integration guard to preserve. A filesystem-backed result is compared by physical identity, so a managed regular `aw` reached through a symlinked PATH directory is the same installer-owned destination rather than an external command. This physical comparison does not weaken the rule that an alias destination whose final path component is itself a symlink is ambiguous and rejected.

Windows Git Bash evidence comes only from a verified Git for Windows installation, not whichever `bash.exe` happens to win PATH. The PowerShell installer locates the Git for Windows Bash associated with installed Git evidence and converts its `command -v aw` result through that shell's native path-conversion facility before comparing managed destinations. WSL, Cygwin, or unrelated Bash installations ahead of Git for Windows therefore cannot produce foreign `/mnt/<drive>/...` or `/cygdrive/<drive>/...` spellings that falsely reject an installer-owned wrapper.

The error identifies the exact path or ledger defect and instructs the user to move or remove the unrelated state deliberately. The installer does not adopt, execute, delete, download around, or back up an unowned alias as if it were Arashi state. Manually placed release wrappers contain markers but no installer ledger, so a later direct-installer run fails closed; manual-install guidance explains that the user must deliberately move/remove the manual alias files before retrying, after which the installer creates its own ledger.

npm/package-manager installation retains the package manager's normal executable-collision policy and does not add custom global-bin mutation.

**Alternatives considered:** treat marker or byte equality as ownership, or recognize arbitrary prior release checksums. Rejected because shape/equality does not establish path ownership and remote historical recognition complicates offline preflight. The local versioned ledger gives direct proof while preserving a deliberate migration path for manual installs.

### 4. Replace canonical and alias direct-install files as one recoverable payload

The POSIX installer is upgraded from sequential replacement to the same explicit transaction class already required on Windows:

1. preflight all alias destinations, effective-PATH resolution, the ownership ledger, and unique transaction-owned temporary paths without creating or downloading anything;
2. download and checksum every release asset into isolated staging;
3. back up the complete pre-existing managed destination set and prior ledger;
4. replace canonical and alias files;
5. smoke-test `arashi --version` and `aw --version`, requiring successful identical non-empty version output;
6. atomically write the new versioned ownership ledger with hashes of the installed aliases;
7. remove backups only after both smoke tests and ledger commit pass;
8. while mutation is possible, keep transaction-scoped `HUP`, `INT`, `TERM`, and abnormal-exit handling armed; on interruption or ordinary replacement, smoke, or ledger-write failure, restore every destination and ledger exactly, removing newly created managed files that were previously absent;
9. disarm transaction handlers only after ledger commit and backup removal complete, then preserve the invocation's interrupted/non-zero outcome instead of continuing installation;
10. if rollback fails, retain recoverable backups and report exact manual recovery guidance.

The POSIX executable payload is `arashi.bin`, `arashi`, and `aw`; the Windows executable payload is `arashi.bin.exe`, `arashi`, `arashi.ps1`, `arashi.bat`, `aw`, `aw.ps1`, and `aw.bat`. Each direct installation additionally owns `.arashi-managed-entrypoints.json` as transactional metadata. Installers preserve unrelated neighboring files and use uniquely owned transaction sidecars.

PATH and shell-startup mutation occur only after the payload transaction and both smoke tests succeed. The existing optional POSIX shell-integration setup remains separately idempotent. Windows continues not to edit shell profiles.

### 5. Route both npm names through the same wrapper boundary

`package.json#bin` maps `arashi` and `aw` to `bin/arashi.js`. Direct invocation detection must remain correct when either generated package-manager shim launches that file. Both names therefore share first-use binary installation and the wrapper-intercepted `install` and `update` paths.

Tests invoke real packed-package shims rather than calling only exported helpers. They cover missing-binary first use, explicit install, human/JSON update inspection and conflicts, update application planning, exit status, stdout/stderr isolation, and one representative mutating and inspection command. The compiled native path is also exercised through direct alias launchers.

### 6. Generate two parent-shell functions and register one completion model for both names

`arashi shell init <shell>` and `aw shell init <shell>` emit the same deterministic script defining shell-appropriate `arashi` and `aw` functions. Each function bypasses itself with its corresponding real command, sets the same directive environment, evaluates the directive file safely, and returns the native exit status. A real Bash/Zsh/Fish `switch --cd` fixture proves that `aw` changes the caller's directory just like `arashi`; this change does not invent create-side directory directives that the current command does not produce.

The generated parent-shell program does not silently replace an unrelated pre-existing `aw` alias or function. At source time it conditionally defines the `aw` wrapper unless the parent shell already owns that name as an alias or function whose body is not the generated Arashi wrapper contract; an executable resolved through PATH, including an npm-generated shim, is the expected underlying command and does not block function definition. This runtime guard is necessary because a child installer process cannot reliably inspect parent-shell aliases or functions. The managed block remains deterministic and idempotent, and troubleshooting explains how to remove the collision deliberately before re-sourcing if the user wants Arashi's `aw` parent-shell behavior.

The existing Arashi-managed startup block and canonical activation commands remain single and unchanged in shape: they call canonical `command arashi shell init` and `command arashi completion`. Reinstallation replaces the block idempotently; it does not add an AW-managed block.

One generated completion function/model serves both names:

- Bash registers `_arashi` for `arashi` and `aw`.
- Zsh registers `_arashi` with `compdef` for both names.
- Fish registers the same dynamic function for both commands.

Dynamic queries accept either root token and continue to execute canonical `command arashi completion __query` internally. Real-shell tests cover direct executable and wrapper-function completion through both names, including static and workspace-aware candidates, special characters, and non-mutation.

### 7. Publish a source-owned executable-distribution contract

Because `aw` is not a Commander command alias, it is not added to command paths or `aliasPaths` in `contracts/cli-commands.json`. Instead, the CLI repository owns typed executable-entrypoint policy and deterministically generates a small versioned contract artifact describing:

- canonical name and alias expansion;
- npm bin mappings;
- POSIX and Windows release/installed launcher sets;
- shared native binary names;
- managed-marker and collision policy;
- canonical branding/config/environment policy;
- supported shell-wrapper and completion registration names.

Repository-local validation compares that policy/artifact with package metadata, release/checksum producers, retained packagers, installer source, shell/completion generation, and package contents. The meta checker compares the normalized artifact with canonical docs, generated exports, and authored/extracted skill evidence. Skills retain canonical `arashi` entry commands and help discovery while a smallest linked reference identifies `aw` as the equivalent installed shorthand. A deliberate out-of-repository mismatch proves enforcement. Stable child aggregate entrypoints remain the CI integration seam; no feature-specific workflow step is added unless workflow topology genuinely changes.

### 8. Gate delivery on installed artifacts and a real release

Pre-implementation RED coverage precedes production, generated, installer, docs, and release-metadata edits. Acceptance includes:

- source and compiled launcher parity on supported POSIX platforms;
- packed npm installation and first-use behavior through both generated shims;
- canonical POSIX installer fresh/upgrade/collision/rollback behavior;
- Windows PowerShell 5.1 transaction and default-installer acceptance in fresh Git Bash, PowerShell, and CMD processes for both names;
- real Bash, Zsh, and Fish parent-shell and completion behavior;
- deterministic release/checksum/archive/package contracts;
- authored and generated docs semantic checks;
- post-publication npm-managed and direct-installer verification of both names before final closeout.

The CLI repository owns a stable version-pinned post-publication entrypoint exposed as `pnpm release:verify-aw -- <version>`. It rejects `latest`, missing, or unpublished versions; verifies the public npm artifact plus official pinned POSIX installer paths from clean environments; and emits evidence tied to the exact release. A manual-dispatch native Windows job accepts the same exact version and runs official pinned installation in fresh Git Bash, PowerShell, and CMD processes. These are post-release gates, not pre-merge CI substitutes, and issue delivery remains open until both stages pass for one public version.

## Risks / Trade-offs

- **`aw` already belongs to another local tool.** → Direct installers reject unmarked alias destinations and PATH-resolved aliases outside the selected managed installation before target mutation; npm retains package-manager collision handling and documentation warns that installation will claim the command name.
- **Adding three alias wrapper assets expands release bookkeeping.** → Derive every producer/consumer from one policy or enforce exact-set equality with repository-local contract tests.
- **POSIX transaction work is larger than a simple alias mapping.** → The issue promises rollback for the alias-inclusive payload; implement focused reusable transaction primitives and preserve unrelated neighboring state.
- **One wrapper or shell may accidentally recurse through `aw`.** → Use explicit `command` bypasses and real-shell tests through direct and function entrypoints.
- **A parent shell already defines `aw`.** → The sourced integration preserves unrelated aliases/functions instead of shadowing them, while canonical `arashi` remains integrated; real-shell fixtures cover guarded and unguarded cases.
- **Alias output differs because canonical branding remains.** → Specify exact parity for machine contracts and observable behavior while explicitly allowing canonical human wording.
- **Direct updates from a pre-alias release encounter an unrelated `aw`.** → Fail safely with the collision path and remediation instead of partially updating or overwriting it.
- **Generated contract duplicates executable inventory.** → Keep one typed source policy, generate the artifact, and validate concrete package/release/installer consumers against it rather than hand-maintaining parallel lists.

## Migration Plan

1. Add RED-only source, package, installer, shell, completion, contract, docs, and native Windows acceptance coverage.
2. Implement source-owned entrypoint policy, npm mapping, alias wrappers, installer transactions/collision preflight, shell integration, and completion; regenerate owned artifacts.
3. Update release/checksum/package producers and canonical docs/exports through stable validation aggregates.
4. Publish an additive minor release.
5. Verify a clean npm-managed install and official direct installation on supported POSIX and Windows paths with both `arashi` and `aw`.
6. If release verification fails, leave canonical `arashi` guidance in place, correct the owning artifact in a patch release, and do not call issue delivery complete until both names pass.

Existing installations require no configuration migration. The next supported npm or direct update adds `aw`; `arashi` remains unchanged.

## Open Questions

None. The issue decision keeps `aw` first-class, defines it as “Arashi Workspace,” and preserves `arashi` as canonical.
