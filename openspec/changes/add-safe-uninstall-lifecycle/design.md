## Context

Arashi has three materially different installation authorities and no official inverse lifecycle:

- Direct POSIX installs place `arashi.bin`, `arashi`, and `aw`; direct Windows installs place `arashi.bin.exe` plus six shell launchers. Both write `.arashi-managed-entrypoints.json`, but schema v1 proves only alias paths and hashes, not the canonical wrappers, native binary, PATH mutation, profile mutation, or install-directory provenance (`repos/arashi/scripts/install.sh:5-21,398-510,582-588`; `repos/arashi/scripts/install.ps1:23-35,254-359,551-577`; `repos/arashi/contracts/executable-distribution.json:16-38`).
- The POSIX installer appends an unscoped `# Added by arashi installer` line and PATH command after a substring search, then may write the deterministic Arashi shell block. It records neither mutation in the ledger (`repos/arashi/scripts/install.sh:909-1004,1006-1209`). Windows appends to user PATH only when absent, but does not record whether it added the entry (`repos/arashi/scripts/install.ps1:460-497`).
- Runtime shell installation uses exact start/end markers but its current upsert accepts the first marker pair and does not reject duplicates; it records no startup-file destination (`repos/arashi/src/lib/shell-integration.ts:6-18,101-145,184-209`).
- The npm package exposes `arashi` and `aw` through one JavaScript wrapper. That wrapper intercepts `install` and `update` before first-use native dispatch, while the update adapter already recognizes npm, pnpm, Yarn, Bun, and Vite+ from package-root and environment evidence (`repos/arashi/bin/arashi.js:83-89,160-179`; `repos/arashi/bin/update.js:48-60,116-200,249-388`).
- Native direct update already has a hosted-installer/deferred-parent pattern, including `ARASHI_WAIT_FOR_PID` on Windows (`repos/arashi/src/commands/update.ts:61-152`; `repos/arashi/scripts/install.ps1:121-141`). The POSIX update is synchronous and therefore is not sufficient for self-removal.
- The docs host `/install` and `/install.ps1` as forced redirects to raw CLI-repository scripts (`repos/arashi-docs/netlify.toml:18-40`). Equivalent uninstall endpoints must preserve that source and publication boundary.

The archived alias design established one complete direct payload transaction, marker-plus-ledger ownership, canonical `arashi` identity, and equivalent invocation through `aw` (`openspec/changes/archive/2026-08-16-ship-aw-executable-alias/design.md`). This change extends that source contract rather than treating marker shape, byte equality with a release, command resolution, or directory location as ownership.

Uninstall is destructive but is not a workspace lifecycle operation. It must never resolve or mutate `.arashi/config.json`, repositories, worktrees, workspace roots, hooks, project data, user-global configuration, or arbitrary files under `~/.arashi`.

## Goals / Non-Goals

**Goals:**

- Provide equivalent `aw uninstall` and `arashi uninstall` planning and execution for direct and package-manager installations, plus recovery scripts when the CLI payload is missing.
- Provide `aw shell uninstall` and `arashi shell uninstall` as a strictly narrower, independently safe managed-block removal.
- Make schema v2 prove every direct-install payload file and every persistent mutation the installer actually created.
- Fail before mutation for legacy, manual, modified, malformed, duplicate, ambiguous, or unowned state.
- Make direct uninstall transactional, deferred, retryable after interruption, and explicit about rollback and final observed state.
- Preserve project/user data and unrelated PATH/profile/install-directory neighbors byte-for-byte.
- Keep command, completion, docs, exports, packaged skill, hosted endpoint, and acceptance contracts synchronized without adding VS Code runtime behavior.

**Non-Goals:**

