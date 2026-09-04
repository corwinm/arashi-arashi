## MODIFIED Requirements

### Requirement: Add persists repository configuration in the active parent branch

In coordinated linked mode, `arashi add` SHALL persist the new repository entry only in the active parent worktree's configuration after both canonical and active child paths are materialized successfully and optional onboarding has produced a complete validated candidate and safe active-script plan. The single persisted entry SHALL contain the existing config-relative `path` and `gitUrl` plus only user-confirmed canonical repository `copy`, `symlink`, and inline `hooks` values; file-mode lifecycles SHALL remain file-owned and absent from inline config. Confirmed repository create and remove scripts SHALL both use qualified `.arashi/hooks/<lifecycle>.<repo><ext>` paths under the active configuration authority; remove execution SHALL still use the runtime-resolved active target repository as cwd. Direct-main and configured-bare modes SHALL use the same candidate, native-file topology, and single-write rule at their existing configuration authority.

#### Scenario: Linked add succeeds

- **WHEN** canonical clone and active child worktree creation succeed and onboarding is declined or suppressed
- **THEN** Arashi adds the existing config-relative `path` and `gitUrl` entry to the active parent's `.arashi/config.json`
- **AND** does not modify the canonical parent checkout's tracked configuration

#### Scenario: Linked add with onboarding succeeds

- **WHEN** canonical clone and active child worktree creation succeed and the user confirms a valid onboarding candidate
- **THEN** Arashi adds the complete repository entry to the active parent's `.arashi/config.json` in one save
- **AND** atomically installs only confirmed active safe no-op create and remove scripts at qualified paths under the active configuration root with runtime-ready permissions
- **AND** remove runtime discovery selects that configuration-root source while execution cwd remains the active child checkout rather than the canonical clone
- **AND** does not modify the canonical parent checkout's tracked configuration

#### Scenario: Materialization fails before config persistence

- **WHEN** canonical clone or active child worktree creation fails
- **THEN** onboarding does not begin and the active configuration remains byte-equivalent to its pre-command repository configuration
- **AND** the canonical parent configuration remains unchanged

#### Scenario: Onboarding cancels before persistence

- **WHEN** repository materialization succeeds but onboarding returns controlled cancellation before the final save
- **THEN** the active configuration remains byte-equivalent to its pre-command repository configuration
- **AND** add applies its existing rollback ownership and final-observation rules to invocation-created repository state

#### Scenario: Direct main add succeeds

- **WHEN** the active configuration/execution root is the canonical non-bare parent worktree
- **THEN** Arashi preserves direct behavior by cloning once beneath that root and updating its configuration once with the complete confirmed repository candidate
- **AND** does not create a second child worktree
