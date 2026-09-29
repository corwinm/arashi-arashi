## ADDED Requirements

### Requirement: Personal settings resolve without workspace adoption

Arashi SHALL optionally load `~/.arashi/config.json` in configured and standalone repositories. The document SHALL require supported version metadata, accept a partial closed set of personal fields, and SHALL NOT require or accept project-owned repository policy. Resolution SHALL occur per leaf in CLI, workspace, user, built-in order, including explicit false and disabled values.

#### Scenario: Partial nested defaults combine

- **WHEN** user and workspace documents author different nested create, switch, or editor leaves
- **THEN** each effective leaf comes from the highest-precedence document that authored it
- **AND** an unrelated higher-precedence sibling does not erase the user leaf

#### Scenario: User configuration does not create workspace state

- **WHEN** a standalone command consumes user settings
- **THEN** no `.arashi/config.json` is created
- **AND** workspace initialization/editing never copies merged personal values into shared configuration

### Requirement: Personal worktree paths are stable and collision-safe

Relative user worktree directories SHALL anchor at the Git primary workspace/repository root. Absolute user directories SHALL be treated as shared roots and receive a deterministic repository-qualified child. Main and linked invocations SHALL resolve the same base. Location/naming changes SHALL affect new worktrees only; existing worktrees SHALL remain manageable through Git metadata.

#### Scenario: Unrelated repositories share an absolute root

- **WHEN** unrelated repositories with the same basename use one absolute user worktree root
- **THEN** their qualified bases are distinct
- **AND** repeated resolution for either repository is stable

### Requirement: Effective configuration is inspectable

Arashi SHALL provide a read-only effective-configuration command in configured and standalone contexts. It SHALL report supported values, per-leaf sources, configuration files used, workspace mode, and the resolved worktree base in human and JSON forms.

#### Scenario: Inspection explains explicit disabling

- **WHEN** a CLI or workspace layer explicitly supplies false or `none` above an enabled user value
- **THEN** inspection reports the disabled value
- **AND** identifies the winning CLI or workspace source

### Requirement: Invalid applicable configuration fails closed

A present malformed or invalid user file SHALL fail with its path and actionable field diagnostics. Invalid workspace configuration SHALL remain authoritative and SHALL NOT fall back to standalone mode.

#### Scenario: User JSON is malformed

- **WHEN** an applicable user file cannot be parsed
- **THEN** the command fails naming that file
- **AND** no workspace-mode change or mutation occurs
