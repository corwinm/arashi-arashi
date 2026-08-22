## ADDED Requirements

### Requirement: Configure exposes only explicit product-owned scopes and descriptors

`aw configure` SHALL select among workspace settings, workspace lifecycle hooks, command and editor defaults, meta-repository policy, and one configured repository. The editor SHALL use product-owned descriptors rather than JSON Schema prompt generation. Each descriptor MUST identify its canonical path, ownership, accepted shape, persisted state, safe display policy, validation adapter, and effective-value resolver where applicable. Unsupported schema fields SHALL remain preserved and unexposed.

The supported descriptor set SHALL include workspace `reposDir`, `worktreesDir`, `baseBranch`, and `sync.timeoutSeconds`; workspace `hooks.timeout` and four lifecycle sources; `defaults.create.switch`, `defaults.create.launch`, `defaults.switch.mode`, `defaults.editors.vscode.create.switch`, `defaults.editors.vscode.create.launch`, `defaults.editors.cursor.create.switch`, `defaults.editors.cursor.create.launch`, `defaults.editors.kiro.create.switch`, and `defaults.editors.kiro.create.launch`; `meta.baseBranch`; and existing-repository `groups`, `baseBranch`, `copy`, `symlink`, and four lifecycle sources. Repository `path` and `gitUrl` SHALL identify the selected repository but SHALL NOT be editable through this command.

#### Scenario: User selects a scope

- **WHEN** an eligible user runs `aw configure`
- **THEN** Arashi presents the six explicit scope families and configured repository names
- **AND** identifies the canonical configuration path owned by the selected scope

#### Scenario: Schema contains another field

- **WHEN** the canonical schema contains a field outside the supported descriptor set
- **THEN** `aw configure` does not expose a control for that field
- **AND** a confirmed edit preserves its compatible persisted value unchanged

#### Scenario: Repository identity is shown but immutable

- **WHEN** a user selects an existing repository
- **THEN** Arashi identifies its configured name and canonical `repos.<name>` path
- **AND** does not offer repository `path` or `gitUrl` as editable fields

### Requirement: Persisted and effective configuration states are distinct

For every supported descriptor, Arashi SHALL label the canonical field as `Configured` when present and `Not configured` when absent. A separately labeled effective value SHALL show an inherited value or built-in default when one exists. `Not configured` MUST NOT imply required, ignored, invalid, or ineffective behavior, and `aw configure` MUST NOT replace `aw doctor` runtime diagnostics.

#### Scenario: Unset setting has a built-in default

- **WHEN** `hooks.timeout` is absent
- **THEN** inspection labels it `Not configured`
- **AND** separately labels the built-in effective timeout without persisting it

#### Scenario: Repository inherits a workspace base

- **WHEN** `repos.<name>.baseBranch` is absent and root `baseBranch` is configured
- **THEN** the repository field remains labeled `Not configured`
- **AND** the workspace value is shown separately as inherited effective state

#### Scenario: Workspace paths and timeouts use built-ins

- **WHEN** `worktreesDir`, `sync.timeoutSeconds`, or `hooks.timeout` is absent
- **THEN** each field remains labeled `Not configured`
- **AND** Arashi separately reports the canonical built-in `.arashi/worktrees`, 300-second sync timeout, or 300000-millisecond hook timeout respectively

#### Scenario: Create defaults are absent

- **WHEN** `defaults.create.switch` and `defaults.create.launch` are absent
- **THEN** each field remains labeled `Not configured`
- **AND** Arashi separately reports the built-in effective values `false` and `none`

#### Scenario: Editor defaults remain editor-scoped

- **WHEN** an editor-specific create field is absent while a workspace create default is configured
- **THEN** the editor-specific field remains labeled `Not configured`
- **AND** effective state follows the canonical editor-scoped resolver rather than claiming unsupported inheritance from the workspace create default

#### Scenario: Switch mode uses contextual automatic behavior

- **WHEN** `defaults.switch.mode` is absent
- **THEN** the field remains labeled `Not configured`
- **AND** Arashi labels its effective behavior as built-in `auto` without claiming a fixed runtime launcher or parent-shell result

#### Scenario: Meta base inherits workspace policy

- **WHEN** `meta.baseBranch` is absent and root `baseBranch` is configured
- **THEN** the meta field remains labeled `Not configured`
- **AND** the workspace base is shown separately as inherited effective state

#### Scenario: No default or inheritance exists

- **WHEN** a supported optional setting is absent and has no effective value
- **THEN** Arashi labels it `Not configured`
- **AND** does not invent, persist, or imply a value

