# cli-uninstallation Delta Specification

## ADDED Requirements

### Requirement: Both executable names expose one uninstall command contract

Arashi SHALL expose `aw uninstall` and `arashi uninstall` as equivalent top-level commands. The command MUST determine the installation channel without mutating state, dispatch direct installations to the ownership-aware direct uninstaller, dispatch confidently identified npm-family installations to their owning package manager, and fail closed with channel-specific reinstall, migration, or manual-remediation guidance for manual, legacy, malformed, unsupported, or ambiguous installations. The command MUST NOT infer ownership merely from an executable path, marker, package name, or writable directory.

#### Scenario: Either executable inspects a direct installation

- **WHEN** the same valid direct installation is inspected through `aw uninstall --dry-run` and `arashi uninstall --dry-run`
- **THEN** both invocations report the same channel, owned targets, preserved boundaries, warnings, and next action
- **AND** neither invocation mutates installation or user state

#### Scenario: A package-manager installation is confidently identified

- **WHEN** uninstall preflight proves exactly one supported npm, pnpm, Yarn, Bun, or Vite+ owner command for the invoking package
- **THEN** human apply delegates exactly once to that owner command after confirmation
- **AND** Arashi does not directly delete package-manager-owned files

#### Scenario: Installation channel is ambiguous

- **WHEN** zero or multiple supported package-manager owners remain plausible and no valid direct-installation ledger proves ownership
- **THEN** human apply exits non-zero without mutation, while JSON inspection exits zero with `status: "refused"`
- **AND** prints the exact applicable manual owner commands for npm, pnpm, Yarn, Bun, and Vite+ rather than choosing one

### Requirement: Uninstall confirmation and inspection modes are fail-safe

Human apply SHALL require an interactive confirmation unless `--yes` or `-y` is supplied. `--dry-run` and `-n` SHALL perform complete preflight and report the planned result without prompting or mutation. `--json` and `-j` SHALL be inspection-only, imply non-mutating preflight, emit one stable JSON document, and never prompt. `--json --yes`, `--json -y`, `-j --yes`, and `-j -y` SHALL be rejected before any mutation. A declined confirmation and a non-TTY apply without `--yes` SHALL leave all state unchanged.

#### Scenario: Human accepts an interactive uninstall

- **WHEN** preflight succeeds in a TTY and the user explicitly confirms
- **THEN** the command applies exactly the preflighted channel-specific removal plan
- **AND** reports removed, preserved, deferred, and retryable state after final observation

#### Scenario: Human declines confirmation

- **WHEN** the confirmation prompt is declined
- **THEN** the command exits without applying the plan
- **AND** no payload, PATH, profile, shell, workspace, configuration, repository, or worktree state changes

#### Scenario: Non-interactive apply lacks consent

- **WHEN** apply is requested without a TTY and without `--yes`
- **THEN** the command exits non-zero before mutation
- **AND** directs the caller to inspect with `--dry-run` or use `--yes` deliberately

#### Scenario: Dry-run is requested

- **WHEN** the user passes `--dry-run` or `-n`
- **THEN** complete ownership and safety preflight runs and a deterministic plan is reported
- **AND** no prompt, owner command, deletion, rename, profile edit, PATH edit, journal transition, or deferred helper is started

#### Scenario: JSON apply is requested

- **WHEN** `--json` or `-j` is combined with `--yes` or `-y`
- **THEN** option validation returns the stable conflict error before channel delegation or filesystem mutation
- **AND** stdout contains exactly one JSON error envelope

### Requirement: Product uninstall preserves user projects and unrelated state

Every uninstall path SHALL preserve Arashi workspace configuration, project configuration, repositories, canonical checkouts, linked worktrees, project files, Git metadata, and all unrelated files. Direct full uninstall MAY remove only v2-ledger-proven payload and exact installer-created PATH/profile mutations plus complete uniquely marked Arashi shell blocks in the finite supported startup-file set. Package-manager uninstall MAY remove only through the proven owning package manager. Shell-only uninstall MAY remove only the selected shell target's complete uniquely marked managed block. No uninstall option SHALL broaden these boundaries.

#### Scenario: A workspace exists beneath or beside the installation

- **WHEN** a full product uninstall succeeds while configured workspaces, repositories, or worktrees exist
- **THEN** all workspace and project bytes and Git identities remain unchanged
- **AND** the result explicitly reports them as outside uninstall scope

#### Scenario: Unrelated neighbors exist in the install directory

- **WHEN** verified managed payload files share a directory with unrelated files or directories
- **THEN** only ledger-proven managed paths are removed
- **AND** unrelated neighbors remain byte-for-byte unchanged

#### Scenario: A pre-existing PATH or profile entry resembles Arashi state

- **WHEN** an entry was not recorded as an exact installer-created v2 mutation
- **THEN** uninstall preserves it unchanged
- **AND** reports that it is unowned rather than adopting or deleting it

### Requirement: Uninstall reports recovery from observed final state

Human results SHALL distinguish removed, preserved, refused, rolled back, deferred, and retryable outcomes. Failures after mutation begins SHALL report the exact final observation of every planned owned item as `present`, `absent`, or `unknown`, identify retained recovery artifacts without exposing file contents, and provide a deterministic retry command using the invoked executable spelling and applicable options. Success MUST NOT be reported until final observation proves the promised state.

#### Scenario: Full removal completes

- **WHEN** every owned item is observed absent, every promised rollback artifact is safely retired, and deferred self-removal is confirmed or durably scheduled
- **THEN** the command reports successful removal
- **AND** reports preserved user-data boundaries and fresh-shell guidance

#### Scenario: Removal is interrupted or partially fails

- **WHEN** any phase is interrupted, rollback is incomplete, deferred self-removal cannot be confirmed, or final observation is unknown
- **THEN** the command exits non-zero without claiming complete uninstall
- **AND** reports phase, per-item final observations, retained journal state, and the exact safe retry command
