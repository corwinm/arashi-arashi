## ADDED Requirements

### Requirement: Documentation teaches long-running coordinated base branches
Canonical documentation SHALL make persistent and one-off create-base selection discoverable from the create command and configuration workflow, SHALL preserve the compatibility workaround for older installed CLIs, and SHALL regenerate agent-readable exports from those owning sources.

#### Scenario: User configures a long-running feature base
- **WHEN** a user reads create or configuration guidance
- **THEN** it shows generic `defaults.create.baseBranch` and one-off `--base <branch>` syntax
- **AND** explains CLI-over-config precedence, local-then-origin resolution in every selected repository, and fail-before-hook/mutation behavior

#### Scenario: User reuses an existing target
- **WHEN** guidance describes `REUSE_EXISTING`
- **THEN** it states that the requested base is still resolved for the repository
- **AND** the existing target is not reset, rebased, or represented as newly derived from that base

#### Scenario: User previews or automates create
- **WHEN** guidance describes dry-run or JSON create with a requested base
- **THEN** it explains requested source, per-repository resolved ref/OID, target action, aggregated failure, and single-document stdout behavior

#### Scenario: User runs an older Arashi release
- **WHEN** the installed CLI does not support create-base selection
- **THEN** guidance preserves the pre-create-target-branches plus `--conflict REUSE_EXISTING` workaround as compatibility guidance

#### Scenario: Agent-readable exports are checked
- **WHEN** documentation validation generates Markdown routes, `/llms.txt`, or `/llms-full.txt`
- **THEN** exported create/configuration guidance carries the same configured, explicit, reuse, standalone, dry-run, JSON, and workaround boundaries