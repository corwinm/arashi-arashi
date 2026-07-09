## MODIFIED Requirements

### Requirement: JSON output documentation and skill guidance
Arashi documentation and the Arashi skill package SHALL describe the JSON envelope, error shape, command support matrix, stdout/stderr contract, and handoff-report JSON payload for automation consumers.

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

#### Scenario: User looks up handoff JSON support
- **WHEN** a user reads the CLI documentation for handoff-report automation
- **THEN** the documentation identifies `arashi handoff --json` as a JSON-capable command
- **AND** the documentation describes the workspace metadata, per-repository status records, caller-supplied context arrays, warnings, and generated next-command hints included in the handoff payload

## ADDED Requirements

### Requirement: Handoff JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi handoff --json` using the standard single-document JSON envelope and stdout-isolation contract.

#### Scenario: Handoff JSON succeeds
- **WHEN** a user runs `arashi handoff --json` from a configured coordinated workspace
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "handoff"`
- **AND** the data object includes workspace metadata, effective options, per-repository status records, caller-supplied links, validations, todos, risks, next commands, and aggregate status totals
- **AND** no Markdown report, progress text, prompts, or color control sequences are mixed into stdout

#### Scenario: Handoff JSON preserves supplied context
- **WHEN** a user runs `arashi handoff --json --link <link> --validation <entry> --todo <item> --risk <item> --next-command <command>`
- **THEN** the JSON payload preserves each supplied value in structured arrays
- **AND** the payload distinguishes user-supplied validation evidence from commands that Arashi itself executed

#### Scenario: Handoff JSON reports workspace resolution errors
- **WHEN** a user runs `arashi handoff --json` outside a configured Arashi workspace
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "handoff"`
- **AND** the structured error explains that a configured Arashi workspace is required
- **AND** the process exits non-zero

#### Scenario: Handoff JSON remains non-interactive and non-mutating
- **WHEN** a user runs `arashi handoff --json` in a dirty coordinated workspace
- **THEN** the command does not prompt for confirmation
- **AND** the command does not stage, commit, push, delete, write report files, or run validation commands
- **AND** dirty repository details are represented in the JSON payload for automation to inspect
