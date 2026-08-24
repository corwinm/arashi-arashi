# installer-ownership-lifecycle Delta Specification

## ADDED Requirements

### Requirement: Ownership ledger v2 proves the whole direct installation

Every successful official direct install or update SHALL atomically commit ownership ledger schema v2 before reporting success. The v2 ledger MUST bind the normalized physical install directory, release version, installation channel, every canonical and alias payload destination with its SHA-256 hash, and every exact PATH, profile, and managed-shell mutation the installer created. Each mutation record MUST identify its deterministic target, prior-state evidence, exact inserted bytes or value, and the verification needed for reversal. The ledger MUST distinguish state created by this installation from pre-existing state that it observed but did not create. Paths outside the bound installation and deterministic supported profile targets MUST be rejected.

#### Scenario: Fresh direct install creates all state

- **WHEN** the official installer creates canonical and alias payloads, a user PATH entry, and a managed shell block
- **THEN** one atomically committed v2 ledger records every payload path and hash plus the exact created PATH and profile mutations
- **AND** records the selected install directory, release, and direct-install channel

#### Scenario: Installer encounters pre-existing integration

- **WHEN** the selected install directory is already on PATH or an equivalent valid managed block existed before the transaction
- **THEN** the installer does not record that state as created ownership
- **AND** a later uninstall preserves it

#### Scenario: Update changes a managed payload

- **WHEN** a valid v2-owned direct installation is updated
- **THEN** the replacement transaction verifies the old ledger, stages and verifies the whole new payload, and atomically commits a complete replacement v2 ledger
- **AND** no payload destination is represented only by a marker or alias-only record

### Requirement: Legacy, manual, ambiguous, or modified state is never adopted or deleted

Direct uninstall MUST fail closed before mutation when ownership is represented by schema v1, missing or malformed metadata, a manual installation, ambiguous paths or mutations, unsupported schema, or any managed payload or mutation whose current state differs from the v2 ledger. Official install or update MAY migrate a valid historical schema-v1 direct installation only by safely replacing and verifying the complete executable payload, preserving every unproven pre-existing PATH/profile/shell state as unowned, and atomically committing v2 ownership for the newly installed payload and only mutations created by that migration. Manual, malformed, ambiguous, or modified state MUST NOT be adopted, backed up as owned, or deleted. Guidance SHALL require that bounded migration when available and otherwise provide manual remediation.

#### Scenario: Alias-only schema v1 is presented to uninstall

- **WHEN** uninstall preflight reads a valid historical `.arashi-managed-entrypoints.json` schema v1 ledger
- **THEN** it refuses without mutation
- **AND** directs the user to the documented official update or reinstall migration that can establish v2 ownership

#### Scenario: Alias-only schema v1 is migrated by official replacement

- **WHEN** an official install or update safely replaces and verifies the complete executable payload of a valid schema-v1 direct installation
- **THEN** the transaction commits v2 ownership for exactly the newly installed payload and mutations that transaction created
- **AND** preserves pre-existing PATH, profile, and shell state as unowned rather than adopting it

#### Scenario: A manually copied release is present

- **WHEN** marked or checksummed release files exist without a valid v2 whole-installation ledger
- **THEN** they are classified as manual and unowned
- **AND** no official uninstall path deletes or adopts them

#### Scenario: A payload hash changed after installation

- **WHEN** any recorded canonical binary, wrapper, or alias hash differs from the ledger
- **THEN** the entire removal preflight fails before deleting or editing any owned item
- **AND** identifies the modified path and reinstall or manual-remediation guidance

#### Scenario: Recorded mutation is ambiguous

- **WHEN** a profile contains malformed, partial, nested, or duplicate managed markers, or a recorded PATH value cannot be matched exactly
- **THEN** preflight rejects the transaction
- **AND** preserves the target and all other planned state unchanged

### Requirement: Direct uninstall is a preflighted retryable transaction

Before any mutation, direct uninstall MUST verify the complete v2 ledger, current payload hashes, exact reversible mutations, deterministic target set, writable parents, transaction-artifact non-collision, and absence of concurrent installation lifecycle activity. Apply MUST use one invocation-owned durable journal with explicit phases; that journal is the sole tombstone evidence for completed deletion phases. It MUST retain sufficient prior bytes and metadata for rollback, revalidate each target immediately before mutation, and preserve unrelated neighboring state. A retry MUST resume only from valid retained v2 ownership plus phase-consistent journal evidence; missing state alone MUST NOT be treated as proof of prior owned deletion.

