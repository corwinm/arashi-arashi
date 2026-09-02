## ADDED Requirements

### Requirement: Setup discovers and orders workspace setup targets
Configured `aw setup` SHALL load and validate workspace configuration, identify the workspace root plus configured repositories, detect `setup.sh` task paths, and execute the workspace task before selected child repository tasks in deterministic configured order. Targets without a setup task path SHALL be reported as skipped. A present task that cannot execute SHALL be reported as a failed target rather than silently skipped.

#### Scenario: Workspace and child setup tasks exist
- **WHEN** a user runs `aw setup` with setup tasks in the workspace and multiple child repositories
- **THEN** the workspace task runs first and selected child tasks follow in deterministic order

#### Scenario: A target has no setup task
- **WHEN** a selected target contains no executable setup task
- **THEN** setup reports that target as skipped and continues processing remaining targets

### Requirement: Setup applies repository selection before execution
`aw setup` SHALL support repeatable/comma-separated `--only` and configured `--group` selection using shared repository-filter validation. Any explicit filter SHALL exclude the workspace target unless explicitly represented by the command contract and SHALL leave every unselected target unexecuted.

#### Scenario: One repository is selected
- **WHEN** a user runs `aw setup --only repo-a`
- **THEN** only `repo-a` is eligible to execute
- **AND** the workspace and other repositories are reported as excluded or skipped without running their scripts

#### Scenario: Selection contains an unknown repository
- **WHEN** an explicit filter names an unknown repository
- **THEN** setup exits with a usage error before executing any setup task

### Requirement: Setup continues after target failures and summarizes every outcome
Setup SHALL apply the configured hook timeout to each started task, capture duration and bounded diagnostics, continue to later selected targets after an individual failure or timeout, and return a final result distinguishing success, skipped/excluded, failed, and timed-out targets. `--verbose` SHALL expose task output; JSON mode SHALL use the standard isolated envelope.

#### Scenario: Tasks fail and time out
- **WHEN** one selected setup task exits nonzero and another exceeds the configured timeout
- **THEN** setup classifies the targets as failed and timed-out, continues bounded processing, and returns an overall failure

#### Scenario: Verbose setup succeeds
- **WHEN** a user runs `aw setup --verbose` and a task writes output
- **THEN** the task output and elapsed duration are visible with the target result
