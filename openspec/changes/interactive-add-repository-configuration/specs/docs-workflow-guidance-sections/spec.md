## ADDED Requirements

### Requirement: Public docs explain optional add onboarding proportionately

Canonical website onboarding, add-command, and configuration guidance SHALL explain that eligible human `aw add` invocations offer one default-no repository setup flow for canonical direct `copy`, `symlink`, and repository inline lifecycle hooks before the final configuration write. Guidance SHALL distinguish top-level decline from cancellation, state that automation/non-TTY/`--json`/`--force` preserve minimal add, explain that suggestions are unselected and content-free, and route exhaustive field, rollback, and security semantics to their owning configuration/hook/materialization references.

#### Scenario: User onboards a repository

- **WHEN** a user follows maintained add or onboarding guidance
- **THEN** the user can tell when the optional prompt appears and which repository-owned sections it can configure
- **AND** the guidance does not imply workspace-root configuration, automatic selection, inferred commands, or existing-entry editing

#### Scenario: User chooses copy or symlink

- **WHEN** docs describe ignored local-path suggestions and manual entry
- **THEN** they preserve canonical same-relative-path, source ownership, validation, copy-versus-symlink, dependency-sharing, and no-fallback guidance
- **AND** state that Arashi never reads or displays candidate contents

#### Scenario: User configures hooks

- **WHEN** docs describe lifecycle-hook onboarding
- **THEN** they list canonical repository lifecycles and Bash/platform-variant shapes and require user-supplied commands
- **AND** summaries identify lifecycle/interpreter presence without hook bodies

#### Scenario: User needs later configuration changes

- **WHEN** guidance discusses updating an already registered repository or other workspace settings
- **THEN** it identifies that workflow as follow-up #316 rather than claiming `add` edits existing entries
- **AND** does not expose unsupported fields in onboarding

### Requirement: Docs onboarding semantics use stable aggregate validation

A focused docs semantic checker SHALL be directly executable and registered under the existing fail-closed docs aggregate. It SHALL validate maintained Markdown and generated exports for prompt eligibility, default-no/minimal decline, canonical repository field scope, unselected content-free suggestions, user-supplied hooks, sanitized summaries, single final write, cancellation, and #316 scope separation.

#### Scenario: Maintained onboarding docs drift

- **WHEN** canonical prose or generated exports contradict one protected onboarding semantic
- **THEN** the focused checker and docs aggregate fail with an owning-path diagnostic
- **AND** no feature-specific workflow step is required
