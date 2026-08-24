# shell-integration Delta Specification

## MODIFIED Requirements

### Requirement: Install shell integration into supported startup files

The system SHALL provide `arashi shell install` to add or update one Arashi-managed block in supported shell startup files. For Bash and Zsh the managed block SHALL load the wrapper and separately source `command arashi completion <shell>`; for Fish it SHALL separately source both command outputs through native pipelines. `arashi shell init <shell>` SHALL remain wrapper-only. When installation replaces an older managed block, it SHALL remove stale wrapper and completion activation lines from that block together and write the current pair without duplicates. The system SHALL also provide the separate ownership-aware `arashi shell uninstall` command defined below.

#### Scenario: Install writes managed shell integration

- **WHEN** the user runs `arashi shell install` in a supported shell environment with a recognized startup file
- **THEN** the system writes or updates one Arashi-managed initialization block that loads the corresponding wrapper on future shell sessions
- **AND** the same block separately activates completion from the current `arashi completion <shell>` output

#### Scenario: Existing wrapper-only block is upgraded

- **WHEN** a startup file contains the previous Arashi-managed wrapper-only block
- **AND** the user runs `arashi shell install`
- **THEN** the system replaces that block with the current wrapper and separate completion activation lines
- **AND** preserves all content outside the managed block

#### Scenario: Existing managed block contains stale activation lines

- **WHEN** an older Arashi-managed block contains stale wrapper or completion activation lines
- **AND** the user runs `arashi shell install`
- **THEN** the system replaces the complete managed block with exactly the current wrapper and completion activation pair
- **AND** does not remove content outside the managed markers

#### Scenario: Installation is repeated

- **WHEN** the user runs `arashi shell install` more than once for the same startup file
- **THEN** the managed block and each wrapper or completion activation line appear exactly once
- **AND** the second unchanged installation does not rewrite unrelated startup-file content

#### Scenario: Canonical release installer configures shell integration

- **WHEN** the supported release installer performs its optional shell-integration setup
- **THEN** it writes the same shell-specific wrapper and separate completion activation lines owned by the current Arashi-managed block
- **AND** later `arashi shell install` recognizes or upgrades that block without duplication

#### Scenario: Wrapper generation remains separate

- **WHEN** the user runs `arashi shell init bash`, `arashi shell init zsh`, or `arashi shell init fish`
- **THEN** stdout contains only the parent-shell wrapper
- **AND** does not contain generated completion definitions or completion activation commands

#### Scenario: Install cannot determine a writable startup target

- **WHEN** the user runs `arashi shell install` and the system cannot identify or write an appropriate startup file
- **THEN** the system exits with an actionable error that tells the user how to run both `arashi shell init <shell>` and `arashi completion <shell>` for manual setup

## ADDED Requirements

### Requirement: Shell-only uninstall removes only exact complete managed blocks

Arashi SHALL expose equivalent `aw shell uninstall` and `arashi shell uninstall` commands. The command MUST inspect only the startup file selected by the same deterministic supported-shell policy as shell install, MUST remove only a complete Arashi-managed block bounded by exactly one canonical begin marker and one later canonical end marker, and MUST preserve every byte before and after the owned range. The marker pair owns its interior so current and historical generated bodies remain removable without semantic body parsing. It MUST reject malformed, partial, nested, overlapping, reversed, or duplicate marker state before writing the candidate.

#### Scenario: One exact managed block exists

- **WHEN** the deterministic target contains exactly one complete canonically marked Arashi block
- **THEN** dry-run identifies that exact block without mutation
- **AND** confirmed apply removes exactly its bytes while preserving all outside bytes byte-for-byte

#### Scenario: No managed block exists

- **WHEN** all deterministic candidates contain no managed markers
- **THEN** the command reports no managed integration to remove
- **AND** no startup file is created, rewritten, or deleted

#### Scenario: Marker state is malformed

- **WHEN** a candidate has a missing marker, duplicate marker or block, nesting, overlap, or reversed marker order
- **THEN** the command exits non-zero before writing any candidate
- **AND** identifies the affected path without printing unrelated file contents

#### Scenario: Similar file exists outside deterministic candidates

- **WHEN** another profile or startup-like file contains Arashi text outside the finite supported candidate set
- **THEN** shell uninstall does not scan, report, or mutate that file

### Requirement: Shell uninstall uses product confirmation and inspection policy

Shell uninstall SHALL require human confirmation unless `--yes` or `-y` is supplied; `--dry-run`/`-n` and `--json`/`-j` SHALL inspect without prompting or mutation; and JSON combined with yes SHALL be rejected before mutation. The command SHALL never remove executable payload, PATH state, workspace configuration, repositories, worktrees, or project files.

#### Scenario: User declines shell removal

- **WHEN** a valid plan is shown and the user declines confirmation
- **THEN** all startup-file bytes remain unchanged
- **AND** the executable installation and project state remain untouched

#### Scenario: Shell uninstall runs in JSON mode

- **WHEN** `aw shell uninstall --json` inspects valid or malformed state
- **THEN** stdout contains exactly one stable result or error envelope
- **AND** no prompt, profile write, or product uninstall occurs

### Requirement: Full direct uninstall removes only verified managed integration

Whole-product direct uninstall SHALL inspect the deterministic finite supported startup-file candidate set and include every complete uniquely marked Arashi-managed block, including runtime shell integration installed after the direct installer wrote its ledger. Marker ownership authorizes only marker-through-marker removal, never whole-file ownership. Any partial, malformed, reversed, nested, overlapping, duplicate, unreadable, symlinked, or race-changed candidate SHALL block the whole transaction before payload mutation. Unmarked shell text and files outside the finite candidate set SHALL be preserved.

#### Scenario: Complete managed block remains present

- **WHEN** a deterministic candidate contains one complete canonical marker pair
- **THEN** confirmed full uninstall removes it transactionally
- **AND** rollback restores the exact prior startup-file bytes if a later pre-commit phase fails

#### Scenario: Managed marker grammar is ambiguous

- **WHEN** a deterministic candidate has ambiguous or malformed marker state
- **THEN** full uninstall fails closed before changing integration or payload
- **AND** directs the user to reinstall, migrate, or perform bounded manual remediation

#### Scenario: Unmarked integration predates the direct install

- **WHEN** equivalent shell text existed before installation without the exact managed marker pair
- **THEN** full uninstall preserves it unchanged
