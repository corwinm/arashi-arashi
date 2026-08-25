# shell-completions Delta Specification

## ADDED Requirements

### Requirement: Generated completion includes conservative uninstall paths

Bash, Zsh, Fish, and PowerShell completion generated from live CLI discovery SHALL include `uninstall` and `shell uninstall` for both executable names. Product and shell-only uninstall SHALL expose `--dry-run`/`-n` and `--yes`/`-y`, and SHALL NOT advertise uninstall JSON or force options.

#### Scenario: Product uninstall completion is requested

- **WHEN** completion is generated for either `aw uninstall` or `arashi uninstall`
- **THEN** it offers only the live MVP options and their canonical aliases

#### Scenario: Shell uninstall completion is requested

- **WHEN** completion is generated below the `shell` command
- **THEN** `uninstall` appears beside existing shell subcommands
- **AND** generated completion freshness passes without hand-edited command tables
