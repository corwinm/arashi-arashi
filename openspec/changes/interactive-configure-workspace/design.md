## Context

Arashi loads `.arashi/config.json` through a closed typed model, canonical normalization, semantic validation, and deterministic serialization. Today users inspect or change that file manually. #274 introduced an explicit repository editor for add onboarding: product-owned descriptors, immutable candidate mutation, configured/unset state, canonical adapters, content-free suggestions, inline-or-active-file lifecycle selection, exact serialized preview, metadata-only path diagnostics, and transaction-owned no-replace active-file installation.

`aw configure` must expand that boundary to an existing workspace without turning JSON Schema into prompt behavior. It spans CLI registration/contracts, prompt orchestration, config editing, active workspace/repository hooks, expected-byte persistence, PTY and JSON output, public docs, generated exports, packaged skills, and coordinated semantic checks. Inline commands are persisted plaintext and intentionally visible during entry and exact final preview, while ordinary inspection and diagnostics remain body-free. Existing pure Node/Bun filesystem race boundaries and non-crash-safe config replacement remain unchanged.

## Goals / Non-Goals

**Goals:**

- Add one explicit interactive command for supported existing-workspace inspection and editing.
- Distinguish persisted state from inherited or built-in effective values.
- Generalize the #274 descriptor/editor model only through concrete workspace, default, meta, and existing-repository consumers.
- Preserve unknown-to-the-editor but canonically compatible fields through immutable candidate changes.
- Make keep, edit, and clear separate actions with canonical normalization and field-attributed retry.
- Preview exact serialized config plus a separate immutable active-file plan before one confirmation.
- Reuse expected-byte locking, no-replace script installation, and ownership-checked rollback.
- Keep JSON and non-TTY invocation non-mutating and non-prompting.

**Non-Goals:**

- A generic JSON Schema form, free-form JSON editor, or control for every schema field.
- Editing repository identity (`path` or `gitUrl`) through configure.
- Broad non-interactive mutation flags, implicit defaults persistence, or automatic repairs.
- Secret storage, masked command entry, or omission of inline bodies from the exact final JSON preview.
- Replacing `aw doctor` diagnostics or judging runtime effectiveness.
- Crash-safe/disk-full-safe config replacement, native helper expansion, or stronger filesystem race claims.

## Decisions

### 1. Generalize descriptors around canonical lenses, not schema traversal

A new workspace configuration editor layer will describe each supported field with a stable ID, scope, canonical path template, ownership, accepted shape, safe display policy, effective resolver, getter, immutable set/clear adapter, and canonical validation attribution. The repository descriptor type will be widened into this common model while retaining `REPOSITORY_ONBOARDING_DESCRIPTORS` as the exact add subset.

Supported configure descriptors are deliberately finite:

- workspace: `reposDir`, `worktreesDir`, `baseBranch`, `sync.timeoutSeconds`;
- workspace hooks: `hooks.timeout` and four `hooks.scripts` lifecycle sources;
- command defaults: create `switch`/`launch`, switch `mode`, and `vscode`/`cursor`/`kiro` create `switch`/`launch`;
- meta: `meta.baseBranch`;
- repository: `groups`, `baseBranch`, `copy`, `symlink`, and four lifecycle sources.

Repository `path` and `gitUrl` are selection/identity context only. Root `$schema`, `version`, and other unsupported fields are preserved but not editable.

**Alternative considered:** derive controls from JSON Schema. Rejected because schema does not own scope order, effective values, inheritance, clear semantics, prompt UX, sensitive projection, active-file alternatives, or retry ownership.

### 2. Model persisted state, effective state, and editing action separately

Inspection records contain `configured: true|false`, an optional safe persisted display value, and a separate optional effective record with `source` (`inherited` or `built-in`) and value. Absence remains absence; effective resolution never mutates the candidate.

Configured presence is projected from the parsed original JSON document before normalization injects compatibility defaults such as `worktreesDir`. The same bytes are independently normalized and validated into the canonical candidate model. This dual projection prevents an inherited or built-in value from being mislabeled as persisted while preserving canonical validation and serialization for edits.