- Delete workspaces, repositories, worktrees, `.arashi` project configuration, user-global hooks, caches, logs, release downloads, or an entire `~/.arashi` tree.
- Adopt a manual install, infer ownership from known release hashes, repair a malformed profile, or remove an unverified collision.
- Add force deletion, hidden bypasses, `--force`, package-manager guessing, or JSON mutation.
- Remove unrelated user aliases/functions named `aw`, manually authored shell integration without the exact managed markers, or pre-existing PATH entries.
- Add an uninstall command to the VS Code extension or make the extension manage machine installation state.

## Decisions

### 1. Publish one source-owned uninstall contract and route by installation authority

`uninstall` is registered as a top-level Commander command and under both installed executable names. `shell uninstall` is registered beneath the existing shell command. The typed CLI policy is the source of command/options/JSON/docs/skills/VS Code classifications; completion and `contracts/cli-commands.json` are regenerated from the Commander tree rather than hand-edited. `contracts/executable-distribution.json` remains the generated source of payload names but advances its ownership section to ledger schema v2 and exact uninstall policy.

The npm wrapper adds `isExplicitUninstallCommand()` and intercepts `argv[0] === "uninstall"` before `ensureInstalled()`, parallel to the existing install/update interception in `repos/arashi/bin/arashi.js:83-89,160-172`. This is required so a package whose downloaded native binary is absent or damaged can still delegate removal. The wrapper never forwards an npm-owned uninstall to the native binary.

The authority order is deterministic:

1. The npm wrapper with valid package metadata identifies an npm-package distribution and attempts owner-manager detection.
2. A native/standalone invocation with a valid adjacent schema-v2 direct ledger identifies a direct install.
3. A retained valid uninstall journal identifies a retry of a previously verified direct uninstall.
4. Schema v1, unsupported/malformed ledger, marked/manual files without v2, and all other states are `legacy`, `manual`, or `ambiguous` and are inspection/refusal only.

A native executable being under `.arashi/bin`, an alias marker, executable name, PATH resolution, or matching published bytes is never sufficient to promote step 4 to direct ownership.

**Alternative considered:** let the native command detect npm from its executable path. Rejected because the JavaScript package boundary has stronger package metadata and already owns install/update dispatch; native path heuristics could delete package-manager files or require a missing binary.

### 2. Ledger schema v2 is a closed whole-installation ownership record

The direct installer atomically writes schema v2 only after the complete payload and persistent mutations have committed. Its closed shape is:

```json
{
  "schemaVersion": 2,
  "channel": "direct",
  "platform": "posix",
  "releaseVersion": "1.17.0",
  "installDirectory": "/home/user/.arashi/bin",
  "installDirectoryCreated": true,
  "payload": [
    { "role": "native-binary", "path": "/home/user/.arashi/bin/arashi.bin", "sha256": "…" },
    { "role": "canonical-launcher", "path": "/home/user/.arashi/bin/arashi", "sha256": "…" },
    { "role": "alias-launcher", "path": "/home/user/.arashi/bin/aw", "sha256": "…" }
  ],
  "mutations": {
    "path": {
      "kind": "posix-profile-line",
      "created": true,
      "targetPath": "/home/user/.zshrc",
      "insertedBytesBase64": "…",
      "targetCreated": false
    },
    "shellIntegration": {
      "created": true,
      "targetPath": "/home/user/.zshrc",
      "targetCreated": false,
      "startMarker": "# >>> arashi shell integration >>>",
      "endMarker": "# <<< arashi shell integration <<<"
    }
  }
}
```

For Windows, `platform` is `windows`; `payload` is the exact seven-entry set; `mutations.path.kind` is `windows-user-path-entry` and records `created`, the exact stored `entry`, registry scope `User`, and whether the installer created the previously empty value. Windows `shellIntegration` is `null`. POSIX `payload` is the exact three-entry set. Arrays use canonical payload order from the generated executable-distribution policy. Every path is absolute, normalized for its platform, inside and as a direct child of the exact install directory, unique under platform path comparison, and bound to the expected role/name. SHA-256 is lowercase hex. Unknown, missing, duplicate, extra, wrong-platform, escaping, symlinked-ledger, or non-regular-ledger state is invalid.

