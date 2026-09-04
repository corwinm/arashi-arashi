## MODIFIED Requirements

### Requirement: Canonical hook guidance publishes the normative lifecycle matrix

The documentation SHALL provide one discoverable hooks workflow that distinguishes configured and standalone modes and defines each supported lifecycle's discovery locations, platform extensions, invocation multiplicity, mutation timing, cwd, environment context, timeout, failure/rollback/finalization behavior, and human/JSON outcome semantics. For configured remove, it SHALL identify `.arashi/hooks/<lifecycle>.<repo><ext>` under the active configuration root as the canonical workspace-owned repository source, identify `<active-repository>/.arashi/hooks/<lifecycle><ext>` as a compatible source, and explain that either native form and `repos.<repo>.hooks.<lifecycle>` claim one repository logical slot and conflict rather than compose.

#### Scenario: User compares configured create scopes

- **WHEN** a user reads create-hook guidance
- **THEN** it distinguishes workspace pre/post hooks from repository-specific pre/post hooks
- **AND** accurately states that `pre-create.<repo>` runs after that repository worktree is materialized

#### Scenario: User compares configured remove scopes

- **WHEN** a user reads configured remove-hook guidance
- **THEN** it distinguishes the canonical workspace-owned qualified repository source from the compatible repository-local source and workspace/global scopes
- **AND** explains repository-slot collision behavior, plain lifecycle identity, and target-checkout cwd

#### Scenario: User compares standalone scopes

- **WHEN** a user reads standalone hook guidance
- **THEN** it documents targeted and shared user-global create/remove hooks
- **AND** states that configless repository-local/workspace hooks remain inactive

#### Scenario: User develops Windows hooks

- **WHEN** a Windows user reads lifecycle guidance
- **THEN** it documents supported native extensions, activation commands, ambiguity failure, and absence of implicit Bash execution

### Requirement: Canonical and generated hook guidance remain semantically identical

Hook aliases, repository-remove canonical and compatible filenames, ownership, cwd, collision behavior, lifecycle timing, activation, timeout, platform, package-manager, and failure claims SHALL be checked from canonical docs through generated Markdown/LLM exports rather than maintained as unaudited prose copies.

#### Scenario: Canonical hook guidance changes

- **WHEN** hook guidance is updated
- **THEN** generated routes and `llms-full.txt` are regenerated from canonical sources
- **AND** focused freshness/semantic checks reject stale aliases or behavior claims

### Requirement: Public docs explain optional add onboarding proportionately

Canonical website onboarding, add-command, and configuration guidance SHALL explain that eligible human `aw add` invocations offer one default-no repository setup flow for canonical direct `copy`, `symlink`, and repository lifecycle hooks before final mutation. Hook guidance SHALL offer an exclusive inline command or editable active native script per lifecycle, explain that generated scripts are installed at exact canonical filenames as safe no-ops with runtime-ready permissions and require no rename/chmod activation, and identify the active configuration root as the authority for repository-qualified create and remove paths in direct, bare, and linked modes. It SHALL distinguish that storage root from the active target source checkout used as repository-remove cwd, identify target-repository remove files as compatible rather than canonical, distinguish top-level decline from cancellation, state that automation/non-TTY/`--json`/`--force` preserve minimal add, explain that suggestions are unselected and content-free, route exhaustive field, rollback, and security semantics to their owning references, and route later supported existing-workspace changes to `aw configure` without claiming add edits existing entries.

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
- **AND** file guidance describes qualified create/remove paths under the active configuration root, compatible target-repository remove paths, safe no-op scaffolds, no-overwrite behavior, immediate executable readiness, and manual editing without rename/chmod activation
- **AND** linked guidance keeps native remove storage at the configuration authority while using the active child checkout as execution cwd
- **AND** summaries identify inline lifecycle/interpreter presence or generated-script lifecycle/path/executable state without bodies or generated contents

#### Scenario: User needs later configuration changes

- **WHEN** guidance discusses updating an already registered repository or another supported workspace setting
- **THEN** it directs the user to `aw configure` rather than claiming `add` edits existing entries
- **AND** preserves direct JSON guidance for unsupported fields
