## ADDED Requirements

### Requirement: Zero-config standalone lifecycles use only user-global hook scopes
When a lifecycle runs in an implicit standalone workspace, Arashi SHALL discover shared and repository-targeted user-global hooks and SHALL NOT activate repository-local or workspace-root `.arashi/hooks` scopes without configured workspace state.

#### Scenario: Standalone lifecycle has user-global hooks
- **WHEN** a supported standalone create or remove lifecycle has matching shared or repository-targeted user-global scripts
- **THEN** Arashi includes those scripts in the lifecycle plan
- **AND** preserves existing targeted-before-shared ordering within global scope

#### Scenario: Configless repository has local hook content
- **WHEN** a configless standalone repository contains `.arashi/hooks/<lifecycle>.sh` but no `.arashi/config.json`
- **THEN** Arashi does not treat that script as an active repository-local or workspace-root hook
- **AND** user-global hook discovery remains available

#### Scenario: User-global hook working directory
- **WHEN** a user-global hook executes for an implicit standalone repository
- **THEN** its working directory is the resolved main repository root
- **AND** hook context identifies standalone workspace mode and the exact target repository/worktree