`created: false` is explicit provenance that the installer did not create that mutation and uninstall must preserve it. POSIX PATH records the exact byte sequence appended by this installer invocation, including separator/comment/newlines, not merely the rendered command. Shell integration records the exact profile selected, but marker ownership remains independently discoverable as described below. `installDirectoryCreated` is true only if the installer itself created a previously absent directory in the same successful transaction.

The ledger file is transactional metadata, not an entry in its own `payload` array; its path is derived exactly as `<installDirectory>/.arashi-managed-entrypoints.json`. The v2 writer, parser, and validator are shared policy with shell/PowerShell adapters or tested against identical fixtures; the POSIX installer must stop using loose `grep` extraction as its semantic parser for v2.

Installer updates from one valid v2 release replace the complete payload and ledger while carrying forward mutation provenance that they did not newly create. If an update adds a previously absent PATH entry or shell block, it records that creation. If exact managed state recorded as created has disappeared or become ambiguous before update, the update fails closed rather than rewriting provenance.

**Alternatives considered:**

- Extend only alias hashes. Rejected because it cannot prove canonical/native payload or persistent mutations.
- Record before/after profile hashes only. Rejected because ordinary unrelated profile edits would make safe exact removal impossible; exact inserted bytes permit narrow removal while still rejecting duplicate/absent ambiguity.
- Treat a currently present PATH entry as installer-owned. Rejected because both current installers deliberately preserve pre-existing entries.

### 3. Legacy v1 and manual states require migration by reinstall, never automatic adoption

Schema v1 proves only aliases and cannot authorize full removal. `aw uninstall`, hosted scripts, and dry-run/JSON inspection classify it as `legacy-ledger-v1`, list only non-secret detected paths, make no mutation, and instruct the user to run the current official installer over the same install directory to produce v2, then rerun uninstall. The v2 installer may migrate v1 only through its normal fail-closed alias preflight, complete staged checksum verification, complete payload replacement, smoke tests, and newly created mutation evidence; it never retroactively claims a pre-existing PATH line or shell block.

Manual marked wrappers without a valid ledger, unsupported ledgers, malformed ledgers, and ambiguous collisions receive move/remove/reinstall guidance but are never deleted automatically. A missing payload member under an ordinary v2 ledger is not idempotent success because the ledger alone does not prove why it disappeared; it is a modified/partial state and fails closed. Only a valid retained uninstall journal may authorize retry after a verified phase made a member absent.

This intentionally means users must update/reinstall once before first automatic full uninstall. It is safer than falsely adopting state created by an older installer or by a user.

### 4. Direct preflight freezes a complete plan before confirmation or mutation

The direct planner reads the ledger and applicable profile/PATH state without workspace discovery. It classifies every planned item in deterministic lifecycle order: payload ledger order, ledger, then PATH/profile/shell actions sorted by `(normalized absolute target, kind rank)` with `path < profile < shell`, followed by journal, deferred helper, and install directory. The secondary rank resolves the common equal-target case where one startup file contains both installer-created PATH bytes and managed shell integration. Package-manager plans contain only their package-manager action after ordered candidate commands; shell-only plans sort shell targets by normalized path. Each final observation is tri-state `present`, `absent`, or `unknown`.

Preflight requires:

- a valid v2 ledger or valid retry journal;
- every not-yet-completed payload destination to be a readable non-symlink/reparse regular file whose hash exactly matches the ledger;
- the ledger path and every parent traversal to have safe expected types and identities;
- an installer-created POSIX PATH byte sequence to occur exactly once in its recorded regular profile, or a Windows installer-created user PATH entry to occur exactly once under case-insensitive normalized comparison while preserving every other entry and spelling;
- every shell candidate to contain either zero markers or exactly one ordered, non-nested pair of exact marker lines;
- no duplicate markers, orphan marker, reversed/nested pair, unreadable file, directory, symlink/reparse target, or concurrent uninstall journal;
- transaction/journal/backup paths to be unique invocation-owned paths with no pre-existing collision.

