## ADDED Requirements

### Requirement: Configure JSON mode is sanitized inspection only

`aw configure --json` SHALL require a canonically configured valid workspace, SHALL emit exactly one standard JSON envelope on stdout, and SHALL perform sanitized inspection without prompting or mutation. Its command-specific data SHALL use the CLI-owned explicit configure descriptors to report canonical path, scope, configured presence, safely projected configured state, and separately labeled inherited or built-in effective state. Inline command bodies, generated active-file contents, and broad non-interactive mutation controls MUST remain absent.

#### Scenario: Valid configured workspace is inspected

- **WHEN** a user runs `aw configure --json` in a valid configured workspace
- **THEN** stdout contains exactly one success envelope with `command: "configure"`, `schemaVersion: 1`, one command-specific data object, and a warnings array
- **AND** no prompt, progress line, spinner, banner, or other human output is written to stdout
- **AND** configuration bytes and active files remain unchanged

#### Scenario: Configured and effective state are distinct

- **WHEN** a supported field is absent from persisted raw configuration but has an inherited or built-in runtime value
- **THEN** its inspection record reports `Not configured`
- **AND** reports the effective value and source separately
- **AND** does not persist that effective value

#### Scenario: Inline sources are sanitized

- **WHEN** workspace or repository inline lifecycle commands are configured
- **THEN** inspection reports only lifecycle, source kind, and interpreter presence
- **AND** neither stdout nor stderr contains, hashes, truncates, or otherwise derives command bodies

#### Scenario: Workspace configuration is unavailable or invalid

- **WHEN** JSON inspection is invoked from configless or standalone context, or the persisted configuration is malformed or semantically invalid
- **THEN** stdout contains exactly one standard structured failure envelope
- **AND** the command fails before supported-field inspection, prompting, initialization, repair, migration persistence, or any other mutation

#### Scenario: Mutation flags are not exposed

- **WHEN** command help and generated contracts are inspected
- **THEN** configure JSON semantics are classified as sanitized inspection only
- **AND** broad `--set`, `--unset`, or equivalent non-interactive mutation controls are absent
