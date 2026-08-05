## ADDED Requirements

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
