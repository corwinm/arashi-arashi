## Context

Arashi currently models lifecycle hooks as native files. Configured create has two file-owned logical locations: workspace lifecycle files and repository-specific filenames under the workspace hook directory. Configured remove evaluates repository-local, workspace, user-global targeted, and user-global shared locations once per target in deterministic scope order. Standalone create/remove evaluates only user-global targeted and shared files. The existing executor owns timeout, input, cwd/environment, quiet/JSON isolation, rollback/finalization, and outcome behavior.

Issue #271 adds concise executable snippets to configured workspace and repository objects. The change crosses configuration types and persistence, generated JSON Schema, create/remove planning, native subprocess adapters, doctor, dry-run and JSON contracts, public documentation and generated exports, packaged skill guidance, and meta-repository validation. Inline text is sensitive executable content: it can contain tokens or expansion syntax even though guidance forbids embedding secrets. The design therefore treats snippets as resolver input, never as diagnostic content.

The implementation must preserve three execution models rather than flatten discovery:

1. configured create: workspace locations plus repository-specific configured locations;
2. configured remove: repository, workspace, global-targeted, and global-shared locations per target;
3. standalone create/remove: global-targeted then global-shared files only.

The current file-only behavior remains the compatibility baseline. Configuration ownership adds a source alternative; it does not create a fifth scope or change lifecycle timing.

## Goals / Non-Goals

**Goals:**

- Add one typed `InlineHookValue` accepted at root `hooks.scripts.<lifecycle>` and `repos.<name>.hooks.<lifecycle>` for all four lifecycle names.
- Normalize, validate, generate schema for, load, and persist these values without accepting dynamic lifecycle/repository keys.
- Resolve inline and file sources through one logical-location planner shared by enabled runtime, remove dry-run, and doctor while configured-create dry-run preserves its existing no-discovery surface.
- Select an available interpreter deterministically and execute snippets through native subprocess adapters without interpolating paths or snippet text into wrapper command strings.
- Preserve exact configured create/remove lifecycle timing, cwd, multiplicity, gating, rollback/finalization, input, timeout, quiet, JSON, and outcome behavior.
- Fail before discovery or mutation for invalid configuration, and before lifecycle mutation for source ambiguity or interpreter unavailability.
- Identify source kind and owner in previews, diagnostics, and outcomes without disclosing inline text.
- Prove POSIX and Windows behavior through native integration jobs while retaining file-only compatibility.
- Deliver CLI, docs/exports, skills/package, and meta semantic validation in separate child PRs, then archive through the existing proposal/meta PR after child gates and merges.

**Non-Goals:**

- Inline user-global hooks, repository-local config files, external script paths, or arbitrary interpreters.
- Replacing native files or changing standalone discovery.
- Selecting or launching terminal applications.
- Persisting hook output, prompt answers, secrets, resolved interpreter paths, or execution outcomes in config.
- Changing lifecycle ordering, cwd, environment aliases, timeout bounds, confirmation behavior, rollback ownership, or post-remove finalization.
- Adding feature-specific workflow steps when existing stable aggregates already provide reachability.
- Adding `--no-hooks` to remove or adding configured-create hook previews to dry-run; source-neutral parity preserves each command's existing option and preview surface.

## Decisions

### 1. Configuration follows scope ownership

The public types are:

- `InlineHookInterpreter = "bash" | "powershell" | "cmd"`;
- `InlineHookValue = string | Partial<Record<InlineHookInterpreter, string>>`, with runtime validation requiring at least one own supported key and every value to be a non-empty, non-whitespace string;
- `hooks.scripts.<lifecycle>: InlineHookValue` for workspace scope;
- `repos.<name>.hooks.<lifecycle>: InlineHookValue` for repository scope.

