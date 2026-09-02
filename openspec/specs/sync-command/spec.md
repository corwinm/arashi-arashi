# sync-command Specification

## Purpose
TBD - created by archiving change consolidate-legacy-speckit-specifications. Update Purpose after archive.
## Requirements
### Requirement: Sync aligns selected managed repositories to the exact parent branch
Configured `aw sync` SHALL resolve the exact current parent branch, load and validate workspace configuration before mutation, and align each selected managed repository to a local branch with that exact name. When the branch is absent, sync SHALL create it from that repository's current branch before checking it out.

#### Scenario: Target branch exists
- **WHEN** a selected repository already has the exact parent branch
- **THEN** sync checks out that branch and reports success for the repository

#### Scenario: Target branch is missing
- **WHEN** a selected repository lacks the exact parent branch
- **THEN** sync creates the exact branch from that repository's current branch and checks it out
- **AND** reports that the branch was created

### Requirement: Sync applies shared repository selection without touching excluded repositories
Sync SHALL support repeatable/comma-separated `--only` and configured `--group` filters through shared selection validation. Omitted filters SHALL target all configured managed repositories; invalid or empty explicit selection SHALL fail before repository mutation.

#### Scenario: Group selection is used
- **WHEN** a user runs `aw sync --group core`
- **THEN** only configured repositories in `core` are evaluated and reported
- **AND** repositories outside the group remain unchanged

### Requirement: Sync continues across repository-local failures and reports ordered results
A repository checkout, branch-creation, missing-path, or timeout failure SHALL be recorded for that repository and SHALL NOT prevent later selected repositories from being attempted. The final human or standard JSON result SHALL include ordered per-repository status, duration, failure details, created-branch state, and aggregate success/failure counts; verbose mode SHALL expose detailed repository output.

#### Scenario: One selected repository is unavailable
- **WHEN** one selected repository cannot be opened and another can be aligned
- **THEN** sync reports one failure and one success after attempting both in deterministic order

#### Scenario: Repository action times out
- **WHEN** a selected sync operation exceeds the configured timeout
- **THEN** that repository is classified as timed out or failed with timeout detail
- **AND** remaining selected repositories continue