#### Scenario: Complete preflight succeeds

- **WHEN** all payloads and created mutations exactly match a valid v2 ledger and transaction prerequisites are available
- **THEN** dry-run reports the complete deterministic plan without creating transaction state
- **AND** confirmed apply may create the journal and begin mutation

#### Scenario: One target fails preflight

- **WHEN** any payload, mutation, parent, transaction path, or ownership fact cannot be proven safe
- **THEN** uninstall exits before changing any target
- **AND** reports every discovered blocking defect deterministically

#### Scenario: Process stops after a committed phase

- **WHEN** uninstall is interrupted after a phase is durably journaled
- **THEN** retained phase-consistent journal evidence distinguishes completed, pending, and rollback work
- **AND** the documented retry revalidates evidence and resumes or rolls back without broad deletion

#### Scenario: State is missing without transaction evidence

- **WHEN** a planned payload or mutation is absent but no valid journal proves an earlier owned phase removed it
- **THEN** uninstall treats the state as ambiguous and refuses to infer success
- **AND** requires reinstall, migration, or manual remediation

### Requirement: Failure rollback and final observation are exact

The deletion commit point is the atomic journal transition that records completion of the `ledger-removed` phase. Before that transition, any mutation failure or handled interruption MUST restore every changed target to its exact prior bytes, metadata, and existence state or retain recovery artifacts when restoration fails. After that transition, retry MUST NOT recreate deleted payload and MUST finish only the journal-proven remaining cleanup phases. Every exit after mutation starts MUST perform final observation for each planned item and classify it as `present`, `absent`, or `unknown`; exit status and guidance MUST reflect observation rather than intended action.

#### Scenario: Profile edit fails before commit

- **WHEN** exact profile mutation removal fails during `profiles-removed`, before any payload removal or the deletion commit point
- **THEN** rollback restores every profile, PATH value, and shell target changed by the phase while payload and ledger remain present and unchanged
- **AND** final observation reports any restoration that cannot be proven

#### Scenario: Rollback cannot restore one target

- **WHEN** rollback succeeds for some targets but cannot restore another
- **THEN** uninstall retains the required recovery artifacts and exits non-zero
- **AND** reports exact per-target final observations and actionable retry or manual recovery

#### Scenario: Failure occurs after deletion commit

- **WHEN** the journal proves `ledger-removed` committed and a remaining backup, directory, journal, or helper cleanup phase fails
- **THEN** retry does not recreate already committed deleted payload
- **AND** completes only journal-proven pending phases before final observation

### Requirement: Running payload removes itself only through verified deferred work

A full direct uninstall invoked from within its own payload MUST NOT delete or replace the running executable unsafely. It SHALL stage and verify a minimal platform-appropriate deferred helper outside the managed payload, durably journal its identity and expected actions, exit the running process before self-removal, and have the helper verify the journal, ledger snapshot, and exact target identities before deleting only remaining managed payload and retiring itself. Failure to schedule or verify deferred work MUST be non-success and retryable.

#### Scenario: POSIX CLI uninstalls its current payload

- **WHEN** confirmed uninstall is running from the v2-owned POSIX install directory
- **THEN** it stages a verified deferred helper and exits before that helper removes the remaining running payload
- **AND** the helper removes no path not proven by the journal and ledger

#### Scenario: Native Windows executable is locked

- **WHEN** Windows prevents deletion of the running executable or wrapper
- **THEN** the verified deferred PowerShell helper waits for process exit and removes only journal-proven targets
- **AND** a fresh PowerShell, Command Prompt, and Git Bash session no longer resolves the managed entrypoints after success

#### Scenario: Deferred helper cannot start

- **WHEN** helper creation, verification, launch, or durable journaling fails
- **THEN** uninstall exits non-zero without claiming complete removal
- **AND** retains retry evidence and reports the exact recovery command

### Requirement: Hosted uninstall scripts are inspectable and install-directory explicit

Arashi SHALL publish inspectable POSIX `/uninstall` and PowerShell `/uninstall.ps1` hosted scripts. Each script MUST accept an explicit install-directory override, otherwise use only its documented deterministic default, and MUST apply the same v2 ownership, preflight, refusal, transaction, preservation, and observation contract as CLI direct uninstall. The scripts MUST never search arbitrary filesystem locations for installations.