A PATH mutation with `created: false` is reported as preserved. If `created: true` but the exact recorded state is absent, duplicated, changed, or unreadable, full direct uninstall refuses before payload mutation. It does not remove a semantically equivalent PATH expression, a substring match, or another spelling. On Windows it removes exactly the one v2-recorded user entry and broadcasts the environment change; broadcast failure is a warning because persisted state remains observable.

Top-level direct uninstall includes every ledger-owned payload file and exact created PATH mutation. It also discovers shell blocks in the finite supported candidate set under the effective home: macOS Bash `.bash_profile`, `.bashrc`, `.profile`; other POSIX Bash `.bashrc`, `.bash_profile`, `.profile`; Zsh `.zshrc`; and Fish `.config/fish/config.fish`, de-duplicated by normalized path. The ledger-recorded shell target is always included. It removes every safely discoverable well-formed exact Arashi block, including a block installed later by `aw shell install`; this is safe marker ownership, not whole-file ownership. An ambiguous candidate blocks all top-level mutation.

The plan explicitly lists preserved project data categories and never recursively enumerates them. It must not scan arbitrary home files or all of `~/.arashi`.

**Alternative considered:** best-effort removal of verified items while skipping ambiguous items. Rejected because users could lose the executable needed for remediation and receive a falsely successful partial uninstall.

### 5. Managed shell blocks are independently removable with strict marker grammar

`aw shell uninstall` uses shared functions extracted beside `buildShellInstallBlock()` and `installShellIntegration()` in `repos/arashi/src/lib/shell-integration.ts`. The scanner and rewriter operate on bytes and preserve all bytes outside the removed range. A removable block has exactly one start marker line and one later end marker line, no second occurrence of either marker, and no nested marker. The body may be a current or older installer-owned body: the exact marker pair owns the complete interior. Removal also consumes only the separator newline(s) that installation deterministically introduced when that ownership is unambiguous; otherwise it removes marker-through-end-marker and leaves surrounding bytes untouched.

The shell-only command targets the startup file selected by the same `detectSupportedShell()` / `resolveStartupFilePath()` policy used for install. If no marker exists it succeeds unchanged. A complete block is removed atomically through same-directory temporary replacement. Orphan, duplicate, reversed, nested, unreadable, non-regular, symlink/reparse, or write-race state returns `SHELL_INTEGRATION_AMBIGUOUS` without mutation. It never uninstalls payload, ledger, PATH, or project state.

Top-level direct uninstall applies the same grammar to its finite candidate set. Shell block removal is independently authorized by exact markers and therefore does not require the ledger to claim the profile, but any malformed candidate blocks the top-level transaction. The standalone uninstall scripts reuse the same finite grammar in native shell implementations and shared fixtures.

**Alternative considered:** require the v2 ledger for shell-only removal. Rejected because runtime `shell install` can legitimately create a managed block after installation and because the requested narrower recovery operation must remain available independently.

### 6. npm uninstall delegates only through a confidently detected owner

The JavaScript wrapper extends the existing package-root manager detector in `repos/arashi/bin/update.js:116-200` into an operation-neutral owner detector. Root-layout evidence is authoritative. Environment user-agent/exec-path evidence may corroborate but may not override a conflicting recognized root. Zero matches, multiple matches, unavailable manager executable, conflicting evidence, or unsupported layout is ambiguous.

For a single confident owner the plan uses exactly:

| Owner | Command |
| --- | --- |
| npm | `npm uninstall -g arashi` |
| pnpm | `pnpm remove -g arashi` |
| Yarn | `yarn global remove arashi` |
| Bun | `bun remove -g arashi` |
| Vite+ | `vp uninstall -g arashi` |

