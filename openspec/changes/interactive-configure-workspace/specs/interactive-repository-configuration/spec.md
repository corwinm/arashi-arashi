## ADDED Requirements

### Requirement: The shared repository editor supports existing-entry configuration

The repository editor SHALL support both add-owned onboarding and configure-owned editing of an existing repository entry through the same explicit descriptors, immutable mutations, canonical normalization, complete-candidate validation, active-path observer, script planner, and projection boundaries. Configure extensions for repository groups and base policy MUST remain explicit and MUST NOT alter add's approved onboarding subset.

#### Scenario: Add constructs a new repository editor

- **WHEN** `aw add` creates editor state for a new repository
- **THEN** it continues to expose only copy, symlink, and four lifecycle choices
- **AND** configure-only repository descriptors remain absent from add prompts

#### Scenario: Configure loads an existing repository editor

- **WHEN** `aw configure` selects a configured repository
- **THEN** the shared editor reports configured or unset state for the persisted repository candidate
- **AND** preserve-only identity fields and unrelated compatible values survive every candidate mutation

#### Scenario: Configure clears an existing repository field

- **WHEN** a user explicitly clears copy, symlink, groups, base policy, or one inline lifecycle
- **THEN** the shared editor omits only that canonical field after normalization
- **AND** retains other fields and any skipped existing active lifecycle source

### Requirement: Existing repository active-file plans preserve onboarding contracts

Configure-owned repository active-file plans SHALL preserve the exact topology, filename validation, source exclusivity, no-overwrite publication, safe no-op bytes, runtime-ready permissions, metadata-only diagnostics, retry/skip behavior, and ownership-checked rollback requirements defined for add onboarding.

#### Scenario: Configure plans a repository hook file

- **WHEN** the user replaces or clears the existing source and selects active-file mode
- **THEN** create lifecycle paths resolve from the active configuration root and remove lifecycle paths resolve from the runtime-configured target repository
- **AND** linked mode uses the active child worktree for remove hooks

#### Scenario: Existing active file must be retained

- **WHEN** an existing native source cannot be replaced safely
- **THEN** configure never overwrites it and offers a skip/keep-existing path
- **AND** a confirmed edit to other settings leaves that file byte-identical

## MODIFIED Requirements

### Requirement: The repository editor has explicit canonical field and scope metadata

Arashi SHALL represent repository onboarding and existing-entry configuration through a shared reusable typed configuration-editor model whose descriptors identify canonical repository ownership, configuration path or native-file action, configured-versus-unset state, display metadata, accepted value/source shape, sensitivity, validation adapter, and sanitized projection. `add` SHALL consume only descriptors for direct repository `copy`, `symlink`, and lifecycle hook inline-or-file choices. `configure` SHALL reuse those descriptors and MAY add only its explicit repository `groups` and `baseBranch` descriptors. The model MUST NOT infer prompt behavior directly from JSON Schema.

#### Scenario: New repository begins with unset optional fields

- **WHEN** add constructs the editor state for a newly cloned repository
- **THEN** every supported optional onboarding field is represented as unset
- **AND** required `path` and `gitUrl` remain part of the complete repository candidate rather than editable onboarding options

#### Scenario: A supported field becomes configured

- **WHEN** a user supplies a valid value for one selected field
- **THEN** the editor candidate records that value at its canonical repository path
- **AND** the descriptor reports configured state without changing unrelated fields

#### Scenario: Generic schema metadata contains another field

- **WHEN** the generated JSON Schema contains a workspace, meta, defaults, or repository field outside the command's approved explicit subset
- **THEN** neither add nor configure exposes that field merely because it appears in the schema
- **AND** explicit editor metadata remains authoritative for prompt scope

#### Scenario: Existing repository uses the shared model

- **WHEN** configure selects an existing repository
- **THEN** copy, symlink, and lifecycle state use the same descriptors, candidate mutation, normalization, validation, active-file planning, and sanitized projection as add onboarding
- **AND** configure-only groups and base policy do not expand add's onboarding controls