### Requirement: Every selected setting has unambiguous keep edit and clear actions

Arashi SHALL offer explicit keep, edit, and clear actions appropriate to each supported persisted descriptor. Keep SHALL preserve the persisted field exactly through canonical serialization; edit SHALL set or replace it using the descriptor's accepted shape; clear SHALL omit the canonical field after normalization and prune only empty owning containers. Empty text input MUST NOT mean both keep and clear. Every candidate mutation SHALL be immutable and preserve unrelated compatible fields. A pre-existing active native file is external active state rather than a persisted field: configure MUST NOT delete or overwrite it, and SHALL offer keep/skip instead of clear until a separately designed file-removal contract exists.

#### Scenario: User keeps a setting

- **WHEN** the user chooses keep for a configured setting
- **THEN** its persisted value remains unchanged in the candidate
- **AND** no empty-input convention is needed

#### Scenario: User clears a setting

- **WHEN** the user explicitly chooses clear
- **THEN** the canonical field is omitted after normalization
- **AND** unrelated fields and non-empty parent containers are preserved

#### Scenario: User enters an invalid replacement

- **WHEN** an edited value fails canonical field or complete-config validation
- **THEN** Arashi displays a bounded field-attributed diagnostic and returns to the owning setting
- **AND** writes no configuration or active file

#### Scenario: Lifecycle has a pre-existing active file

- **WHEN** a lifecycle resolves to an existing native file
- **THEN** configure does not offer clear as a file-deletion action and never deletes or overwrites the file
- **AND** the user may keep/skip the existing source or choose another action only when canonical exclusivity and no-overwrite validation allow it

### Requirement: Existing repository editing consumes the shared repository editor

Existing-repository `copy`, `symlink`, and lifecycle editing SHALL consume the shared descriptors, immutable candidate mutation, normalization, validation, suggestions, hook source planning, and sanitized projections delivered for interactive repository onboarding. It MUST NOT duplicate those rules in configure-local prompt code. Repository groups and base policy SHALL use explicit extensions of the same editor model.

#### Scenario: Existing materialization fields are edited

- **WHEN** a user edits repository `copy` or `symlink`
- **THEN** declaration order, canonical normalization, portable collision handling, bounded content-free suggestions, control-escaped labels, and manual entry match the shared editor contract
- **AND** unknown or unrelated repository fields remain unchanged

#### Scenario: Existing lifecycle source is edited

- **WHEN** a user edits one repository lifecycle
- **THEN** exactly one inline or active-file source may be selected
- **AND** sole-Bash inline values normalize to string shorthand while multi-interpreter values normalize to maps

#### Scenario: Existing active source prevents configuration

- **WHEN** native-file diagnostics make a lifecycle choice unconfigurable
- **THEN** the user can retry or skip that lifecycle while retaining its existing active source
- **AND** native-file path diagnostics are not applied to an inline-only lifecycle without a native source conflict

### Requirement: Workspace lifecycle editing uses canonical inline or active-file sources

Workspace lifecycle editing SHALL support `pre-create`, `post-create`, `pre-remove`, and `post-remove` through the canonical workspace `hooks.scripts` fields or exact active workspace hook files. Inline command entry SHALL be visible plaintext. Ordinary scope lists, diagnostics, cancellation, and structured inspection SHALL expose only lifecycle/interpreter presence; they MUST NOT repeat command bodies.

#### Scenario: Workspace inline hook is configured

- **WHEN** the user supplies Bash text for a workspace lifecycle
- **THEN** it is entered visibly and persisted in canonical shorthand after confirmation
- **AND** ordinary views identify only the lifecycle and Bash presence

#### Scenario: Workspace active file is planned

- **WHEN** the user chooses active-file mode
- **THEN** Arashi plans the exact canonical active workspace filename with the fixed safe no-op content and runtime-ready permissions
- **AND** removes any inline value for that lifecycle from the candidate

### Requirement: Final confirmation previews exact persisted bytes and separate active files

Before mutation, Arashi SHALL canonically normalize and validate the complete candidate and immutable active-file plan. The final confirmation SHALL show the actual serialized candidate JSON that would be written, including plaintext persisted inline command bodies. Planned active files SHALL appear separately with lifecycle, exact path, and readiness state; generated-file state and contents MUST NOT be inserted into the JSON preview.

#### Scenario: Candidate contains inline commands

- **WHEN** the user reaches final confirmation after entering inline command text
- **THEN** the JSON preview includes the exact normalized persisted command values
- **AND** previous list, diagnostic, and cancellation views remain body-free