The wrapper renders the command, applies the same interactive/default-no and `--yes` policy, then uses the existing `prepareSpawnCommand()` portability boundary. It does not delete package roots, generated shims, or downloaded native files itself. Package-manager exit status is authoritative. Because the package manager may remove the currently running wrapper tree, execution is spawned from a neutral working directory and the wrapper does no post-success file access.

If ownership is ambiguous, human output and JSON inspection provide all five exact candidate commands labeled by manager and require the user to choose the one that owns the install; apply mode exits non-zero without spawning any candidate. Manual/native ambiguous installations receive direct-installer/manual guidance, not package-manager execution.

**Alternative considered:** default to npm because the package is npm-registry shaped. Rejected because pnpm, Yarn, Bun, and Vite+ own different global roots and shims.

### 7. Direct/native uninstall always hands off to a hosted deferred script

Native `aw uninstall` never deletes its own installation in-process. After preflight and confirmation it downloads the platform script from `https://arashi.haphazard.dev/uninstall` or `/uninstall.ps1` into a unique system temporary directory and launches it detached enough to survive parent exit while retaining terminal output. HTTPS transport, the public inspectable endpoint, closed schema support, and the helper's full local revalidation are the trust boundary, matching the existing hosted installer pattern; the native process does not pretend that a mutable hosted URL can be authenticated by an old release checksum. The helper receives the exact install directory, ledger/journal path, parent PID, and a random transaction identifier through arguments/environment; it re-reads and revalidates all source contracts rather than trusting an in-memory plan. It waits for the parent PID to exit before payload mutation on both POSIX and Windows, with a 120-second timeout and exact rerun guidance.

The standalone documented pipelines execute the same hosted script directly. They locate direct state only from an explicit `--install-dir` / `-InstallDir`, `ARASHI_INSTALL_DIR`, or the default user install directory; they do not search PATH or the filesystem for candidate installs. Native handoff always passes the current executable directory explicitly. Recovery scripts support human plan/confirmation, `--dry-run`, and `--yes`; PowerShell uses parallel named switches. They do not implement JSON—the CLI owns JSON inspection.

The helper copies any needed script/checksum evidence to its unique temporary working directory before waiting. Its final phase deletes its own temporary files only after parent exit and terminal outcome reporting. On Windows, deletion is performed by a final short PowerShell child after the main helper exits; on POSIX the helper unlinks its script after loading/starting and removes the temporary directory at completion. Self-cleanup failure is a warning and never broadens deletion.

`/uninstall` and `/uninstall/` redirect to raw `scripts/uninstall.sh`; `/uninstall.ps1` and `/uninstall.ps1/` redirect to raw `scripts/uninstall.ps1`, matching existing install-route ownership in `repos/arashi-docs/netlify.toml:18-40`.

**Alternative considered:** embed deletion logic only in the binary or execute a command string from memory. Rejected because the recovery path must work with a missing CLI and Windows cannot reliably replace/delete a running executable.

### 8. A durable journal makes direct removal transactional and retryable

Before the first persistent mutation, the helper creates `<installDirectory>/.arashi-uninstall-journal.json` atomically. This closed schema contains: schema version 1; transaction ID; platform; normalized install directory; SHA-256 and complete validated snapshot of ledger v2; ordered phase records; backup-directory path; per-item pre-state (`present`/`absent`/`unknown`), expected hash, backup hash/path where applicable; exact PATH/profile rewrite before/after hashes; shell-block targets and before/after hashes; rollback status; and final observations. The journal is accepted only when its install-directory identity, ledger snapshot hash, transaction paths, and already-completed phase observations all validate. It is the sole tombstone evidence that converts a ledger-claimed missing item into an authorized retry state; there is no separate tombstone artifact.

Phases are fixed and journaled atomically before and after each phase:

1. `preflighted`
2. `backed-up`
3. `profiles-removed` (exact PATH and shell-block rewrites)
4. `payload-removed` (all launchers and native binary)
5. `ledger-removed`
6. `backups-removed`
7. `directory-observed`
8. `completed`

