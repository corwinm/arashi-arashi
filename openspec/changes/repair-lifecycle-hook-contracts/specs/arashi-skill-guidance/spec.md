## ADDED Requirements

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
