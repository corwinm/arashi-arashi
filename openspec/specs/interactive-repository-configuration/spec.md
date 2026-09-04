# interactive-repository-configuration Specification

## Purpose
Define the optional, transactional repository-configuration flow offered by `aw add`, including eligibility, supported fields, hook sources, safe file materialization, confirmation, persistence, and rollback behavior.
## Requirements
### Requirement: Add offers optional repository configuration only in eligible human invocations

After cloning and inspecting a repository but before configuration persistence, `aw add` SHALL offer optional repository-owned worktree setup only when stdin and stdout are TTYs and neither `--json` nor `--force` is active. The top-level confirmation MUST default to no. Declining it SHALL continue add with the existing minimal `path` and `gitUrl` entry and SHALL NOT be treated as cancellation.

#### Scenario: Eligible user accepts onboarding

- **WHEN** a user runs `aw add` with TTY stdin/stdout and without `--json` or `--force`
- **AND** accepts the default-no repository setup prompt
- **THEN** Arashi presents one concise checklist for copy paths, symlink paths, and lifecycle hooks
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

Arashi SHALL discover likely local-file suggestions only from clone-surviving state in the canonical main checkout that owns future materialization sources: bounded root metadata plus a fixed bounded set of likely-local names classified by the checkout's applicable Git ignore rules. Discovery MUST be deterministic, root-only, metadata-only, bounded in entries and output, and MUST NOT open, hash, preview, recursively traverse, or print candidate file contents. Suggestions SHALL remain unselected, SHALL be rendered with terminal control characters escaped, and manual entry SHALL remain available.

#### Scenario: Likely ignored local files exist

- **WHEN** the canonical checkout root contains ignored `.env` variants or other approved likely-local candidates
- **THEN** Arashi presents their repository-relative paths as unselected suggestions
- **AND** does not read or display their contents

#### Scenario: Fresh clone has only ignore rules and tracked templates

- **WHEN** ignored local files did not survive cloning but the canonical checkout's Git ignore rules classify a fixed likely-local name such as `.env`
- **THEN** Arashi presents that repository-relative name as an unselected suggestion without requiring the file to exist yet
- **AND** does not infer candidate names from repository content or select the suggestion automatically

#### Scenario: A candidate name contains terminal controls

- **WHEN** root metadata contains an ignored likely-local name with a newline, escape byte, or another terminal control
- **THEN** the interactive prompt renders a bounded escaped representation rather than the raw control bytes
- **AND** manual canonical validation remains authoritative for any value the user enters

#### Scenario: A large ignored tree exists

- **WHEN** the checkout contains `node_modules` or another large ignored directory tree
- **THEN** discovery neither traverses nor suggests that tree by default
- **AND** completes within the configured entry/output bounds

#### Scenario: Discovery cannot classify suggestions

- **WHEN** bounded metadata or Git ignore inspection fails
- **THEN** onboarding keeps manual path entry available
- **AND** emits at most a bounded human diagnostic without exposing contents or paths outside the repository

### Requirement: Hook onboarding offers one canonical inline or executable file source

Selected repository hooks SHALL use exactly `pre-create`, `post-create`, `pre-remove`, and `post-remove`. For each lifecycle, Arashi SHALL offer exactly one source mode: inline Bash shorthand or explicit canonical interpreter map; or one host-native editable script with a fixed safe no-op scaffold at the workspace-owned repository-specific canonical active filename. Arashi MUST NOT infer executable behavior from repository files, setup scripts, package metadata, or lockfiles. Compatible repository-local remove files remain runtime sources and MUST block creating a competing canonical file.

#### Scenario: User supplies Bash shorthand

- **WHEN** the user selects one lifecycle and enters non-empty Bash shorthand
- **THEN** the candidate normalizes it through the canonical hook value shape
- **AND** records only that selected lifecycle

#### Scenario: User supplies explicit platform variants

- **WHEN** the user selects explicit interpreter variants
- **THEN** the candidate retains only non-empty `bash`, `powershell`, and/or `cmd` members
- **AND** rejects empty or unsupported members

#### Scenario: User chooses editable script files

- **WHEN** the user selects file mode for one or more lifecycles
- **THEN** the plan uses `.sh` on POSIX or exactly one `.ps1` on Windows and a fixed successful no-op scaffold
- **AND** maps configured create and remove scripts from the active configuration root to `.arashi/hooks/<lifecycle>.<repo><ext>`
- **AND** persists no inline value for those lifecycles

