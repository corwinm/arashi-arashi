# shell-completions Delta Specification

## ADDED Requirements

### Requirement: Generated completion includes uninstall command surfaces

Canonical CLI metadata and every generated Bash, Zsh, Fish, and PowerShell completion artifact SHALL include top-level `uninstall` and nested `shell uninstall` for both `aw` and `arashi`. Completion SHALL derive options and aliases from the typed command model, including `--dry-run`/`-n`, `--yes`/`-y`, and `--json`/`-j`, and SHALL NOT execute ownership discovery, scan profile files, invoke package managers, download a binary, prompt, or mutate state.

#### Scenario: Top-level uninstall is completed

- **WHEN** a user completes `aw un` or `arashi un` in a supported shell
- **THEN** generated completion offers `uninstall` from canonical command metadata
- **AND** both executable names expose equivalent option completion

#### Scenario: Shell uninstall is completed

- **WHEN** a user completes after `aw shell` or `arashi shell`
- **THEN** generated completion includes `uninstall` alongside existing shell subcommands
- **AND** its options match the typed shell-uninstall contract

#### Scenario: Completion runs where installation state is malformed

- **WHEN** completion is requested with missing, legacy, malformed, or modified ownership state
- **THEN** static command and option candidates are still returned safely
- **AND** no uninstall preflight or mutation path runs

### Requirement: Completion generation and real-shell acceptance enforce parity

Source, checked-in generated artifacts, packaged outputs, and real-shell acceptance SHALL agree on the new command paths and options. Drift or a manually edited completion artifact MUST fail deterministic generation validation.

#### Scenario: Generated artifact is stale

- **WHEN** canonical metadata includes uninstall but a checked-in shell artifact omits it or exposes conflicting aliases
- **THEN** completion generation validation exits unsuccessfully with the differing artifact

#### Scenario: Real shells exercise both entrypoints

- **WHEN** completion acceptance runs in supported real Bash, Zsh, Fish, and PowerShell environments
- **THEN** `aw` and `arashi` produce equivalent uninstall command and option candidates
- **AND** completion produces no filesystem or package-manager side effects