The action controller asks explicitly for keep, edit, or clear. Text entry is used only after edit is chosen. Clear deletes the canonical persisted leaf and prunes only empty optional containers. Required `reposDir` can be edited or kept but not cleared. A pre-existing active native file is external active state, not a persisted field: configure never deletes or overwrites it and offers keep/skip rather than clear. Every operation returns a new candidate.

Built-in resolvers use the same constants and precedence functions as runtime consumers where available. `worktreesDir` resolves to `.arashi/worktrees`; sync and lifecycle timeout fields resolve to their canonical 300-second and 300000-millisecond defaults. Repository and meta base inheritance delegates to canonical workspace/repository base policy. Create defaults resolve to switch `false` and launch `none`; editor create defaults remain editor-scoped rather than inventing fallback to workspace create defaults. Unset switch mode is presented as built-in `launch`; explicitly configured `auto` remains context-sensitive and is not collapsed into one launch result during inspection.

**Alternative considered:** use blank input for keep and a magic token for clear. Rejected as ambiguous, hard to discover, and unsafe for plaintext command bodies.

### 3. Keep prompts as a controller over a pure editor session

The configure command loads one expected-byte config snapshot, builds a pure editor session, and loops over explicit scope, setting, and action choices. Prompt adapters return controlled `ok` or `cancelled` outcomes. Field parsing and immediate checks provide proportional feedback, but only canonical normalization/validation can accept the value. The controller retains other valid edits when one field retries.

Scope and ordinary setting views use sanitized projections. Inline command entry is normal visible text input. The final confirmation alone receives `serializeConfig(normalizedCandidate)` and may therefore show persisted bodies exactly. Active files are rendered from a separate sanitized plan.

**Alternative considered:** mutate the loaded config object in prompt callbacks. Rejected because cancellation, retry, exact preview, testing, and concurrency ownership become unclear.

### 4. Reuse repository editing and add a parallel workspace hook owner

Existing-repository copy, symlink, suggestions, lifecycle inline values, file plans, validation, and skip/keep-existing behavior call the #274 editor APIs. Configure extends repository descriptors for groups and base policy but does not fork copy/hook logic.

Workspace lifecycle hooks use the same inline normalization and script-plan shape, with workspace owner paths resolved through canonical lifecycle-hook runtime helpers. File-mode diagnostics are requested only when file mode or an existing native conflict makes them relevant. Inline-only hooks are not rejected for irrelevant destination-path conditions.

A lifecycle with a persistent active source that cannot be changed safely offers retry or skip/keep-existing. Skipping keeps both persisted and native state rather than silently clearing either.

**Alternative considered:** implement configure-local repository prompts. Rejected because it would immediately drift from #274 normalization, serialization, path topology, and retry contracts.

### 5. Serialize and validate the whole candidate before confirmation

After each field edit, canonical validation attributes recoverable failures to the field. Before confirmation the command normalizes the complete config, validates active-path metadata, freezes the active-file plan, and computes the exact serialized JSON once. The confirmation displays those bytes as text and a separate active-file list. No script contents are displayed.

If normalization changes accepted shorthand, ordering, or empty containers, the preview reflects the canonical result. The persisted bytes must be generated from the same normalized candidate and serializer, preventing preview/write drift.

If canonical serialized bytes still equal the original snapshot and no active file is planned, the controller reports no changes and exits before final mutation confirmation or persistence. Keep and skip therefore remain true no-op actions rather than rewrites.

**Alternative considered:** summarize selected changes. Rejected because the issue requires the preview to match persisted JSON, including plaintext inline commands.

### 6. Share the canonical workspace transaction lock and preserve newer bytes

Interactive configure reads the original config bytes through the configured-workspace snapshot boundary. Before mutation it acquires the same generalized workspace transaction lock used by `aw add` and compares current bytes to the snapshot. Add and configure therefore cannot concurrently own config/file publication under command-specific locks. A mismatch fails without overwrite. Under transaction ownership configure revalidates active paths, privately prepares and no-replace publishes planned files, then calls canonical config persistence at most once with the normalized candidate. Installation failure rolls back invocation-owned unchanged files and leaves config unchanged. If config persistence changes bytes and then reports failure, rollback restores the original config only while the current bytes still match transaction-owned output; otherwise it preserves the newer bytes. Script rollback likewise preserves concurrently changed files.

