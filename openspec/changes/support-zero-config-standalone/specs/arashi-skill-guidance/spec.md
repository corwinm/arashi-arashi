## ADDED Requirements

### Requirement: Skill guidance distinguishes standalone and configured workflows
The Arashi skill package SHALL direct agents to use zero-config standalone mode for a normal one-repository `.worktrees/` workflow and configured mode for child-repository coordination or persisted customization.

#### Scenario: Agent manages one repository
- **WHEN** an agent needs Arashi worktree lifecycle behavior for a non-bare repository without `.arashi/config.json`
- **THEN** the skill guidance explains `arashi init --zero-config` and the manual root `.worktrees/` plus repository-local exclude setup
- **AND** cautions that passive discovery does not repair missing ignore coverage

#### Scenario: Agent needs configured capabilities
- **WHEN** an agent needs child repositories, groups, hooks, defaults, custom managed paths, or coordinated commands
- **THEN** the skill directs the agent to ordinary `arashi init` and configured workspace references
- **AND** does not recommend zero-config mode as equivalent

#### Scenario: Agent encounters an unignored convention
- **WHEN** standalone `create` reports that `.worktrees/` is not ignored
- **THEN** the skill recommends `arashi init --zero-config` or a repository-local exclude rule
- **AND** does not instruct the agent to modify global Git configuration or tracked `.gitignore` automatically
