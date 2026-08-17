## ADDED Requirements

### Requirement: Public docs explain repository file materialization proportionately
Canonical website configuration and create-workflow guidance SHALL explain direct repository `copy` and `symlink` arrays, identical relative source/destination paths, canonical source checkout ownership, copy-before-symlink timing between repository pre/post-create, visible missing-source skips, no-overwrite/path-safety behavior, dry-run/doctor discovery, and configured-only scope. Public prose SHALL remain outcome-oriented and SHALL route exhaustive rollback and diagnostic schemas to contracts rather than duplicating implementation internals.

#### Scenario: User copies local configuration
- **WHEN** a user follows configuration guidance for independently mutable `.env` or local settings
- **THEN** docs recommend `copy` and show a concise direct-array example
- **AND** explain that a missing machine-local source skips visibly

#### Scenario: User shares cache state
- **WHEN** a user follows guidance for intentionally shared state
- **THEN** docs explain `symlink`, shared mutation, platform capability, and no-fallback behavior
- **AND** do not imply hard links or Windows junctions

#### Scenario: User considers dependency directories
- **WHEN** docs discuss `node_modules` or equivalent dependencies
- **THEN** they recommend content-addressed package-manager stores and per-worktree installs for normal use
- **AND** label symlinked dependency trees advanced and risky

#### Scenario: User needs unsupported flexibility
- **WHEN** the required setup needs remapping, globs, external sources, conditions, interpolation, or generated values
- **THEN** docs route the user to lifecycle hooks
- **AND** do not expand the first-class schema beyond its constrained contract

### Requirement: Docs materialization semantics use stable aggregate validation
A focused docs semantic checker SHALL be directly executable and registered under the existing fail-closed docs aggregate. It SHALL validate maintained Markdown and generated exports for canonical field names, lifecycle/source ownership, safety/fallback boundaries, configured-only scope, and copy-versus-symlink guidance.

#### Scenario: Maintained docs drift
- **WHEN** canonical prose or generated exports contradict one protected materialization semantic
- **THEN** the focused checker and docs aggregate fail with an owning-path diagnostic

#### Scenario: Checker is added
- **WHEN** materialization coverage is registered without workflow topology changes
- **THEN** existing docs aggregate and coordinated validation execute it
- **AND** authoritative workflow YAML does not add a feature-specific checker step