#### Scenario: Generated script is immediately executable and safe

- **WHEN** onboarding creates a planned hook script
- **THEN** the complete script is atomically visible at the exact active filename without a rename step
- **AND** POSIX mode is `0755` while Windows `.ps1` is runtime-ready
- **AND** unedited content is silent, non-mutating, and successful

#### Scenario: Hook source already exists or collides

- **WHEN** a selected lifecycle already has inline value, canonical active native source, compatible repository-local remove source, destination collision, ambiguous native candidates, symlinked parent, or another unsafe destination
- **THEN** Arashi does not overwrite or create another source
- **AND** returns a bounded field-attributed choice or transaction failure without reading source contents

#### Scenario: A parent path changes during installation

- **WHEN** any configuration-root, workspace `.arashi`/hooks, target-repository, or compatible repository-local `.arashi`/hooks component changes identity, becomes symlinked, or gains a competing source between planning and publication
- **THEN** pre-publication and post-publication validation rechecks both the destination hierarchy and compatible repository-local source location and fails the transaction without leaving competing active sources
- **AND** rollback removes only a proven invocation-owned unchanged file

#### Scenario: Setup script was detected

- **WHEN** onboarding detected or created a setup script
- **THEN** Arashi may mention its name as context
- **AND** does not read it to generate or pre-fill hook behavior

### Requirement: Hook bodies and generated script contents remain secret across every output boundary

Arashi MUST treat entered hook command bodies as sensitive executable text and MUST NOT print generated script contents. Human list views, prompt summaries, success output, cancellation output, errors, diagnostics, logs, JSON envelopes, snapshots, generated command contracts, docs, and semantic-check diagnostics MUST identify at most inline lifecycle/interpreter presence or generated-script lifecycle/path/executable state and MUST NOT include raw, masked, truncated, escaped, hashed, or length-derived command-body data.

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

#### Scenario: Final summary includes generated scripts

- **WHEN** the plan contains one or more generated scripts
- **THEN** the final summary lists lifecycle, exact active path, safe-no-op state, and executable-ready state
- **AND** does not print generated contents

### Requirement: Onboarding validates one complete in-memory candidate before one save

Arashi SHALL collect all selected answers into an isolated candidate and immutable script plan, run canonical complete-config normalization plus active-path safety validation in memory, display one concise sanitized summary, and request one final confirmation before mutation. Prompt callbacks MUST NOT save partial answers or create scripts. An accepted onboarding flow SHALL call configuration persistence at most once through add's existing expected-byte concurrency boundary and SHALL install only confirmed complete safe no-op scripts under the same add-owned transaction using private preparation, atomic publication, no-replace destination semantics, symlink rejection, and pre/post-publication path validation.

#### Scenario: Mixed configuration is confirmed

- **WHEN** the user selects copy, symlink, inline hook, and file hook choices, supplies valid values, and accepts final confirmation
- **THEN** Arashi validates one complete candidate and script plan, persists one repository entry containing selected canonical values, and creates only selected active safe no-op scripts
- **AND** performs one final config save rather than section-level writes

#### Scenario: Final confirmation is declined

- **WHEN** a user who opted into onboarding declines the final sanitized confirmation
- **THEN** Arashi returns controlled cancellation through add's rollback path
- **AND** leaves the configuration byte-for-byte unchanged

#### Scenario: Configuration changes concurrently

- **WHEN** configuration bytes change after add's snapshot and before final persistence
- **THEN** Arashi preserves the newer unowned bytes and reports the existing concurrency failure
- **AND** does not overwrite or merge the interactive candidate silently

### Requirement: Prompt cancellation participates in add rollback

Ctrl+C or another controlled prompt cancellation at any onboarding stage after the user opts in SHALL cancel add through its existing controlled failure and rollback path. Arashi SHALL attempt to restore config, invocation-created byte-and-mode-identical scripts, clone/worktree/branch, setup-script, and managed-ignore state according to current invocation ownership and final-observation rules. Validation retry is not cancellation, and top-level onboarding decline remains minimal success.

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
- **THEN** create and remove lifecycle paths resolve from the active configuration root to `.arashi/hooks/<lifecycle>.<repo><ext>`
- **AND** linked mode does not redirect remove hook storage into the active child worktree or canonical clone

#### Scenario: Existing active file must be retained

- **WHEN** an existing canonical or compatible native source cannot be replaced safely
- **THEN** configure never overwrites it and offers a skip/keep-existing path
- **AND** a confirmed edit to other settings leaves that file byte-identical
