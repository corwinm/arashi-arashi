# machine-readable-cli-output Specification

## Purpose
Define the automation-safe machine-readable output contract for the Arashi CLI, including consistent JSON envelopes, stdout isolation, non-interactive behavior, command support classification, and related documentation and skill guidance.
## Requirements
### Requirement: JSON output envelope
The Arashi CLI SHALL use a consistent JSON envelope for every command invocation that accepts `--json` and reaches command-level execution.

#### Scenario: Command succeeds in JSON mode
- **WHEN** a user runs an Arashi command with `--json` and the command completes successfully
- **THEN** stdout contains exactly one valid JSON document
- **AND** the document contains `ok: true`, the command name, `schemaVersion: 1`, a command-specific `data` object, and a `warnings` array

#### Scenario: Command fails in JSON mode after option parsing
- **WHEN** a user runs an Arashi command with `--json` and the command fails after Arashi has parsed command options
- **THEN** stdout contains exactly one valid JSON document
- **AND** the document contains `ok: false`, the command name, `schemaVersion: 1`, a structured `error` object, and a `warnings` array
- **AND** the process exits with a non-zero exit code

### Requirement: JSON stdout isolation
Commands that accept `--json` SHALL reserve stdout for the final JSON document and SHALL NOT write human-readable progress, spinners, colors, tables, banners, or prompts to stdout while JSON mode is active.

#### Scenario: Command normally prints progress
- **WHEN** a user runs a progress-reporting command with `--json`
- **THEN** stdout contains only the final JSON document
- **AND** progress is suppressed, captured in the JSON result, or emitted to stderr only when explicitly documented for diagnostics

#### Scenario: Verbose diagnostics are requested
- **WHEN** a user runs a command with `--json --verbose` and the command supports diagnostic output
- **THEN** stdout remains exactly one parseable JSON document
- **AND** any non-JSON diagnostic output is written to stderr or included in structured JSON fields

### Requirement: Non-interactive JSON execution
Commands that accept `--json` SHALL NOT trigger interactive prompts and SHALL return a structured error when required input or confirmation is missing.

#### Scenario: Required selection is ambiguous
- **WHEN** a user runs a JSON-mode command that would normally prompt the user to choose among multiple candidates
- **THEN** the command exits non-zero with a JSON error code such as `INTERACTIVE_INPUT_REQUIRED` or a more specific ambiguity code
- **AND** the error details include enough information for automation to retry with explicit arguments or flags

#### Scenario: Required confirmation is missing
- **WHEN** a user runs a JSON-mode command that would normally ask for confirmation before mutating state
- **THEN** the command exits non-zero with a structured error explaining the required confirmation flag or non-mutating mode
- **AND** the command does not perform the mutation

### Requirement: Command support audit
The Arashi CLI SHALL audit every user-facing command and explicitly classify JSON behavior as supported, unsupported for a specific mode, or not applicable.

#### Scenario: Automation-relevant command has structured results
- **WHEN** a user runs an automation-relevant command such as `clone`, `create`, `init`, `install`, `prune`, `pull`, `setup`, `status`, `sync`, or `update` with `--json`
- **THEN** the command either returns a structured JSON success/failure envelope or documents and emits a structured unsupported-mode error for the requested mode

#### Scenario: Existing JSON command is audited
- **WHEN** a user runs an existing JSON-capable command such as `list`, `add`, or `remove` with `--json`
- **THEN** the command participates in the same envelope and stdout-isolation contract as newly supported commands

### Requirement: Unsupported JSON modes
Commands or modes whose primary purpose is shell-code emission, external app launch, or interactive session control SHALL either return a structured non-interactive plan/result or reject JSON mode with a structured unsupported-mode error.

#### Scenario: Shell integration code emission is requested as JSON
- **WHEN** a user requests JSON output for a mode whose normal stdout is shell integration code
- **THEN** the command exits non-zero with `ok: false` and an error code such as `JSON_UNSUPPORTED_FOR_MODE`
- **AND** the human shell integration output is not mixed into JSON stdout

#### Scenario: External application launch is requested as JSON
- **WHEN** a user requests JSON output for a mode that would launch an editor, terminal, tmux session, or similar external application
- **THEN** the command either returns a structured plan/result without launching unexpectedly or exits non-zero with a structured unsupported-mode error

### Requirement: JSON output documentation and skill guidance
Arashi documentation and the Arashi skill package SHALL describe the JSON envelope, error shape, command support matrix, and stdout/stderr contract for automation consumers.

#### Scenario: User looks up JSON mode support
- **WHEN** a user reads the CLI documentation for automation or command output
- **THEN** the documentation identifies which commands support `--json`, which modes are unsupported, and the shape of success and failure envelopes

#### Scenario: Agent uses Arashi skill guidance
- **WHEN** an agent consults the Arashi skill package for command guidance
- **THEN** the skill references identify when to prefer `--json` for automation-safe command output
- **AND** the guidance explains that unsupported launch, shell integration, or interactive modes return structured JSON errors rather than human prompts

#### Scenario: User writes a parser from documentation
- **WHEN** a user follows the documented JSON mode contract
- **THEN** they can parse stdout as a single JSON document and inspect `ok`, `data`, `warnings`, and `error` without scraping human-readable output

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

