## ADDED Requirements

### Requirement: Agent-readable exports include optional add onboarding guidance

Canonical website generation SHALL include optional repository setup during `aw add` in generated Markdown routes, `/llms.txt` discovery, and `/llms-full.txt` using the same eligibility, default-no, canonical field/action ownership, unselected suggestion, exclusive inline-or-executable-file source choice, exact active paths, safe no-op content, runtime-ready permissions with no rename/chmod activation, no-overwrite/rollback ownership, source-secrecy, user-supplied-inline-hook, final-confirmation, single-config-write, cancellation, and #316 scope boundary as maintained website guidance.

#### Scenario: Agent discovers add onboarding

- **WHEN** an automation consumer follows `/llms.txt` or a canonical Markdown route for add/configuration guidance
- **THEN** it can determine when human onboarding appears and which canonical repository fields it may populate
- **AND** it does not infer that JSON, forced, non-TTY, workspace-root, or existing-entry editing is supported

#### Scenario: Generated export is stale

- **WHEN** maintained onboarding guidance changes without regenerating agent-readable output
- **THEN** docs freshness or semantic validation fails before publication
- **AND** identifies the stale owning export

#### Scenario: Export leaks or invents sensitive behavior

- **WHEN** an authored or generated agent surface includes a hook command/generated-script body, claims content inspection, automatic selection, inferred non-no-op behavior, manual rename/chmod activation, overwrite behavior, partial persistence, or generic schema-driven prompts
- **THEN** registered docs semantic validation identifies the contradiction and exits unsuccessfully
