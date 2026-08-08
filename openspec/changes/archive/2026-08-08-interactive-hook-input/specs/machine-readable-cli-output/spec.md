## ADDED Requirements

### Requirement: JSON lifecycle hook execution is non-interactive
Configured and standalone create and remove SHALL execute lifecycle hooks with `ARASHI_HOOK_INPUT=disabled` and immediate-EOF stdin whenever JSON mode is active, including when the parent process has terminal stdin. No interactive attribution banner, prompt byte, prefixed hook line, progress output, or recovery prose SHALL be written to stdout. The existing one-document envelope discriminant, exit convention, hook outcome locations, and captured diagnostic behavior SHALL remain authoritative.

#### Scenario: JSON hook attempts to read
- **WHEN** a create or remove hook performs a native stdin read during `--json`
- **THEN** the hook receives EOF immediately rather than waiting for the lifecycle timeout
- **AND** its environment reports `ARASHI_HOOK_INPUT=disabled`

#### Scenario: JSON runs from a terminal
- **WHEN** create or remove runs with `--json` while parent stdin is a TTY
- **THEN** terminal availability does not enable hook input
- **AND** stdout contains exactly one parseable JSON document

#### Scenario: Hook emits an unterminated prompt in JSON mode
- **WHEN** a JSON-mode hook writes prompt text without a newline before attempting to read
- **THEN** no prompt text or interactive attribution is streamed to stdout
- **AND** internal `HookResult` capture remains available to existing classification and diagnostics without adding stdout or stderr fields to the public hook-outcome schema

#### Scenario: JSON hook fails after EOF
- **WHEN** a hook treats immediate EOF as an error and exits nonzero
- **THEN** create or remove reports the existing structured hook failure with evaluated outcomes
- **AND** no human hook output contaminates stdout

### Requirement: JSON dry-run remains input-channel-free
Create and remove dry-run JSON SHALL continue not to spawn lifecycle hooks and SHALL NOT fabricate `ARASHI_HOOK_INPUT`, interactive attribution, or execution outcomes for previewed hook locations.

#### Scenario: Dry-run previews an input-capable hook
- **WHEN** `--dry-run --json` discovers a hook that could request input during a real human invocation
- **THEN** the existing preview describes the hook without executing it
- **AND** stdout remains one structured preview document
