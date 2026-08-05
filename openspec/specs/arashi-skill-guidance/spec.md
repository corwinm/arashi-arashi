# arashi-skill-guidance Specification

## Purpose

Define how the Arashi skill package keeps its top-level skill guidance minimal while directing detailed workflow instructions to reference files and canonical docs.
## Requirements
### Requirement: Minimal skill entry point

The Arashi skill package SHALL keep `skills/arashi/SKILL.md` focused on skill routing, core operating rules, and links to detailed references rather than duplicating workflow manuals or exhaustive command parameters.

#### Scenario: Agent opens the skill

- **WHEN** an agent reads `skills/arashi/SKILL.md`
- **THEN** the skill identifies when to use Arashi guidance, the required operating rules, and where to find detailed references without embedding exhaustive workflow or flag documentation

### Requirement: CLI help as parameter source of truth

The Arashi skill guidance SHALL direct agents to use `arashi --help` and `arashi <command> --help` to discover current command parameters before advising on non-trivial flags or options.

#### Scenario: Agent needs command flags

- **WHEN** an agent needs to recommend flags for an Arashi command
- **THEN** the guidance instructs the agent to inspect the installed CLI help output instead of relying on memorized or duplicated flag lists

### Requirement: Linked detailed references

The Arashi skill package SHALL keep detailed instructions discoverable through linked reference files and canonical website links.

#### Scenario: User needs workflow details

- **WHEN** a user asks for detailed Arashi workflow, troubleshooting, shortcut, security, or publication guidance
- **THEN** the skill points the agent to the appropriate reference file or canonical website documentation

### Requirement: Contributor guidance alignment

The Arashi skill package SHALL align contributor guidance with the minimal entry point model by treating `SKILL.md` as the place for routing and policy changes, while detailed procedural updates belong in reference files.

#### Scenario: Contributor updates procedural guidance

- **WHEN** a contributor changes detailed workflow, command, troubleshooting, or shortcut instructions
- **THEN** repository guidance directs them to update the smallest affected reference first and only update `SKILL.md` when routing, policy, or reference links change

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

- **WHEN** standalone `create` reports that the exact planned `.worktrees/<branch>` destination is not ignored
- **THEN** the skill recommends `arashi init --zero-config` or a repository-local exclude rule
- **AND** does not instruct the agent to modify global Git configuration or tracked `.gitignore` automatically

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

### Requirement: Teach agents deterministic launch disposition
The packaged Arashi skill SHALL teach agents to use the default independent context unless a user explicitly requests `--tab`, SHALL distinguish launcher selection from disposition, and SHALL preserve command-specific safety, JSON, and non-mutation boundaries.

#### Scenario: Agent uses switch tab disposition
- **WHEN** an agent needs to open an existing worktree in a tab
- **THEN** skill guidance uses `arashi switch --tab`
- **AND** explains `--cd` and IDE incompatibility, managed launcher mappings, standalone parity, and unsupported no-fallback behavior

#### Scenario: Agent uses create tab disposition
- **WHEN** an agent needs a created worktree opened in a tab
- **THEN** skill guidance uses `arashi create <branch> --tab`
- **AND** explains implied launch/switch handling, negative-flag precedence, pre-mutation unsupported rejection, dry-run preview, and post-create failure preservation

#### Scenario: Agent does not persist tab disposition
- **WHEN** an agent configures Arashi defaults
- **THEN** skill guidance does not add a disposition field or `tab` configuration value
- **AND** identifies `--tab` as CLI-only invocation context

#### Scenario: Agent handles unsupported tab honestly
- **WHEN** a selected launcher lacks a tab or documented equivalent
- **THEN** skill guidance treats `TAB_DISPOSITION_UNSUPPORTED` as a request mismatch
- **AND** does not retry a window unless the user chooses the default disposition

#### Scenario: Packaged skill matches authored guidance
- **WHEN** the skill package is built and extracted
- **THEN** the packaged artifact contains the same launch-disposition semantics as the authored source
- **AND** package-boundary and cross-repository checks reject stale or missing guidance

### Requirement: Packaged Arashi skill teaches the canonical hook contract
The Arashi skill package SHALL keep detailed hook guidance in its smallest linked reference/tutorial files and SHALL align activation, scope, lifecycle timing, cwd, environment, timeout, failure, standalone/configured, platform, and package-manager behavior with the installed CLI and canonical website guidance.

#### Scenario: Agent activates a POSIX hook
- **WHEN** an agent follows packaged hook activation guidance
- **THEN** it activates exactly one example and establishes executable mode
- **AND** does not copy multiple templates to one filename

#### Scenario: Agent selects an environment variable
- **WHEN** an agent writes create or remove hook logic
- **THEN** the skill uses `ARASHI_BRANCH_NAME` and scope-valid target values
- **AND** does not recommend `ARASHI_BRANCH` or `ARASHI_BASE_BRANCH`

#### Scenario: Agent encounters a compatibility field
- **WHEN** an agent maintains a hook using documented legacy repository/worktree or comma-separated remove fields
- **THEN** the skill identifies the field as supported through 1.x but non-canonical
- **AND** does not predict removal before a separately approved 2.0-or-later change

#### Scenario: Agent manages a standalone hook
- **WHEN** an agent operates in zero-config standalone mode
- **THEN** guidance uses platform-supported targeted/shared user-global hooks
- **AND** does not activate configless local `.arashi/hooks`

#### Scenario: Agent provisions a coordinated pnpm child
- **WHEN** an agent recommends dependency setup for a nested coordinated pnpm worktree
- **THEN** guidance honors the package's pinned Corepack pnpm and committed lockfile
- **AND** prevents accidental selection of the ancestor workspace

### Requirement: Authored and packaged hook guidance is contract-checked
The skill repository SHALL validate hook guidance in authored sources and an extracted installable package against one maintained semantic contract. Maintainer-only semantic fixtures SHALL remain outside the installable skill directory.

#### Scenario: Packaged hook guidance drifts
- **WHEN** an authored or packaged reference contains stale aliases, unsafe activation, incorrect timing/failure claims, or unsupported platform guidance
- **THEN** validation fails before publication

#### Scenario: Skill package is extracted
- **WHEN** package-boundary tests inspect the installable artifact
- **THEN** it contains the canonical linked hook guidance
- **AND** excludes maintainer-only semantic records/checkers
