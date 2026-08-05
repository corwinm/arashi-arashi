## ADDED Requirements

### Requirement: Explicit create tab disposition overrides configured launch defaults

The system SHALL treat `arashi create --tab` as explicit automatic launch intent, SHALL bypass configured generic or editor-scoped `sesh` and `herdr` create launch defaults, and SHALL preserve an explicit `--tmux`, `--sesh`, or `--herdr` launcher supplied in the same invocation. This behavior SHALL NOT add a persisted launch-disposition setting or expand the create configuration vocabulary.

#### Scenario: Create tab bypasses a configured launcher

- **GIVEN** the applicable generic or editor-scoped create default selects `sesh` or `herdr`
- **WHEN** the user runs `arashi create <branch> --tab` without an explicit launcher selector
- **THEN** Arashi uses automatic contextual launcher resolution with disposition `tab`
- **AND** the configured explicit launcher is not invoked

#### Scenario: Create tab preserves an explicit launcher

- **GIVEN** the applicable create default selects a different launcher
- **WHEN** the user runs `arashi create <branch> --tab` with exactly one of `--tmux`, `--sesh`, or `--herdr`
- **THEN** Arashi uses the explicitly selected launcher with disposition `tab`

#### Scenario: Create tab remains an ephemeral override

- **WHEN** the user runs `arashi create <branch> --tab`
- **THEN** `--tab` implies launch and switch and remains authoritative over `--no-launch` and `--no-switch`
- **AND** Arashi does not add, persist, or normalize a tab/disposition configuration field

### Requirement: Preserve Windows executable resolution across path-key casing

The system SHALL treat Windows environment-variable names case-insensitively when preparing child-process environments and SHALL provide the inherited executable search path under the canonical Windows key `Path`. This normalization SHALL preserve the exact path value and every unrelated defined environment value.

#### Scenario: Git Bash supplies uppercase PATH

- **WHEN** a Windows launch inherits an environment containing uppercase `PATH` and no `Path` key
- **THEN** Arashi supplies the same value to Bun under `Path`
- **AND** removes the case-variant duplicate `PATH` key from the child environment

#### Scenario: Windows path casing is already canonical

- **WHEN** a Windows launch inherits `Path`
- **THEN** Arashi preserves that exact value under `Path`

#### Scenario: Non-Windows path casing is preserved

- **WHEN** a non-Windows launch inherits uppercase `PATH`
- **THEN** Arashi preserves the existing key casing and exact value

#### Scenario: Windows Terminal tab resolves from Git Bash

- **WHEN** Arashi runs inside a Windows Terminal Git Bash profile with non-empty `WT_SESSION`, uppercase `PATH`, and disposition `tab`
- **THEN** the detached process runner resolves and starts `wt.exe`
- **AND** preserves `-w 0 new-tab`, the non-empty active profile, and exact selected worktree path as separate arguments
- **AND** does not invoke a fallback launcher if startup fails