No prompt, retry, inspection, or final decline writes config or files. Existing active files are never overwritten. Rollback uses the existing identity/bytes/mode ownership ledger and preserves ambiguous or concurrently changed paths and referenced repository materialization.

**Alternative considered:** save config first and create files afterward. Rejected because a later file collision would expose a persisted source selection that has no active file and require a more invasive config rollback.

### 7. Make invocation policy explicit

Human editing requires both stdin and stdout TTYs. Non-TTY human invocation fails before prompting or mutation. `--json` is a separate sanitized inspection path: it returns one stable envelope of supported scopes and descriptors, configured/effective state, safe values, and lifecycle/interpreter presence. It never includes inline bodies, active-file contents, prompts, or mutation. No set/unset flags are added.

Both modes require a canonically loadable configured workspace. Missing configuration, invalid configuration, and implicit standalone context fail through the existing configured-workspace/config-validation diagnostics before prompt or inspection output, and configure never initializes or repairs configuration implicitly.

This makes stdout isolation and automation behavior simple. If future non-interactive mutation is desired, it requires a separately approved contract with explicit concurrency and secret-input semantics.

### 8. Verify at pure, command, transaction, PTY, and companion boundaries

Strict TDD will establish RED tests for descriptors/effective resolution, immutable keep/edit/clear, container pruning and unrelated-field preservation, shared repository adapter reuse, workspace hook planning, complete preview, JSON sanitization, non-TTY rejection, expected-byte failure, no-replace rollback, and real PTY journeys. Sabotage runs will prove new tests fail without configure behavior.

CLI contract generation and completion freshness will cover registration. Docs and skills add focused semantic checks to fail-closed registries, validate generated/extracted artifacts, and feed one coordinated meta checker through existing stable aggregates.

## Risks / Trade-offs

- **[Risk] Descriptor adapters duplicate runtime defaults or inheritance.** → Export/reuse owning constants and resolution helpers; test each effective source against runtime consumers.
- **[Risk] Generalization breaks add onboarding.** → Keep the add descriptor export and onboarding controller contract unchanged; run existing add PTY and transaction suites as regressions.
- **[Risk] Exact preview exposes executable text unexpectedly.** → State plaintext persistence before entry, restrict bodies to the visible input and final exact preview, and run derivative canaries over every ordinary/JSON/error boundary.
- **[Risk] Clear prunes an unrelated container.** → Use canonical path-specific immutable adapters and prune only containers proven empty after deleting the selected leaf; test sibling preservation.
- **[Risk] Long interactive matrices become brittle.** → Keep most permutations in pure/controller tests and retain representative raw-PTY journeys for each scope, sensitive input, retry, cancellation, and concurrency.
- **[Trade-off] Explicit descriptors omit some valid schema fields.** → Preserve them unchanged and document direct JSON editing as the fallback; expand only through future product-owned contracts.
- **[Trade-off] Non-TTY human mode fails instead of printing an inspection table.** → Use `--json` for deterministic inspection and avoid an ambiguous mode that might later gain mutation.
- **[Risk] A local writer races path validation/publication or final rollback unlink.** → Preserve #274 metadata checks, atomic no-replace publication, ownership ledger, and precise documented residual pure Node/Bun races without stronger claims.

## Migration Plan

1. Add and validate the OpenSpec change and acceptance evidence map.
2. Add pure/editor/command/transaction/PTY RED tests and CLI contract REDs.
3. Generalize descriptors and implement configure inspection/editor/transaction GREEN while retaining add regressions.
4. Regenerate CLI contracts and completions; run focused and full CLI gates.
5. Add docs and skills semantic REDs, update proportional owning guidance, regenerate exports/build the canonical skill package, and make child aggregates GREEN.
6. Add coordinated checker fixtures and run stable aggregates against exact child heads.
7. Deliver child PRs first, then update/archive the OpenSpec meta PR after children merge.

Rollback is a normal code rollback. The command introduces no schema migration; configurations written by it are canonical configurations already accepted by current runtime consumers. Successfully created active safe no-op files remain valid if the command is later reverted.

## Open Questions

None. The supported descriptor set and invocation policy above make issue #316 finite; future fields or non-interactive mutation require separate approval.