Mutation uses same-directory atomic replacement for profiles/ledger/journal and unique transaction-owned backups. The complete rollback set includes payload, ledger, POSIX profile bytes or Windows user PATH value, and every shell profile changed. The helper revalidates current bytes/type/identity immediately before each phase. Before the `ledger-removed` commit transition, a race or failure triggers reverse-order rollback. Successful rollback restores exact pre-state, marks the journal retryable, and leaves it with the original failure. Failed rollback retains backups and journal, records each rollback failure and tri-state final observation, and gives the exact same uninstall command for retry after remediation. After `ledger-removed` commits, failure is recorded as pending cleanup and retry never recreates deleted payload. No path reports success from attempted operations.

After `ledger-removed`, retry authority comes solely from the retained journal snapshot. Missing state is accepted only for phases the journal proves completed; unexpected present or unknown state is a collision. A retry resumes at the first incomplete phase after full revalidation. If all owned state is already absent with a valid journal, it completes cleanup idempotently. With neither a v2 ledger nor a valid journal, “already absent” is a non-mutating success only when the default/explicit install directory contains no Arashi-shaped payload collision; otherwise it is manual/ambiguous refusal.

Backups are deleted only after owned profile/PATH, payload, and ledger removals have been observed successful. The journal is deleted last, after writing/reporting the `completed` final observation. If journal deletion itself fails, the operation reports success-with-warning and a subsequent invocation validates the completed journal and removes it without touching user state.

The install directory is never recursively removed. It is removed only if `installDirectoryCreated` is true, all owned state and transaction artifacts are gone, and a fresh directory enumeration proves it empty. Otherwise it is preserved and reported. Parent directories, including `~/.arashi`, are always preserved.

**Alternatives considered:**

- A best-effort sequence with no journal. Rejected because process interruption after deleting the ledger destroys provenance.
- Keep the journal only in the system temp directory. Rejected because temp cleanup/reboot would erase retry authority.
- Remove the whole install directory. Rejected because custom install directories may contain unrelated neighbors and the default parent stores user/project-adjacent state.

### 9. Confirmation, JSON, errors, and precedence are closed and non-bypassable

Human `uninstall` accepts `-n, --dry-run`, `-y, --yes`, and `-j, --json`. `--dry-run` and `--json` are inspection modes and may be combined. `--json --yes` is unsupported and returns `JSON_UNSUPPORTED_FOR_MODE` with mode `uninstall-apply`, before channel discovery that could mutate or prompt. JSON alone never confirms or applies. There is no force option.

Precedence is:

1. Commander syntax and option conflict validation (`--json --yes` first among parsed semantic guards);
2. channel and ownership discovery;
3. ledger/journal structural validation;
4. complete payload/PATH/profile/shell preflight;
5. inspection result (`--dry-run` or `--json`);
6. `--yes`, else TTY default-no confirmation;
7. non-TTY refusal with exact `--yes` guidance;
8. revalidation and delegated execution;
9. rollback and final-state observation.

Human cancellation is an unchanged success. Non-TTY apply without `--yes` is `CONFIRMATION_REQUIRED` and non-zero. `shell uninstall` is narrow but uses the same default-no confirmation policy, registers `--yes`, and supports `--dry-run` and inspection-only `--json`; it rejects `--json --yes` before discovery or mutation.

JSON uses the existing one-document envelope (`repos/arashi/src/lib/json-output.ts`; canonical `machine-readable-cli-output` specification). Success data is closed: `channel`, `mode` (`json-inspection`), `status`, `invokedAs`, `installDirectory`, `ledgerVersion`, `ownerCommand`, `candidateOwnerCommands`, ordered `actions`, ordered `warnings`, `preservedScopes`, and `retryCommand`. Nullable scalar/object fields are present as `null`; arrays are always present. Owner commands contain `manager`, `program`, and `args`. Actions contain `kind`, `target`, `disposition`, and `reasonCode`; targets are normalized absolute paths or `null`. The exact channel, action, disposition, status, and ordering vocabularies are normative in the `machine-readable-cli-output` delta. Direct retry inspection represents journal phase and tri-state observations as journal/action records rather than adding an open-ended object. Output never includes file contents, profile bodies, hashes of unrelated files, environment values, or backup contents. JSON cannot return an apply success because apply is unsupported.

