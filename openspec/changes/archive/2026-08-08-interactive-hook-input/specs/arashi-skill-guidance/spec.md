## MODIFIED Requirements

### Requirement: Packaged Arashi skill teaches the canonical hook contract
The Arashi skill package SHALL keep detailed hook guidance in its smallest linked reference/tutorial files and SHALL align activation, scope, lifecycle timing, cwd, environment, terminal-input availability, timeout, failure, standalone/configured, platform, and package-manager behavior with the installed CLI and canonical website guidance. It SHALL teach `ARASHI_HOOK_INPUT=tty|disabled|unavailable`, `--no-hook-input`, JSON precedence, immediate EOF, native Bash/PowerShell/cmd reads, invocation-only policy, and the prohibition on entering secrets without claiming that answers or persistent input policy are stored.

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

#### Scenario: Agent writes an interactive lifecycle hook
- **WHEN** an agent follows packaged guidance for a native shell read
- **THEN** it checks the effective input mode, preserves JSON and EOF safety, and uses the correct native primitive
- **AND** it does not request secrets, claim answer persistence, or invent a `hooks.input` configuration field
