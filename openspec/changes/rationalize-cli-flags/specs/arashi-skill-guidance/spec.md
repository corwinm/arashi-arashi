## ADDED Requirements

### Requirement: Skill guidance uses canonical rationalized CLI options
The packaged Arashi skill guidance SHALL use canonical switch behavior names and consistent common aliases where concise examples benefit from them, SHALL not teach deprecated spellings as preferred workflow, and SHALL continue to direct agents to installed CLI help as the parameter source of truth.

#### Scenario: Agent needs generic launch rather than parent-shell cd
- **WHEN** an agent needs to open a selected worktree without changing the current parent shell and without choosing a specific launcher
- **THEN** skill guidance uses `arashi switch --launch`
- **AND** explains that configured `sesh` or Herdr remains selected unless `--ignore-configured-launcher` is also supplied

#### Scenario: Agent needs automatic launcher resolution
- **WHEN** an agent needs to bypass a configured named launcher for one switch invocation
- **THEN** guidance uses `--ignore-configured-launcher`
- **AND** does not imply that this option independently forces or prevents parent-shell `cd`

#### Scenario: Deprecated spellings appear only in migration guidance
- **WHEN** packaged guidance mentions `--no-cd`, `--no-default-launch`, or `handoff --markdown`
- **THEN** it labels the spelling as deprecated compatibility syntax and shows the canonical migration
- **AND** ordinary examples omit the deprecated spelling

#### Scenario: Agent uses common aliases
- **WHEN** shortcut guidance uses `-v`, `-f`, `-j`, `-o`, `-g`, or `-n`
- **THEN** each alias matches a registered option on that exact command path
- **AND** detailed or consequential examples may retain canonical long forms for clarity

#### Scenario: Packaged guidance drifts
- **WHEN** extracted skill content disagrees with canonical alias, switch, conflict, selector, or migration policy
- **THEN** package validation exits unsuccessfully with the mismatched reference
