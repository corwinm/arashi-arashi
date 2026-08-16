# inline-lifecycle-hook-configuration Specification

## Purpose
Define the closed, source-safe configuration and runtime contract for workspace- and repository-owned inline lifecycle hooks across validation, persistence, interpreter selection, execution, diagnostics, and generated artifacts.

## Requirements
### Requirement: Configured inline hooks have one typed closed configuration model
Arashi SHALL accept workspace inline lifecycle values at `hooks.scripts.<lifecycle>` and repository-owned values at `repos.<name>.hooks.<lifecycle>`, where `<lifecycle>` is exactly `pre-create`, `post-create`, `pre-remove`, or `post-remove`. Each value SHALL be either a non-empty, non-whitespace string shorthand for `{ "bash": <string> }` or a non-empty object whose own keys are drawn only from `bash`, `powershell`, and `cmd` and whose values are non-empty, non-whitespace strings. Repository ownership SHALL be represented only by nesting beneath `repos.<name>.hooks`; encoded keys such as `pre-create.<repo>` and `post-create.<repo>` MUST NOT be accepted as inline configuration.

#### Scenario: String shorthand is normalized
- **WHEN** configuration contains `hooks.scripts.pre-create` or `repos.api.hooks.pre-create` as a non-empty string
- **THEN** runtime normalization represents the value as a Bash-only interpreter map
- **AND** workspace versus repository ownership remains explicit

#### Scenario: Interpreter map is accepted
- **WHEN** an inline hook object contains one or more non-empty `bash`, `powershell`, or `cmd` values
- **THEN** configuration normalization retains exactly those supported entries for deterministic selection

#### Scenario: Dynamic repository lifecycle key is rejected
- **WHEN** configuration uses `hooks.scripts["post-create.api"]` or an equivalent encoded repository key
- **THEN** validation rejects the unknown lifecycle key
- **AND** does not treat it as a second repository-inline form

### Requirement: Invalid inline configuration fails before discovery or mutation
Unknown lifecycle names, unsupported interpreter keys, empty or whitespace-only snippets, empty maps, and values other than a string or interpreter map MUST fail configuration normalization with the canonical configuration error before repository discovery, hook-file discovery, interpreter resolution, branch/worktree operations, remove operations, or any hook process. JSON mode SHALL return the existing single-document structured configuration failure and MUST NOT include configured snippet text.

#### Scenario: Invalid values are rejected early
- **WHEN** an inline location contains an unknown lifecycle, empty string, whitespace-only string, empty map, unsupported key, non-string map value, array, number, boolean, or null
- **THEN** configuration validation fails before any discovery or mutation callback is invoked

#### Scenario: Invalid JSON invocation is non-secret
- **WHEN** invalid inline configuration is loaded by a JSON-capable command
- **THEN** stdout contains exactly one canonical configuration error envelope
- **AND** neither stdout nor stderr contains any valid or invalid snippet text

### Requirement: Schema and persistence preserve the inline-hook contract
The generated configuration JSON Schema, exported TypeScript configuration types, runtime normalization, config load/save/update paths, and checked-in schema artifact SHALL represent the same lifecycle, shorthand, interpreter-map, closed-key, and ownership rules. Persistence SHALL preserve root `hooks.timeout`, root `hooks.scripts`, repository hook objects, and unrelated repository fields without dropping or relocating them; it MAY retain shorthand or serialize the equivalent Bash map, but a valid load/save round trip SHALL remain semantically equivalent. The additive optional fields SHALL keep workspace config version exactly `1.0.0`; no migration or silent downgrade is introduced. Generated artifacts MUST pass their existing deterministic freshness checks.

#### Scenario: Schema provides both ownership locations
- **WHEN** the configuration schema is generated
- **THEN** it exposes all four lifecycle properties under root `hooks.scripts` and each `repos.<name>.hooks`
- **AND** rejects unknown lifecycle/interpreter properties and invalid value shapes

#### Scenario: Config update preserves hooks
- **WHEN** a config-mutating command loads and persists a configuration containing workspace and repository inline hooks plus `hooks.timeout`
- **THEN** every hook value and owner remains semantically equivalent after persistence
- **AND** unrelated repository path, URL, and group fields remain unchanged

### Requirement: Inline interpreter selection is deterministic and availability-gated
For a normalized inline map, POSIX SHALL select configured `bash` only and resolve it by scanning non-empty entries of the invocation environment's `PATH` in order for a regular executable `bash`, normalizing the first match to an absolute real path. Windows SHALL evaluate configured interpreters in exact order `powershell`, `cmd`, then `bash`, selecting the first available supported executable: `powershell` resolves only to `%SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`, `cmd` only to `%SystemRoot%\\System32\\cmd.exe`, and Bash by scanning non-empty `PATH` entries in order for a regular `bash.exe`; the selected path SHALL be absolute and normalized. Missing/invalid `%SystemRoot%`, empty path entries, `pwsh`, aliases, terminal hosts, and unconfigured fallbacks MUST NOT count as candidates. An unavailable higher-priority configured Windows entry SHALL fall through to the next configured entry. A configured inline location with no compatible and available interpreter MUST fail as `interpreter_unavailable` before lifecycle mutation. Runtime, remove dry-run, and doctor SHALL use the same resolver and injected platform/environment evidence.

