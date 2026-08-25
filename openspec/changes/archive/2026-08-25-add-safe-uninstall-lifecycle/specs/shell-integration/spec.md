# shell-integration Delta Specification

## MODIFIED Requirements

### Requirement: Install shell integration into supported startup files

The system SHALL provide `arashi shell install` to add or update one Arashi-managed block in supported shell startup files. For Bash and Zsh the managed block SHALL load the wrapper and separately source `command arashi completion <shell>`; for Fish it SHALL separately source both command outputs through native pipelines. `arashi shell init <shell>` SHALL remain wrapper-only. When installation replaces an older managed block, it SHALL remove stale wrapper and completion activation lines from that block together and write the current pair without duplicates. The system SHALL also provide the separate conservative `arashi shell uninstall` command defined below.

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

### Requirement: Shell-only uninstall removes one exact complete managed block

Arashi SHALL expose equivalent `aw shell uninstall` and `arashi shell uninstall` commands. The command SHALL inspect only the startup target selected by the same deterministic supported-shell policy as shell install, remove only one complete range bounded by exactly one canonical begin marker and one later canonical end marker, and preserve every byte before and after the range. Missing markers SHALL be a no-op. Orphaned, duplicate, nested, overlapping, or reversed markers SHALL refuse before writing.

#### Scenario: One exact managed block exists

- **WHEN** the deterministic target contains exactly one complete canonical Arashi marker pair
- **THEN** dry-run identifies the exact range without mutation
- **AND** confirmed apply removes only that range while preserving every outside byte

#### Scenario: No managed block exists

- **WHEN** the deterministic target contains no Arashi marker
- **THEN** shell uninstall reports nothing to remove
- **AND** does not create, rewrite, or delete a startup file

#### Scenario: Marker state is ambiguous

- **WHEN** the deterministic target contains orphaned, duplicate, nested, overlapping, or reversed markers
- **THEN** shell uninstall exits non-zero before writing
- **AND** does not scan other profile-like files for alternatives

### Requirement: Shell uninstall uses conservative human consent

Shell uninstall SHALL support `--dry-run`/`-n` and `--yes`/`-y`, use default-no confirmation for interactive apply, require `--yes` for non-interactive apply, and SHALL NOT expose uninstall JSON or force options. Shell-only removal SHALL never touch executable payload, PATH state, ownership manifests, workspaces, repositories, worktrees, project files, or Git metadata.

#### Scenario: User declines shell removal

- **WHEN** one valid block is planned and the user declines confirmation
- **THEN** every startup-file byte and all product/project state remain unchanged

#### Scenario: Shell-only apply succeeds

- **WHEN** one valid block is preflighted and the user confirms
- **THEN** only the exact marker-through-marker bytes are removed
- **AND** executable, PATH, manifest, workspace, and project state remain unchanged

### Requirement: Direct product uninstall includes only exact safe managed blocks

A valid current official direct uninstall SHALL inspect only deterministic supported startup targets and may remove complete unique canonical Arashi marker ranges. Any malformed or ambiguous marker state SHALL block shell mutation before payload mutation; unmarked shell text and files outside the deterministic target set SHALL remain unchanged.

#### Scenario: Exact block remains during product uninstall

- **WHEN** direct product preflight finds one complete canonical marker pair in a deterministic target
- **THEN** the human plan identifies that exact block for removal
- **AND** preserves all outside profile bytes

#### Scenario: Product uninstall finds malformed markers

- **WHEN** direct product preflight finds ambiguous marker grammar
- **THEN** it refuses before changing shell, PATH, manifest, or payload state
