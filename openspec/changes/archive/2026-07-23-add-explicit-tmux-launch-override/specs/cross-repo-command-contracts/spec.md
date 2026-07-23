## ADDED Requirements

### Requirement: Tmux launch contracts remain synchronized across repositories
The system SHALL keep canonical CLI options, command help, user documentation, and packaged Arashi skill guidance aligned for explicit plain tmux selection, while preserving the existing configuration contract. The source-derived CLI contract SHALL expose typed option-policy metadata for tmux conflicts, prerequisites, create implications, JSON restrictions, and non-persisted configuration status, and the meta-repository checker SHALL enforce those semantics.

#### Scenario: CLI help exposes tmux consistently
- **WHEN** the command contract is generated or checked
- **THEN** `arashi switch --help` documents `--tmux` as forced plain tmux launch and `arashi create --help` documents `--tmux` as implying post-create launch

#### Scenario: Configuration contracts remain unchanged
- **WHEN** configuration schema and switch-config contract checks run
- **THEN** create `LaunchMode` and unified `SwitchMode` enums remain unchanged and do not include `tmux`

#### Scenario: Docs and skill contract checks use current tmux syntax
- **WHEN** cross-repository semantic contract checks inspect canonical docs and packaged skill references
- **THEN** switch/create examples, conflict sets, prerequisites, and the per-invocation-only schema decision agree with the CLI and do not describe explicit plain tmux as automatic-only

#### Scenario: Tmux option-policy metadata is generated and enforced
- **WHEN** the CLI command contract is generated after registering switch/create `--tmux`
- **THEN** its typed option policy represents each command's conflict set, `TMUX` prerequisite, create launch/switch implication, JSON restriction, and non-persisted status
- **AND** the contract schema version changes if required by the serialized shape

#### Scenario: Deliberate semantic drift fails the meta checker
- **WHEN** a checker fixture removes or changes one required tmux option-policy rule, or companion guidance contradicts that rule
- **THEN** meta-repository contract validation fails with a diagnostic identifying the owning source and mismatched tmux semantic
