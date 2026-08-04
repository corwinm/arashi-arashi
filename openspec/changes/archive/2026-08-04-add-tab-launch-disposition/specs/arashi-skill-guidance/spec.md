## ADDED Requirements

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