The lifecycle set is exactly `pre-create`, `post-create`, `pre-remove`, and `post-remove`. A string is normalized internally to `{ bash: value }`. Persistence MAY retain accepted shorthand or serialize its normalized Bash map, but load/save/update paths must remain semantically equivalent and must not drop either root or repository hooks. Generated JSON Schema uses closed objects and rejects unknown lifecycle/interpreter keys. Encoded keys such as `pre-create.<repo>` are not a configuration form. Because the fields are optional and additive, the workspace config version remains exactly `1.0.0`; supporting CLIs accept the new fields and older closed-schema CLIs continue to reject them rather than silently ignoring executable policy.

This keeps repository identity with its existing path/groups/Git URL owner, supports schema completion, and avoids rename-coupled dynamic keys.

**Alternative considered:** `hooks.scripts["post-create.<repo>"]`. Rejected because it duplicates repository identity, weakens schema autocomplete, and creates rename and validation ambiguity.

### 2. Validate in two fail-closed phases

Configuration normalization runs before repository or hook discovery and before command mutation. It rejects unknown keys, empty strings, whitespace-only strings, empty maps, unsupported interpreters, and non-string/non-object values with the existing configuration error family and JSON envelope.

After valid configuration and command target planning are available, one side-effect-free hook resolver evaluates every enabled lifecycle location required by the command before lifecycle mutation. It detects file/file ambiguity, inline/file ambiguity, invalid file state, and interpreter availability. The resolver returns immutable plans or structured failures. Configured create's existing `--no-hooks` still loads and validates config but bypasses source discovery, interpreter preflight, and execution. Remove does not gain `--no-hooks`. Remove dry-run and doctor call the shared resolver in non-executing mode; configured-create dry-run preserves its existing no-discovery, empty-ledger behavior for both file and inline sources.

This separates malformed persisted input from host-dependent preflight and makes sentinel tests able to prove the required ordering.

**Alternative considered:** validating snippets lazily when each hook runs. Rejected because create/remove could mutate before detecting a later invalid location.

### 3. Inline is an alternative source at an existing logical location

A resolved plan carries logical name, scope, source kind, owner kind/name, optional absolute file path, optional in-memory snippet, interpreter, execution cwd, and target context. Repository-owned configured create preserves the existing outward logical names `pre-create.<repo>` and `post-create.<repo>` in `hookName` and `ARASHI_HOOK_NAME`; repository-owned configured remove preserves `pre-remove` and `post-remove`, with scope/owner distinguishing the target. Inline text is held only in the in-memory executable plan and is omitted from serializable/public projections.

Location mapping is exact:

- root inline create ↔ workspace create file;
- repository inline create ↔ workspace `pre-create.<repo>` / `post-create.<repo>` file;
- root inline remove ↔ workspace remove file;
- repository inline remove ↔ that repository's repository-local remove file.

If both alternatives claim one location, resolution fails and identifies the logical name, scope, owner, source kinds, and file path, but not snippet text. Hooks at different existing scopes continue to compose. User-global files have no inline alternative.

**Alternative considered:** inline precedence or executing both. Rejected because either choice can silently bypass reviewed policy or duplicate destructive automation.

### 4. Interpreter selection is deterministic and shared

The normalized map is resolved as follows:

- POSIX: select `bash` only when configured. Resolve it by scanning the invocation environment's non-empty `PATH` entries in order for a regular executable `bash`, normalize the first match to an absolute real path, and otherwise fail `interpreter_unavailable`.
- Windows: inspect configured keys in fixed order `powershell`, `cmd`, `bash`; select the first available entry. Resolve PowerShell only as `%SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`, cmd only as `%SystemRoot%\\System32\\cmd.exe`, and Bash by scanning non-empty `PATH` entries in order for a regular `bash.exe`; normalize the selected executable to an absolute path. Missing/invalid `%SystemRoot%`, empty path entries, `pwsh`, shell aliases, terminal hosts, and unconfigured fallbacks are ignored. An unavailable higher-priority configured entry falls through to the next configured candidate.

File extension continues to determine file-hook interpreter under the existing native contract. Inline dispatch never consults a terminal application. Enabled runtime, remove dry-run, and doctor consume the same injected platform/interpreter resolver so tests cannot prove a different candidate set.