#### Scenario: POSIX selects Bash
- **WHEN** a POSIX host resolves an inline map containing Bash and other interpreter entries
- **THEN** Arashi selects Bash and ignores Windows-only entries

#### Scenario: Windows honors fixed order
- **WHEN** a Windows inline map supplies multiple available interpreters
- **THEN** Arashi selects PowerShell before cmd and cmd before Bash
- **AND** filesystem, object-key, `PATH`, and terminal-host order do not change the result

#### Scenario: No interpreter is available
- **WHEN** no configured interpreter is compatible and available on the host
- **THEN** runtime and doctor report `interpreter_unavailable` from the shared resolver
- **AND** runtime performs no lifecycle mutation or hook execution

### Requirement: Inline and file sources fail closed at one logical location
An inline definition SHALL be an alternative source for one existing configured logical scope/lifecycle, not an additional hook. Root inline create hooks conflict with corresponding workspace create files; repository inline create hooks conflict with corresponding repository-specific workspace filenames; root inline remove hooks conflict with corresponding workspace remove files; and repository inline remove hooks conflict with corresponding repository-local remove files. If both sources exist, runtime, dry-run, and doctor MUST fail before lifecycle mutation, identify logical lifecycle, scope, owner, source kinds, and the file path, and MUST NOT select or execute either source. Hooks at different existing scopes SHALL continue to compose in their established order.

#### Scenario: Workspace location is ambiguous
- **WHEN** root inline `pre-remove` and a workspace `pre-remove` file both claim the configured workspace location
- **THEN** resolution fails before removal mutation and identifies both source kinds
- **AND** neither source executes

#### Scenario: Repository create location is ambiguous
- **WHEN** `repos.api.hooks.post-create` and the workspace repository-specific `post-create.api` file both exist
- **THEN** resolution fails before create mutation and identifies repository `api` and the file path
- **AND** does not disclose the inline value

#### Scenario: Different scopes compose
- **WHEN** an inline repository remove hook and a file-backed workspace or user-global hook exist at different logical locations
- **THEN** both remain eligible in the existing scope order

### Requirement: Inline sources preserve established logical names and classifications
Repository-owned configured create inline sources SHALL expose `pre-create.<repo>` or `post-create.<repo>` as both public `hookName` and `ARASHI_HOOK_NAME`. Workspace create and all configured remove inline sources SHALL preserve the plain lifecycle name; configured remove repository ownership SHALL be represented by scope and owner metadata rather than encoded into the name. Inline/file ambiguity SHALL produce `reasonCode: "validation_failed"`; configured-create JSON SHALL retain `CREATE_FAILED`, configured-remove JSON SHALL retain `HOOK_CONFIGURATION_INVALID`, and doctor SHALL emit `HOOK_AMBIGUOUS` with detail keys `hookName`, `scope`, `sourceKinds`, `sourceOwnerKind`, `sourceOwnerName`, and nullable `sourceScriptPath`. Unavailable interpreters SHALL retain `interpreter_unavailable` and doctor code `HOOK_INTERPRETER_UNAVAILABLE`.

#### Scenario: Repository create preserves dynamic runtime identity
- **WHEN** `repos.api.hooks.pre-create` resolves and executes
- **THEN** its public `hookName` and `ARASHI_HOOK_NAME` are `pre-create.api`
- **AND** source-owner metadata identifies repository `api` without snippet text

#### Scenario: Remove ambiguity preserves stable classifications
- **WHEN** repository-owned inline `pre-remove` conflicts with the corresponding repository-local file
- **THEN** its failed outcome uses plain `hookName: "pre-remove"` and `reasonCode: "validation_failed"`
- **AND** remove JSON uses `HOOK_CONFIGURATION_INVALID` while doctor uses `HOOK_AMBIGUOUS` with the required non-secret detail keys

### Requirement: Inline source text is never disclosed
Configured inline text MUST remain only in the in-memory executable plan and interpreter argument used for execution. Human output, quiet output, JSON envelopes, hook outcomes, dry-run previews, doctor findings, errors, logs, debug data, environment metadata, and persisted derived state MUST NOT contain, quote, hash, truncate, or otherwise derive the snippet. Public projections SHALL identify `sourceKind: "inline-config"`, source owner metadata, lifecycle, scope, and non-secret target context; an inline source path SHALL be `null` or omitted according to the owning public schema.

#### Scenario: Inline execution fails
- **WHEN** an inline hook exits nonzero or times out
- **THEN** human and JSON diagnostics identify the logical source and failure classification
- **AND** do not contain the configured command text

#### Scenario: Ambiguity and doctor are non-secret
- **WHEN** ambiguity or interpreter unavailability is reported by runtime, dry-run, or doctor
- **THEN** each surface exposes only non-secret source metadata
- **AND** no derived representation of the inline snippet appears

### Requirement: User-global and standalone hooks remain file-owned
Inline configuration SHALL apply only to a valid configured workspace. User-global shared and targeted hooks SHALL remain native files, and implicit standalone create/remove SHALL not load root or repository inline configuration from absent or invalid configured state.

#### Scenario: Standalone lifecycle runs
- **WHEN** implicit standalone create or remove evaluates hooks
- **THEN** it evaluates only the established user-global file locations
- **AND** no inline user-global or configless repository-local form is activated