Stable error codes include `UNINSTALL_OWNERSHIP_REQUIRED`, `UNINSTALL_LEGACY_LEDGER`, `UNINSTALL_LEDGER_INVALID`, `UNINSTALL_PAYLOAD_MODIFIED`, `UNINSTALL_PATH_AMBIGUOUS`, `SHELL_INTEGRATION_AMBIGUOUS`, `PACKAGE_MANAGER_AMBIGUOUS`, `CONFIRMATION_REQUIRED`, `UNINSTALL_DEFER_FAILED`, `UNINSTALL_TRANSACTION_FAILED`, and `UNINSTALL_ROLLBACK_FAILED`. Every uninstall error, including JSON/yes rejection, uses the closed `error.details.uninstall` record defined normatively by the machine-readable delta: operation, phase, channel, ordered blocking targets and owner candidates, closed rollback status/observations, and structured retry command. It never exposes file contents.

### 10. Cross-repository and release gates are part of delivery

`repos/arashi` owns command implementation, ledger policy/artifact generation, both installers and uninstallers, npm delegation, shell grammar, completion, release assets/checksums, and tests. `repos/arashi-docs` owns command/installation/troubleshooting guidance, the four hosted redirect forms, and regenerated Markdown/LLM exports. `repos/arashi-skills` owns the smallest installation/troubleshooting reference and source/extracted-package semantic checks. The meta repository owns OpenSpec deltas and a registered coordinated checker reached through existing stable aggregates.

The generated CLI contract classifies top-level uninstall as docs/skills required, JSON inspection-only, workspace-independent, and VS Code excluded with reason: machine installation ownership and deferred self-removal are outside editor runtime scope. `shell uninstall` is docs/skills required and VS Code excluded for the same machine-profile ownership boundary. `repos/arashi-vscode` receives no runtime, manifest, command, handler, or documentation change; only coordinated policy verifies the reasoned exclusion.

Pre-merge gates include source and built-binary process tests, real packed npm global shims for every supported owner fixture, POSIX installer/uninstaller integration, PowerShell 5.1 helper tests, real Bash/Zsh/Fish profile-byte fixtures, generated artifact freshness, docs/skill package aggregates, and controlled coordinated mismatch fixtures.

Published acceptance is mandatory and version-pinned. The CLI repository adds a stable exact-version POSIX/public-package gate that verifies `/uninstall` content/redirect, installs that exact public release through npm and official direct installer, exercises inspection/refusal/success/retry, and proves both executable names disappear while preserved data remains. A manual-dispatch native Windows gate accepts the same exact version, verifies `/uninstall.ps1`, default fresh install/uninstall in PowerShell, CMD, and Git Bash, persistent user PATH removal in a fresh process, deferred self-removal, rollback, and runner PATH/profile restoration. Neither gate accepts `latest`; delivery remains incomplete until both pass one published version.

## Risks / Trade-offs

