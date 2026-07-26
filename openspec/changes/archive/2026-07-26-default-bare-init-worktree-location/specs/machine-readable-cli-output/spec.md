## ADDED Requirements

### Requirement: Configured init JSON reports the authoritative resolved worktree location
Configured `arashi init --json`, its dry-run variant, and its supported preference-only form SHALL report the normalized authoritative worktree location through the standard single-document JSON envelope.

#### Scenario: Bare configured init JSON uses parent default
- **WHEN** configured init runs with `--json` in a bare repository without `--worktrees-dir`
- **THEN** stdout contains exactly one valid success envelope with `command: "init"`
- **AND** its data reports canonical bare `workspaceRoot` and `worktreesDir: ".."`
- **AND** no human progress, preview, success, or warning output appears on stdout or stderr

#### Scenario: Non-bare configured init JSON retains managed default
- **WHEN** configured init runs with `--json` in a non-bare repository without `--worktrees-dir`
- **THEN** its data reports `worktreesDir: ".arashi/worktrees"`

#### Scenario: Explicit override is reflected in JSON
- **WHEN** configured init runs with `--json --worktrees-dir <path>`
- **THEN** its data reports the normalized explicit path regardless of repository type

#### Scenario: Preference-only result uses config authority
- **WHEN** an existing configured workspace runs the supported preference-only init form with `--json`
- **THEN** its data reports the existing normalized configured `worktreesDir`
- **AND** reports `.arashi/worktrees` only when the existing configuration uses the legacy omitted-field fallback
- **AND** does not substitute a repository-type default

#### Scenario: Bare dry-run JSON is non-mutating
- **WHEN** configured init runs with `--dry-run --json` in a bare repository without an explicit worktree location
- **THEN** its data reports `worktreesDir: ".."` and the bare non-worktree managed-path classifications
- **AND** no config, directory, ignore, preference, hook, repository, linked worktree, temporary worktree, or created worktree mutation occurs
- **AND** stdout contains only the envelope and stderr contains no human output

#### Scenario: Bootstrap dry-run JSON remains non-bare
- **WHEN** configured init previews a new repository bootstrap with `--dry-run --json`
- **THEN** its data reports `.arashi/worktrees` without requiring Git classification of a nonexistent repository
- **AND** no repository or directory is created
