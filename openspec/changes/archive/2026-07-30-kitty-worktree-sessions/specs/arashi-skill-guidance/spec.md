## ADDED Requirements

### Requirement: Arashi skill guides safe managed Kitty reuse
The Arashi skill package SHALL provide concise command-accurate guidance for automatic managed Kitty worktree sessions in the smallest affected reference files and SHALL route detailed setup and troubleshooting to canonical documentation rather than expanding the minimal skill entry point unnecessarily.

#### Scenario: Agent operates inside Kitty
- **WHEN** an agent uses automatic `arashi switch` or post-create launch in a positively detected Kitty context
- **THEN** skill guidance explains Kitty 0.43+, permitted remote control, exact worktree reuse, nested tmux and higher-precedence launchers, and first-class `kitty` launch results

#### Scenario: Managed Kitty fails
- **WHEN** Arashi returns `LAUNCH_FAILED` after selecting Kitty
- **THEN** the skill tells the agent to preserve the actionable failure and inspect Kitty version/remote-control/duplicate-state guidance
- **AND** does not invent Kitty environment markers, silently retry another terminal, close ambiguous Kitty windows, or roll back successfully created worktrees

#### Scenario: Agent considers Kitty persistence or configuration
- **WHEN** an agent needs persistent session restoration, remove-time cleanup, or explicit/configured Kitty selection
- **THEN** skill guidance states those behaviors are outside this slice
- **AND** does not claim `kitty` is a valid explicit flag or persisted create/switch mode

#### Scenario: Packaged guidance is validated
- **WHEN** skill source and extracted-package contract checks run
- **THEN** Kitty version, precedence, reuse, failure, persistence, and ownership semantics match canonical CLI/docs evidence
- **AND** maintainer-only semantic manifests remain outside the installable skill directory
