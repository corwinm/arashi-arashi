## ADDED Requirements

### Requirement: Add offers optional repository configuration only in eligible human invocations

After cloning and inspecting a repository but before configuration persistence, `aw add` SHALL offer optional repository-owned worktree setup only when stdin and stdout are TTYs and neither `--json` nor `--force` is active. The top-level confirmation MUST default to no. Declining it SHALL continue add with the existing minimal `path` and `gitUrl` entry and SHALL NOT be treated as cancellation.

#### Scenario: Eligible user accepts onboarding

- **WHEN** a user runs `aw add` with TTY stdin/stdout and without `--json` or `--force`
- **AND** accepts the default-no repository setup prompt
- **THEN** Arashi presents one concise checklist for copy paths, symlink paths, and inline lifecycle hooks
- **AND** prompts only for selected sections

#### Scenario: Eligible user declines onboarding

- **WHEN** an eligible user declines the top-level repository setup prompt
- **THEN** Arashi completes add with only the existing minimal repository fields
- **AND** does not run candidate discovery or section prompts

#### Scenario: Invocation cannot prompt

- **WHEN** stdin or stdout is not a TTY, or `--json` or `--force` is active
- **THEN** Arashi does not run candidate discovery or any onboarding prompt
- **AND** preserves the existing minimal-add behavior, output, and exit contract

### Requirement: The repository editor has explicit canonical field and scope metadata

Arashi SHALL represent the onboarding fields through a reusable typed configuration-editor model whose descriptors identify canonical repository ownership, configuration path, configured-versus-unset state, display metadata, accepted value shape, sensitivity, validation adapter, and sanitized projection. `add` SHALL consume only descriptors for direct repository `copy`, `symlink`, and `hooks.<lifecycle>` fields. The model MUST NOT infer prompt behavior directly from JSON Schema and MUST remain usable by follow-up #316 without implementing existing-entry editing in this change.

#### Scenario: New repository begins with unset optional fields

- **WHEN** add constructs the editor state for a newly cloned repository
- **THEN** every supported optional field is represented as unset
- **AND** required `path` and `gitUrl` remain part of the complete repository candidate rather than editable onboarding options

#### Scenario: A supported field becomes configured

- **WHEN** a user supplies a valid value for one selected field
- **THEN** the editor candidate records that value at its canonical repository path
- **AND** the descriptor reports configured state without changing unrelated fields

#### Scenario: Generic schema metadata contains another field

- **WHEN** the generated JSON Schema contains workspace, meta, defaults, or another repository field outside the approved onboarding subset
- **THEN** add does not expose that field merely because it appears in the schema
- **AND** explicit editor metadata remains authoritative for prompt scope

### Requirement: Path collection reuses canonical materialization validation

Copy and symlink answers SHALL be direct repository-relative string arrays using the canonical repository materialization path normalizer, portable collision rules, and declaration-order semantics. Prompt code MUST NOT implement an alternate accepted syntax, normalization, remapping, glob, interpolation, required flag, or fallback behavior. A recoverable invalid answer SHALL return to the owning path section without persisting configuration.

#### Scenario: Valid copy and symlink paths are accepted

- **WHEN** the user enters valid distinct relative paths for selected copy and symlink sections
- **THEN** the normalized complete candidate stores them in canonical declaration order
- **AND** later loading produces the same canonical values

#### Scenario: A path is invalid

- **WHEN** a manual or suggested path violates canonical materialization validation
- **THEN** Arashi shows a bounded field-attributed validation message and returns to that path section
- **AND** no configuration bytes are written

#### Scenario: Paths collide after normalization

- **WHEN** two entries duplicate or collide portably within or across copy and symlink arrays
- **THEN** Arashi reports the canonical collision through the relevant section
- **AND** does not advance to final confirmation until the complete candidate validates

#### Scenario: Dependency directory is entered manually