#### Scenario: Candidate contains active files

- **WHEN** one or more active files are planned
- **THEN** the final confirmation lists their lifecycle, exact path, safe-no-op state, and runtime readiness separately
- **AND** does not print generated file contents

#### Scenario: Preview is declined or interrupted

- **WHEN** the user declines final confirmation or sends Ctrl+C before mutation
- **THEN** configuration bytes and active files remain unchanged
- **AND** cancellation output does not repeat inline command bodies

### Requirement: Configure performs one concurrency-checked transaction

A confirmed edit SHALL install planned active files through the existing private-preparation, atomic no-replace, ownership-checked transaction and SHALL perform at most one expected-byte configuration save through the canonical persistence boundary. Validation, retries, and prompts SHALL not mutate disk. Concurrent configuration changes MUST preserve the newer bytes. Rollback SHALL remove only invocation-owned unchanged active files, and any concurrently retained repository entry SHALL retain referenced materialization.

#### Scenario: Confirmed edit succeeds

- **WHEN** candidate validation passes, destinations are safe, expected config bytes still match, and the user confirms
- **THEN** Arashi installs only planned absent active files and saves the complete candidate at most once
- **AND** the resulting config bytes equal the final preview

#### Scenario: Config changes concurrently

- **WHEN** config bytes differ from the original snapshot before persistence
- **THEN** Arashi does not overwrite or merge the candidate silently
- **AND** preserves the newer bytes and rolls back only active files it still owns

#### Scenario: Active file installation partially fails

- **WHEN** installation fails after one or more planned files were published
- **THEN** the transaction removes only unchanged invocation-owned files and leaves config bytes unchanged
- **AND** preserves pre-existing, edited, replaced, symlinked, or ownership-ambiguous paths

#### Scenario: Candidate has no persisted or active-file changes

- **WHEN** the user keeps or skips every selected setting and canonical serialization equals the original snapshot with no active-file plan
- **THEN** Arashi reports that there are no changes and performs no final mutation confirmation
- **AND** does not install files or call configuration persistence

### Requirement: Configure invocation modes never prompt or mutate implicitly

Interactive editing SHALL require TTY stdin and stdout. `aw configure --json` SHALL never prompt or mutate and SHALL emit exactly one stable sanitized inspection document containing supported scope, canonical path, configured/effective state, safe configured values, and lifecycle/interpreter presence without inline bodies. Non-TTY invocation without `--json` SHALL fail clearly without mutation. Broad non-interactive `--set` and `--unset` mutation flags are not part of this capability.

#### Scenario: JSON inspection runs

- **WHEN** a user runs `aw configure --json`
- **THEN** stdout contains exactly one stable inspection envelope and no prompts
- **AND** config bytes and active files remain unchanged

#### Scenario: JSON inspection encounters inline hooks

- **WHEN** configured workspace or repository hooks contain inline command bodies
- **THEN** the document reports only lifecycle and interpreter presence
- **AND** no raw, truncated, escaped, encoded, hashed, masked, or length-derived body data appears

#### Scenario: Non-TTY human invocation runs

- **WHEN** stdin or stdout is not a TTY and `--json` is absent
- **THEN** the command fails with a clear TTY requirement
- **AND** performs no implicit inspection prompt or mutation

#### Scenario: Workspace is not configured

- **WHEN** configure runs outside a configured workspace or `.arashi/config.json` is missing
- **THEN** human and JSON modes fail with the canonical configured-workspace diagnostic
- **AND** do not initialize, prompt, inspect an implicit standalone workspace, or mutate files

#### Scenario: Persisted configuration is invalid

- **WHEN** canonical configuration loading or validation fails
- **THEN** configure reports the canonical sanitized validation failure before scope inspection
- **AND** does not rewrite, repair, prompt, or create active files

### Requirement: Real PTY coverage proves configure journeys and cancellation

Maintained PTY integration tests SHALL drive the real prompt adapters with raw terminal bytes across every supported scope, repository selection, configured/unset/effective display, keep/edit/clear, visible inline entry, exact serialized preview, generated-file listing, validation retry, skip/keep-existing behavior, final decline, Ctrl+C, and concurrent modification. Tests SHALL prove no prompt-time mutation and sanitized ordinary output.

#### Scenario: Maintained PTY suite runs

- **WHEN** the canonical test command executes configure PTY coverage
- **THEN** raw terminal inputs exercise representative success, retry, decline, cancellation, and concurrency journeys
- **AND** every required scope and secrecy boundary is covered without symbolic-key shortcuts
