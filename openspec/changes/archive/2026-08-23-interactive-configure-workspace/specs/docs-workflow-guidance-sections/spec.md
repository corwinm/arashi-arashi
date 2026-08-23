## ADDED Requirements

### Requirement: Public configuration guidance owns the configure workflow

Canonical website guidance SHALL explain proportionately that `aw configure` inspects supported existing-workspace settings, distinguishes configured from effective values, and applies confirmed interactive changes. One owning command or configuration page SHALL describe explicit scope selection, keep/edit/clear, exact JSON preview, separate active-file planning, TTY editing, and non-mutating JSON inspection without duplicating implementation internals across discovery surfaces.

#### Scenario: User needs to change supported configuration

- **WHEN** a user reads canonical configuration guidance
- **THEN** the guidance directs them to `aw configure` and identifies the supported scope families
- **AND** preserves direct JSON guidance for unsupported fields rather than calling the command a generic schema editor

#### Scenario: User needs automation

- **WHEN** a user reads invocation guidance
- **THEN** it states that `--json` is inspection-only and interactive editing requires a TTY
- **AND** does not advertise broad non-interactive set or unset flags

## MODIFIED Requirements

### Requirement: Public docs explain optional add onboarding proportionately

Canonical website onboarding, add-command, and configuration guidance SHALL explain that eligible human `aw add` invocations offer one default-no repository setup flow for canonical direct `copy`, `symlink`, and repository lifecycle hooks before final mutation. Hook guidance SHALL offer an exclusive inline command or editable active native script per lifecycle, explain that generated scripts are installed at exact canonical filenames as safe no-ops with runtime-ready permissions and require no rename/chmod activation, and distinguish active-configuration-root repository-specific create paths from runtime-resolved configured-target remove paths, including the active child worktree in linked mode. Guidance SHALL distinguish top-level decline from cancellation, state that automation/non-TTY/`--json`/`--force` preserve minimal add, explain that suggestions are unselected and content-free, route exhaustive field, rollback, and security semantics to their owning references, and route later supported existing-workspace changes to `aw configure` without claiming add edits existing entries.

#### Scenario: User onboards a repository

- **WHEN** a user follows maintained add or onboarding guidance
- **THEN** the user can tell when the optional prompt appears and which repository-owned sections it can configure
- **AND** the guidance does not imply workspace-root configuration, automatic selection, inferred commands, or existing-entry editing through add

#### Scenario: User chooses copy or symlink

- **WHEN** docs describe ignored local-path suggestions and manual entry
- **THEN** they preserve canonical same-relative-path, source ownership, validation, copy-versus-symlink, dependency-sharing, and no-fallback guidance
- **AND** state that Arashi never reads or displays candidate contents

#### Scenario: User configures hooks

- **WHEN** docs describe lifecycle-hook onboarding
- **THEN** they list canonical repository lifecycles and the exclusive inline-or-file choice
- **AND** inline guidance uses canonical Bash/platform variants and user-supplied commands
- **AND** file guidance describes exact active paths, safe no-op scaffolds, no-overwrite behavior, immediate executable readiness, and manual editing without rename/chmod activation
- **AND** summaries identify inline lifecycle/interpreter presence or generated-script lifecycle/path/executable state without bodies or generated contents

#### Scenario: User needs later configuration changes

- **WHEN** guidance discusses updating an already registered repository or another supported workspace setting
- **THEN** it directs the user to `aw configure` rather than claiming `add` edits existing entries
- **AND** preserves direct JSON guidance for unsupported fields