Adapters use argument arrays: `bash -c <snippet>`, `powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command <snippet>`, and hardened `cmd.exe /d /e:on /v:off /s /c <snippet>`. Existing TTY policy controls stdin; PowerShell omits `-NonInteractive` so eligible `Read-Host` works and immediate EOF controls non-input modes. The cmd adapter preserves delayed-expansion and quoting policy and passes the snippet as the command payload, never concatenating execution paths or environment values into it.

**Alternative considered:** use the user's default shell, `COMSPEC`, `SHELL`, or terminal host. Rejected because results would be non-deterministic and doctor/runtime parity would be impossible to guarantee.

### 5. Existing lifecycle orchestration remains authoritative

The planner injects an inline-backed resolved hook into the same orchestration slot as a file-backed hook. It does not add a new pass. Therefore configured create retains workspace pre once before mutation, each repository pre/post pair at its existing materialized-worktree boundary, and workspace post once before move/switch/launch handling. Configured remove retains confirmation, pre-remove destructive gate, per-target repository → workspace → global-targeted → global-shared order, and post-remove execution after operation attempts including partial failures.

The executor derives identical environment and cwd from logical scope/target. For inline sources `ARASHI_HOOK_SOURCE_PATH` is omitted because no truthful path exists; additive source metadata identifies `inline-config`. File sources retain the absolute path and all current aliases. No environment variable contains snippet text.

**Alternative considered:** materialize temporary scripts. Rejected because it creates secret-bearing files, cleanup/permission races, misleading source paths, and extra mutation in dry-run/doctor-sensitive code.

### 6. Input, timeout, output, and failure policy is source-neutral

Both source kinds use the existing effective input resolver: `--no-hook-input` and JSON force immediate EOF/`disabled`; non-TTY human execution is `unavailable`; eligible human TTY execution is `tty`. The same 1..2147483647 ms configured timeout includes input wait and applies to all configured scopes. Quiet suppresses human progress consistently without changing execution. Hook stdout/stderr capture and human presentation follow existing behavior; JSON stdout remains one document.

Configured create's `--no-hooks` creates no hook process; remove does not acquire that option. Remove dry-run creates its existing previews only and never fabricates execution outcomes. Configured-create dry-run continues to perform no hook discovery/preflight and returns its existing empty hook ledger. Create failures enter existing owned rollback. Pre-remove failure blocks destructive work. Post-remove and operation failures are retained together regardless of completion order.

### 7. Public projections are explicitly non-secret

Outcome records gain `sourceKind`, `sourceOwnerKind`, and `sourceOwnerName`. `sourceKind` is `file` or `inline-config`; owner kind is `workspace`, `repository`, or `user-global`; owner name is the canonical repository name only for repository-owned locations and otherwise `null`. Existing `sourceScriptPath` remains an absolute string for files and is `null` for inline sources.

Dry-run previews and doctor findings use the same metadata. Human errors may identify logical lifecycle, scope, owner, source kind, and conflicting file path. They must not include, serialize, hash, truncate, quote, or otherwise derive snippet text. Internal thrown errors are constructed from non-secret projections rather than from full plan objects.

### 8. Doctor is resolver parity, never execution

Doctor enumerates configured create and remove locations and calls the same location/interpreter resolver as runtime. Inline/file ambiguity uses doctor code `HOOK_AMBIGUOUS` with non-secret detail keys `hookName`, `scope`, `sourceKinds`, `sourceOwnerKind`, `sourceOwnerName`, and nullable `sourceScriptPath`; unavailable interpreters use `HOOK_INTERPRETER_UNAVAILABLE`. Runtime ambiguity outcomes use `reasonCode: "validation_failed"`; configured create retains JSON code `CREATE_FAILED` and configured remove retains `HOOK_CONFIGURATION_INVALID`. It does not invoke the executor, create temporary scripts, or expose snippet text. Standalone diagnosis remains file-only.

