## ADDED Requirements

### Requirement: Hide missing child repositories from non-verbose human status output
The system SHALL omit missing configured child repositories from default and short human `arashi status` output while retaining complete status visibility in verbose and JSON output.

#### Scenario: Default status hides intentionally missing child repositories
- **WHEN** the user runs `arashi status` in a coordinated worktree where one or more configured child repository paths are missing
- **THEN** the default human output does not include sections for those missing child repositories
- **AND** the summary counts only the repositories shown in the default human output

#### Scenario: Short status hides intentionally missing child repositories
- **WHEN** the user runs `arashi status --short` in a coordinated worktree where one or more configured child repository paths are missing
- **THEN** the short human output does not include lines for those missing child repositories
- **AND** visible present repositories continue to show their normal short status

#### Scenario: Verbose status shows missing child repositories
- **WHEN** the user runs `arashi status --verbose` in a coordinated worktree where one or more configured child repository paths are missing
- **THEN** the verbose human output includes those missing child repositories
- **AND** each missing repository includes guidance to run `arashi clone`

#### Scenario: JSON status includes missing child repositories
- **WHEN** the user runs `arashi status --json` in a coordinated worktree where one or more configured child repository paths are missing
- **THEN** the JSON envelope includes status records for those missing child repositories
- **AND** each missing record includes a machine-readable error message with clone guidance
