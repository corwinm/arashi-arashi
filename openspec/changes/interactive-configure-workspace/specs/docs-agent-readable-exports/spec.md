## ADDED Requirements

### Requirement: Generated agent-readable exports include configure behavior

Generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL carry canonical `aw configure` guidance from the owning docs source, including explicit supported scopes, configured/effective distinction, keep/edit/clear actions, TTY-only editing, exact final preview, non-mutating JSON inspection, and the unsupported-field boundary.

#### Scenario: Agent-readable exports are generated

- **WHEN** the canonical docs generator runs
- **THEN** each maintained discovery export includes or links to the configure command contract
- **AND** no generated surface exposes inline command bodies or claims implicit mutation

#### Scenario: Authored guidance changes without regeneration

- **WHEN** canonical configure guidance changes but generated exports are stale
- **THEN** repository-local freshness or semantic validation fails
- **AND** reports the owning generated surface

## MODIFIED Requirements

### Requirement: Agent-readable exports include optional add onboarding guidance

Canonical website generation SHALL include optional new repository setup during `aw add` in generated Markdown routes, `/llms.txt` discovery, and `/llms-full.txt` using the same eligibility, default-no, canonical field/action ownership, unselected suggestion, exclusive inline-or-executable-file source choice, exact active paths, safe no-op content, runtime-ready permissions with no rename/chmod activation, no-overwrite/rollback ownership, source-secrecy, user-supplied-inline-hook, final-confirmation, single-config-write, and cancellation behavior as maintained website guidance. Existing-entry editing is owned by `aw configure`, not `aw add`, and generated guidance SHALL preserve that command boundary.

#### Scenario: Agent discovers add onboarding

- **WHEN** an automation consumer follows `/llms.txt` or a canonical Markdown route for add/configuration guidance
- **THEN** it can determine when human `aw add` onboarding appears and which canonical repository fields it may populate for a new repository
- **AND** it does not infer that JSON, forced, non-TTY, workspace-root, or existing-entry editing is supported by `aw add`
- **AND** it can route supported existing-entry editing to `aw configure`

#### Scenario: Generated export is stale

- **WHEN** maintained onboarding or configure guidance changes without regenerating agent-readable output
- **THEN** docs freshness or semantic validation fails before publication
- **AND** identifies the stale owning export

#### Scenario: Export leaks or invents sensitive behavior

- **WHEN** an authored or generated agent surface includes a hook command/generated-script body, claims content inspection, automatic selection, inferred non-no-op behavior, manual rename/chmod activation, overwrite behavior, partial persistence, or generic schema-driven prompts
- **THEN** registered docs semantic validation identifies the contradiction and exits unsuccessfully