- **WHEN** the user manually enters `node_modules` or an equivalent dependency-sharing path
- **THEN** Arashi retains canonical validation behavior and presents the established dependency-sharing warning
- **AND** does not automatically suggest or silently select that path

### Requirement: Ignored local path discovery is bounded, advisory, and content-free

Arashi SHALL discover likely local-file suggestions only from the canonical cloned main checkout that owns future materialization sources. Discovery MUST be deterministic, root-only, metadata-only, bounded in entries and output, limited to explicit likely-local name patterns plus Git ignore classification, and MUST NOT open, hash, preview, recursively traverse, or print file contents. Suggestions SHALL remain unselected and manual entry SHALL remain available.

#### Scenario: Likely ignored local files exist

- **WHEN** the canonical checkout root contains ignored `.env` variants or other approved likely-local candidates
- **THEN** Arashi presents their repository-relative paths as unselected suggestions
- **AND** does not read or display their contents

#### Scenario: A large ignored tree exists

- **WHEN** the checkout contains `node_modules` or another large ignored directory tree
- **THEN** discovery neither traverses nor suggests that tree by default
- **AND** completes within the configured entry/output bounds

#### Scenario: Discovery cannot classify suggestions

- **WHEN** bounded metadata or Git ignore inspection fails
- **THEN** onboarding keeps manual path entry available
- **AND** emits at most a bounded human diagnostic without exposing contents or paths outside the repository

### Requirement: Inline hook collection uses canonical lifecycle and interpreter shapes

Selected repository inline hooks SHALL use exactly `pre-create`, `post-create`, `pre-remove`, and `post-remove`. For each selected lifecycle, Arashi SHALL collect either Bash shorthand or a non-empty explicit map drawn only from `bash`, `powershell`, and `cmd`, and SHALL validate the result through canonical inline-hook normalization. Every command body MUST be supplied or confirmed by the user; Arashi MUST NOT infer, generate, or pre-fill executable commands from repository files, setup scripts, package metadata, or lockfiles.

#### Scenario: User supplies Bash shorthand

- **WHEN** the user selects one lifecycle and enters a non-empty Bash shorthand body
- **THEN** the candidate normalizes it through the canonical hook value shape
- **AND** records only that selected lifecycle

#### Scenario: User supplies explicit platform variants

- **WHEN** the user selects explicit interpreter variants for one lifecycle
- **THEN** the candidate retains only non-empty canonical `bash`, `powershell`, and/or `cmd` members
- **AND** rejects empty or unsupported members through the relevant hook prompt

#### Scenario: Setup script was detected

- **WHEN** add detected or created a setup script before onboarding
- **THEN** Arashi may mention the script name as context
- **AND** does not read it to generate, pre-fill, or silently confirm an inline command

### Requirement: Hook bodies remain secret across every output boundary

Arashi MUST treat entered hook command bodies as sensitive executable text. Human list views, prompt summaries, success output, cancellation output, errors, diagnostics, logs, JSON envelopes, snapshots, generated command contracts, docs, and semantic-check diagnostics MUST identify at most lifecycle and interpreter presence and MUST NOT include raw, masked, truncated, escaped, hashed, or length-derived command-body data.

#### Scenario: Final summary includes hooks

- **WHEN** a complete candidate contains one or more inline hooks
- **THEN** the final summary lists selected lifecycle and interpreter names
- **AND** contains no command body or derivative of it

#### Scenario: Validation or persistence fails

- **WHEN** an error occurs after a hook body has been entered
- **THEN** human and structured diagnostics identify only the owning canonical field/lifecycle as needed
- **AND** do not serialize the entered body

#### Scenario: Canary body crosses maintained surfaces

- **WHEN** tests enter a unique hook-body canary and capture stdout, stderr, JSON, logs, snapshots, contracts, and generated guidance
- **THEN** the canary and its encoded or truncated derivatives are absent from every captured surface

### Requirement: Onboarding validates one complete in-memory candidate before one save