#### Scenario: User uninstalls a non-default POSIX directory

- **WHEN** the user invokes the hosted POSIX script with its documented explicit install-directory option
- **THEN** only the valid v2 ledger bound to that normalized directory is considered
- **AND** no other directory is scanned or mutated

#### Scenario: POSIX CLI payload is unavailable

- **WHEN** the `aw` and `arashi` payload is missing or cannot execute but `/uninstall` is run against an explicit or default valid v2 direct installation
- **THEN** the standalone POSIX script performs the same ownership preflight, confirmation, transaction, retry, preservation, and final observation without invoking the CLI
- **AND** it refuses missing payload state unless a phase-consistent retained journal proves the prior owned removal

#### Scenario: User uninstalls a non-default Windows directory

- **WHEN** the user invokes `/uninstall.ps1` with `-InstallDir` naming a valid direct installation
- **THEN** the script performs native Windows preflight and deferred removal for that directory
- **AND** preserves unrelated user PATH entries and profile bytes

#### Scenario: Windows CLI payload is unavailable

- **WHEN** the native executable or wrappers cannot run but `/uninstall.ps1` is invoked against an explicit or default valid v2 direct installation
- **THEN** the standalone PowerShell script performs the same ownership preflight, confirmation, transaction, retry, preservation, and final observation without invoking the CLI
- **AND** it refuses missing payload state unless a phase-consistent retained journal proves the prior owned removal

#### Scenario: Hosted route is deployed

- **WHEN** Netlify route smoke validation requests `/uninstall` and `/uninstall.ps1`
- **THEN** each route returns the expected inspectable platform script with a successful response
- **AND** the corresponding install routes continue to resolve independently

### Requirement: Repeated and partial-state uninstall is deterministic

An uninstall invoked after complete successful removal SHALL return a non-mutating `nothing-to-remove` success only when the explicit or default installation directory has no ledger, no retained journal, and no Arashi-shaped payload collision. A valid completed journal MAY authorize deterministic cleanup of that journal or helper residue without touching user state. Any partial absence with a v2 ledger but without phase-consistent journal evidence SHALL remain an ownership failure, while every phase-consistent partial state SHALL resume or roll back from the first proven incomplete phase.

#### Scenario: Uninstall is repeated after complete success

- **WHEN** the same explicit or default install directory is uninstalled again after payload, ledger, transaction state, and owned mutations were completely removed and no Arashi-shaped collision exists
- **THEN** it reports `nothing-to-remove` successfully without creating a journal, scanning other directories, or mutating any user state

#### Scenario: Completed journal cleanup is repeated

- **WHEN** all owned state is absent and a valid completed journal remains because final journal or helper cleanup previously warned
- **THEN** retry validates the completed observations and removes only journal-proven cleanup residue deterministically

#### Scenario: Partial state lacks journal evidence

- **WHEN** a v2 ledger remains but any planned payload or mutation is absent without phase-consistent journal evidence
- **THEN** repeated uninstall fails closed without treating absence as idempotent success

#### Scenario: Partial state has journal evidence

- **WHEN** a valid journal proves completed and pending phases after interruption
- **THEN** repeated uninstall revalidates current observations and resumes or rolls back exactly from the first incomplete phase

### Requirement: Native acceptance proves safe removal on POSIX and Windows

Delivery SHALL include process-level acceptance on supported POSIX systems and native Windows covering fresh custom-directory install, v2 ledger completeness, both executable names, dry-run, declined confirmation, confirmed full removal, modified and legacy refusal, interruption and retry, rollback failure reporting, unrelated-neighbor preservation, shell-only removal, and fresh-shell PATH observation. Acceptance MUST assert that no workspace configuration, repository, worktree, project file, or unrelated installation-directory entry is deleted.

#### Scenario: POSIX acceptance completes

- **WHEN** acceptance installs to an explicit temporary directory and exercises success and failure fixtures
- **THEN** ledger, transaction, shell/profile byte-preservation, deferred removal, and retry assertions pass through real processes
- **AND** both `aw` and `arashi` have equivalent uninstall behavior

#### Scenario: Native Windows acceptance completes

- **WHEN** native Windows acceptance exercises PowerShell installation and uninstall with fresh shell processes
- **THEN** PowerShell, Command Prompt, and Git Bash observe the expected PATH and entrypoint state before and after removal
- **AND** locked self-removal, rollback, retry, modified-state refusal, and project preservation are proven
