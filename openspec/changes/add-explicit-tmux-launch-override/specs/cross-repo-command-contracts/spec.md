## ADDED Requirements

### Requirement: Tmux launch contracts remain synchronized across repositories
The system SHALL keep canonical CLI options, command help, user documentation, and packaged Arashi skill guidance aligned for explicit plain tmux selection, while preserving the existing configuration contract.

#### Scenario: CLI help exposes tmux consistently
- **WHEN** the command contract is generated or checked
- **THEN** `arashi switch --help` documents `--tmux` as forced plain tmux launch and `arashi create --help` documents `--tmux` as implying post-create launch

#### Scenario: Configuration contracts remain unchanged
- **WHEN** configuration schema and switch-config contract checks run
- **THEN** create `LaunchMode` and unified `SwitchMode` enums remain unchanged and do not include `tmux`

#### Scenario: Docs and skill contract checks use current tmux syntax
- **WHEN** cross-repository semantic contract checks inspect canonical docs and packaged skill references
- **THEN** switch/create examples, conflict sets, prerequisites, and the per-invocation-only schema decision agree with the CLI and do not describe explicit plain tmux as automatic-only
