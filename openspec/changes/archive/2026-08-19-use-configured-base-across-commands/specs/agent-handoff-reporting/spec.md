## ADDED Requirements

### Requirement: Handoff reports configured-base state separately

Configured-workspace handoff Markdown and JSON SHALL include each present repository's effective configured-base branch, source, concrete remote/ref, ahead/behind state when available, and unavailable reason when requested comparison cannot complete. Handoff SHALL retain current-branch upstream state and remote-default state as separate relationships. Standalone handoff SHALL remain unchanged.

#### Scenario: Repository is behind its configured base

- **WHEN** a configured repository's current branch is behind its refreshed configured base
- **THEN** handoff Markdown names the base and lag in the per-repository status
- **AND** handoff JSON includes the structured configured-base comparison
- **AND** upstream and dirty-state information remain present

#### Scenario: Configured base is unavailable

- **WHEN** status cannot refresh, resolve, or compare a configured base
- **THEN** handoff Markdown records an explicit warning naming the base
- **AND** handoff JSON records the branch, unavailable state, and machine-readable reason/details
- **AND** neither format substitutes the remote default as the configured base

#### Scenario: Base and default differ

- **WHEN** configured base is `origin/develop` and remote default is `origin/main`
- **THEN** handoff retains both relationships and their independent lag/unavailable state

#### Scenario: Base and default are the same target

- **WHEN** configured base and remote default resolve to the same remote ref
- **THEN** handoff Markdown avoids duplicate diagnostics and may use a combined `Base/default` label
- **AND** handoff JSON preserves separate role records that identify their shared target

#### Scenario: Standalone handoff runs

- **WHEN** handoff runs in implicit standalone mode
- **THEN** its established repository/upstream/default report remains unchanged
- **AND** it does not invent configured-base policy