- **The v2 ledger expands security-sensitive parser surface.** → Use a closed schema, exact generated payload sets, normalized path/role checks, shared fixtures, symlink/reparse rejection, and fail-closed unknown fields.
- **Profile files commonly change after installation.** → Record/remove only exact installer-added PATH bytes and exact marker-delimited blocks; unrelated bytes may change freely. Duplicate or malformed owned syntax refuses rather than guessing.
- **Rollback after self-removal is complex.** → Copy helper and backups before parent exit, persist the journal before mutation, remove the ledger late, retain journal/backups through final observation, and test every injected phase failure.
- **A journal could be forged to authorize deletion.** → Accept it only at the exact install location with a complete v2 snapshot, transaction-owned paths, expected payload names/hashes, and phase-consistent observations. It cannot authorize paths outside the install directory or arbitrary profile ranges.
- **Package-manager layouts evolve.** → Keep detection operation-neutral and fail to exact manager-specific guidance when confidence is lost; never choose npm by default.
- **Yarn global behavior differs by major version.** → Automatic delegation is limited to layouts where `yarn global remove arashi` is confidently the owner command; unsupported modern layouts are guidance-only.
- **Hosted main-branch scripts can drift from an older installed binary.** → Hosted helpers remain backward-compatible with supported ledger/journal schemas, fully revalidate local ownership, and fail closed on unsupported future schema rather than assuming compatibility; version-pinned publication gates catch endpoint drift.
- **Install-directory cleanup could delete unrelated files.** → Never recurse; remove only when v2 says the installer created it and a fresh enumeration proves it empty.
- **“Already absent” can hide manual partial deletion.** → Accept absence as idempotent only with phase-consistent journal proof, or when no Arashi-shaped state exists at all; ordinary v2 partial payload is a refusal.

## Migration Plan

1. **RED: ownership schema.** Add failing closed-schema fixtures for POSIX/Windows v2 exact payloads, created/pre-existing PATH, recorded shell target, directory provenance, unknown/extra/escaping/duplicate entries, v1 refusal, and update provenance carry-forward. Add generated executable-distribution freshness failures before changing producers.
2. **RED: shell removal.** Add byte-exact tests for current/legacy complete blocks, absent blocks, all newline forms, unrelated surrounding bytes, duplicate/orphan/reversed/nested markers, symlink/reparse/unreadable targets, multiple discoverable profiles, atomic-write failure, and race revalidation.
3. **RED: npm boundary.** Through real packed global shims, prove uninstall interception without a native binary, every manager command, conflicting/unknown evidence, non-TTY confirmation, JSON inspection, `--json --yes` rejection, and no direct package-file deletion.
4. **RED: direct lifecycle and journal.** Add deterministic planner, phase journal, tri-state observation, interruption at every phase, rollback success/failure, retained evidence, retry after ledger/payload removal, collision precedence, empty-directory condition, and preserved workspace/project neighbor tests.
5. **RED: native platform acceptance.** Add POSIX real-process tests and PowerShell 5.1/native Windows tests for fresh success, modified payload refusal, exact PATH removal, malformed shell refusal, parent-PID wait/timeout, self-removal, partial state, rollback, fresh-shell PATH observation, and cleanup of test user state.
6. Implement the typed v2 ownership source, parsers, installer transaction expansion, shell scanner/rewriter, journal engine, command registration, npm operation-neutral manager adapter, and hosted helpers. Regenerate only producer-owned CLI/completion/distribution artifacts.
7. Update canonical docs, Netlify redirects, generated Markdown/LLM exports, smallest packaged skill references, and registered local/coordinated semantic checks. Keep VS Code runtime unchanged and encode the reasoned exclusions.
8. Release additively. Existing v1 direct users receive fail-closed reinstall-to-migrate guidance; a successful current official reinstall writes v2 without claiming pre-existing PATH/shell state. npm and manual installs require no data migration.
9. Run the exact-version published POSIX/npm gate and same-version manual native Windows gate. Do not close delivery until hosted endpoints, both executable names, manager delegation, direct self-removal, PATH/profile preservation, and post-uninstall project data all pass.

Rollback of the feature before publication removes the new command/routes/assets and restores schema-v1 generation. After any schema-v2 release, installers must continue to parse and preserve v2; a rollback release may disable automatic uninstall with guidance but must not downgrade or overwrite v2 with v1. If published uninstall defects are found, keep the hosted scripts fail-closed, publish corrected scripts/patch release, preserve journals/backups, and direct users to inspection/retry rather than manual broad deletion.

## Open Questions

None.