### 9. Tests follow native adapters and stable aggregates

CLI tests begin with checker-first RED evidence. Unit/config tests cover type normalization, closed-key validation, schema generation/freshness, persistence, selection order, and no-disclosure projections. Real temporary configured workspaces activate every lifecycle in workspace and repository forms for create and remove. Native POSIX jobs run Bash. Native Windows jobs exercise PowerShell and cmd through production adapters, mixed availability/order, spaces, `%`, `!`, `&`, and parentheses. File-only fixtures are retained and compared without inline config.

Docs and skills each add/register focused semantic checks before prose changes. Their existing source/package aggregates remain authoritative. The CLI adds deterministic `contracts/inline-lifecycle-hooks.json`, schema version `1`, generated by `scripts/contracts/inline-lifecycle-hooks.ts`; its ordered payload fixes config version `1.0.0`, ownership paths, lifecycle order, interpreter vocabulary/host order and lookup policy, exact option ownership, dry-run support, logical names, ambiguity classifications, and public source fields. The meta checker is registered in the existing fail-closed aggregate and compares that contract plus the generated JSON Schema with canonical docs, generated exports, and extracted skills. The existing command contract remains schema version `7` and is not repurposed as a configuration contract. Workflow YAML is unchanged unless a RED reachability test proves a topology gap.

## Risks / Trade-offs

- **[Inline text can contain secrets and appears in process argv]** → Warn against secrets, never serialize snippets, use direct interpreter argv without logging it, and document that OS process visibility is part of executing shell code.
- **[Windows shell quoting differs substantially]** → Keep separate native adapters, fixed flags, production-path native tests, and metacharacter fixtures; do not emulate Windows solely on POSIX.
- **[Preflight of all locations can be more expensive]** → Resolution is bounded file/config/interpreter inspection and occurs once before mutation; correctness outweighs negligible cost.
- **[A repository rename changes source ownership]** → Ownership is the canonical current config key, which is the desired behavior and avoids stale encoded lifecycle keys.
- **[Schema/config version drift]** → Keep workspace config version `1.0.0`, add the dedicated inline contract at schema version `1`, retain command-contract schema version `7`, and enforce all three with deterministic freshness tests.
- **[Docs/checker duplication can grow]** → Register focused semantics through stable aggregates and keep user prose outcome-oriented; do not add feature-specific workflow stages.
- **[File and inline ambiguity may block a previously working file hook after config adoption]** → Fail before mutation with actionable source metadata and require the user to remove one definition; never choose silently.

## Migration Plan

1. Land CLI RED tests/checkers, then typed config/schema/persistence, shared resolver/adapters, orchestration integration, doctor/previews/outcomes, and native tests in the CLI child PR. Existing file-only configs require no migration.
2. Land docs canonical guidance and regenerated agent exports through the docs child PR after its semantic checker has demonstrated RED.
3. Land authored/package skill guidance and extracted-archive validation through the skills child PR after source/package RED.
4. Land the registered coordinated checker and OpenSpec task updates in the meta proposal PR, using stable child aggregates.
5. Merge green child PRs separately, CLI first and companions after their required contract input is available. If tracked meta configuration later consumes inline hooks, gate it on the merged/released/installed CLI; this proposal itself does not require dogfood config mutation.
6. Run final exact-head child and coordinated validation, complete every pre-archive task, archive/sync the OpenSpec change, validate synced specs, update the existing meta PR to close the issue, and merge it last.

Rollback is additive: reverting the CLI and companion PRs restores file-only behavior. Configs containing inline fields must not be silently downgraded; an older CLI will reject unknown fields, so rollback guidance requires removing inline fields or restoring the supporting version. No automatic config rewrite is performed.

## Open Questions

None. Implementation may choose internal type/module names, but public configuration paths, interpreter order, pre-mutation boundaries, lifecycle parity, source metadata, secrecy, and delivery order are fixed by the delta specifications.