Arashi SHALL collect all selected answers into an isolated candidate, run canonical complete-config normalization and semantic validation in memory, display one concise sanitized summary, and request one final confirmation before persistence. Prompt callbacks MUST NOT save partial answers. An accepted onboarding flow SHALL call configuration persistence at most once through add's existing expected-byte concurrency boundary.

#### Scenario: Mixed configuration is confirmed

- **WHEN** the user selects copy, symlink, and hook sections, supplies valid values, and accepts final confirmation
- **THEN** Arashi validates one complete candidate and persists one repository entry containing all selected canonical values
- **AND** performs one final save rather than section-level writes

#### Scenario: Final confirmation is declined

- **WHEN** a user who opted into onboarding declines the final sanitized confirmation
- **THEN** Arashi returns controlled cancellation through add's rollback path
- **AND** leaves the configuration byte-for-byte unchanged

#### Scenario: Configuration changes concurrently

- **WHEN** configuration bytes change after add's snapshot and before final persistence
- **THEN** Arashi preserves the newer unowned bytes and reports the existing concurrency failure
- **AND** does not overwrite or merge the interactive candidate silently

### Requirement: Prompt cancellation participates in add rollback

Ctrl+C or another controlled prompt cancellation at any onboarding stage after the user opts in SHALL cancel add through its existing controlled failure and rollback path. Arashi SHALL attempt to restore config, clone/worktree/branch, setup-script, and managed-ignore state according to current invocation ownership and final-observation rules. Validation retry is not cancellation, and top-level onboarding decline remains minimal success.

#### Scenario: User interrupts a section prompt

- **WHEN** the user sends Ctrl+C during section selection, path entry, lifecycle/interpreter entry, or final confirmation
- **THEN** Arashi performs no configuration save and enters add rollback
- **AND** reports controlled cancellation without an uncaught prompt exception

#### Scenario: Validation is recoverable

- **WHEN** one answer fails a field-attributed validation that can be retried safely
- **THEN** Arashi returns to the owning prompt while retaining other validated candidate sections in memory
- **AND** does not roll back repository materialization unless the user subsequently cancels

### Requirement: Existing add modes and setup behavior remain coherent

Interactive onboarding SHALL preserve duplicate-repository clone fallback, `--create-setup`, direct-main, configured-bare, and linked-parent add semantics. `--create-setup` SHALL continue to create only the existing setup script when requested and SHALL NOT silently convert that script into an inline hook. Existing JSON stdout isolation and machine-readable add envelope shape SHALL remain unchanged for non-interactive minimal add.

#### Scenario: Create setup and onboarding are both active

- **WHEN** an eligible user passes `--create-setup`, no setup script exists, and then opts into onboarding
- **THEN** Arashi creates the established setup script before onboarding context is shown
- **AND** persists an inline hook only if the user separately supplies and confirms one

#### Scenario: Duplicate repository is configured

- **WHEN** add detects a duplicate before cloning
- **THEN** it retains the existing clone-fallback prompt behavior
- **AND** does not begin onboarding for a new repository entry

#### Scenario: JSON add succeeds

- **WHEN** `aw add --json` succeeds
- **THEN** stdout remains exactly one existing structured document with the current schema
- **AND** no onboarding prompt, suggestion, summary, or hook body is emitted

### Requirement: Real PTY coverage proves the complete onboarding journey

Maintained tests SHALL exercise the real prompt adapter with terminal byte sequences for top-level decline, section selection, copy-only, symlink-only, hook-only, mixed configuration, manual entry, validation retry, final-confirmation decline, and Ctrl+C at every prompt stage. PTY coverage SHALL prove prompt eligibility, sanitized output, exit behavior, one-save persistence, and rollback final state in addition to pure model and executor tests.

#### Scenario: Maintained PTY suite runs

- **WHEN** the repository's canonical test command executes onboarding PTY coverage
- **THEN** raw terminal inputs drive the actual Inquirer-backed prompt path without unresolved promises or symbolic key shortcuts
- **AND** every required success, retry, decline, cancellation, and secrecy assertion passes
