## MODIFIED Requirements

### Requirement: Command support audit
The Arashi CLI SHALL audit every user-facing command and explicitly classify JSON behavior as supported, unsupported for a specific mode, or not applicable.

#### Scenario: Automation-relevant command has structured results
- **WHEN** a user runs an automation-relevant command such as `clone`, `create`, `init`, `install`, `prune`, `pull`, `setup`, `status`, `sync`, or `update` with `--json`
- **THEN** the command either returns a structured JSON success/failure envelope or documents and emits a structured unsupported-mode error for the requested mode

#### Scenario: Existing JSON command is audited
- **WHEN** a user runs an existing JSON-capable command such as `list`, `add`, or `remove` with `--json`
- **THEN** the command participates in the same envelope and stdout-isolation contract as newly supported commands

## ADDED Requirements

### Requirement: Prune JSON results
The Arashi CLI SHALL provide structured JSON results for `arashi prune --json` and `arashi prune --dry-run --json`.

#### Scenario: Dry-run prune JSON succeeds
- **WHEN** a user runs `arashi prune --dry-run --json`
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "prune"`
- **AND** the data object includes per-repository prunable worktree entries, paths, reasons when available, and totals
- **AND** no human-readable dry-run text is mixed into stdout

#### Scenario: Mutating prune JSON succeeds
- **WHEN** a user runs `arashi prune --json` and prune operations complete successfully
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "prune"`
- **AND** the data object includes per-repository prune results and totals for pruned or skipped repositories

#### Scenario: Prune JSON reports partial failure
- **WHEN** a user runs `arashi prune --json` and one or more repository prune operations fail
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "prune"`
- **AND** the error or data details identify each failed repository and underlying failure message
- **AND** the process exits non-zero
