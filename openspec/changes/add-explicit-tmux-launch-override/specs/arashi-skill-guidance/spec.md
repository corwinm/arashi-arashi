## ADDED Requirements

### Requirement: Arashi skill guides deterministic explicit plain tmux launch
The Arashi skill SHALL provide concise, command-accurate guidance for selecting plain tmux explicitly and SHALL route detailed behavior to the canonical tmux and sesh documentation.

#### Scenario: Session shortcuts include plain tmux commands
- **WHEN** an agent consults the session shortcut guidance
- **THEN** it can distinguish and use `arashi switch --tmux <target>`, `arashi create <branch> --tmux`, and the existing `--sesh` flow

#### Scenario: Skill guidance states tmux safety rules
- **WHEN** an agent chooses explicit plain tmux launch
- **THEN** the skill states that active tmux context is required, explicit launchers are mutually exclusive, `--cd` conflicts on switch, and selected tmux does not fall back

#### Scenario: Skill guidance preserves configuration vocabulary
- **WHEN** an agent needs persistent contextual tmux behavior
- **THEN** the skill directs it to configured `auto` and does not claim that `tmux` is a valid persisted create or switch mode

#### Scenario: Skill validation follows CLI help
- **WHEN** skill package checks compare documented optional flags with CLI help or maintained contracts
- **THEN** `--tmux` is accepted for switch and create and stale automatic-only guidance fails validation
