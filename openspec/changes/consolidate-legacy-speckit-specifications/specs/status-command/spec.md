## ADDED Requirements

### Requirement: Status provides default, verbose, and compact human views
Configured `aw status` SHALL inspect the workspace repository plus selected configured children and SHALL support: a default view with repository identity, clean/dirty state, and aggregate counts; `--verbose` with detailed staged, unstaged, untracked, branch, and tracking information; and `--short` with one bounded summary line per evaluated repository plus an aggregate summary.

#### Scenario: Default status contains mixed states
- **WHEN** evaluated repositories include clean and dirty worktrees
- **THEN** default output identifies each repository's state and reports aggregate clean/dirty counts

#### Scenario: Compact status is requested
- **WHEN** a user runs `aw status --short`
- **THEN** each evaluated repository is represented by one summary line with essential branch/change/divergence state
- **AND** a final aggregate summary is present

#### Scenario: Verbose status is requested
- **WHEN** a user runs `aw status --verbose`
- **THEN** staged, unstaged, untracked, and available upstream divergence details are shown for each evaluated repository

### Requirement: Status isolates repository-local inspection failures
A missing or unreadable configured repository and a repository-local Git inspection failure SHALL be reported for that repository without hiding results from other evaluated repositories. Filters SHALL be validated before inspection, and JSON mode SHALL preserve the standard ordered structured result.

#### Scenario: One configured repository is missing
- **WHEN** one selected repository path is missing and another is inspectable
- **THEN** status reports actionable missing-repository guidance and continues to report the inspectable repository

#### Scenario: Status JSON includes a local failure
- **WHEN** a repository-local inspection fails in `--json` mode
- **THEN** stdout remains one standard envelope with ordered per-repository outcomes and no human diagnostics mixed into stdout
