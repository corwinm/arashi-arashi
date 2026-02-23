## MODIFIED Requirements

### Requirement: Report missing configured repositories with actionable guidance
The status command SHALL detect configured repositories that are missing on disk and SHALL report them as missing repositories with guidance to run `arashi clone`.

#### Scenario: Configured repository path is missing
- **WHEN** the user runs `arashi status` and a configured repository directory does not exist locally
- **THEN** status output marks that repository as missing and includes guidance to run `arashi clone`

### Requirement: Avoid git execution for missing repository paths
The status command MUST NOT run git subprocess operations for repositories whose configured local path is missing.

#### Scenario: Missing repository would previously trigger git spawn failure
- **WHEN** the user runs `arashi status` and a configured repository path is absent
- **THEN** the command does not attempt git operations for that repository and does not emit a git spawn ENOENT error for that case
