## Context

Configured Arashi workspaces derive local child-repository and worktree directories from `.arashi/config.json`, but current ignore management is embedded in `init` and compares only `.gitignore` text. That misses effective rules from `.git/info/exclude` and `core.excludesFile`, dirties a project file by default, and does not protect collaborators who clone or pull an existing configuration and go directly to `pull`, `clone`, `add`, or `create`.

The change crosses configuration, Git process helpers, five mutating lifecycle commands, doctor diagnostics, JSON output, rollback behavior, docs, and skills. Git's ignore precedence and repository-common metadata must remain authoritative across the main checkout and linked worktrees. Personal scope preferences must stay clone-local and must not enter shared `.arashi/config.json`.

## Goals / Non-Goals

**Goals:**

- Provide one shared model for discovering, planning, and reconciling managed ignore rules.
- Default safe configured paths to repository-local excludes without duplicating existing tracked, local, or global rules.
- Keep tracked ignore updates available as an explicit opt-in and preserve an explicit non-mutating mode.
- Reconcile at every lifecycle boundary that can receive or materialize configured paths.
- Preserve path-safety, JSON stdout isolation, idempotency, and command rollback guarantees.
- Diagnose stale or missing ignore state without mutating during `doctor`.

**Non-Goals:**

- Implement the configless standalone workspace behavior tracked by #212.
- Create or modify a user's global `core.excludesFile` or system-level Git configuration.
- Ignore repository root, parent traversal, absolute paths, or other broad unsafe locations automatically.
- Store personal ignore-scope preferences in `.arashi/config.json`.
- Make every read-only Arashi command repair ignore state.

## Decisions

### Use a shared managed-ignore reconciliation service

Add a CLI-owned module that accepts the workspace root, normalized `reposDir`, normalized `worktreesDir`, requested or stored scope, output mode, and mutation/preview mode. It returns a structured plan containing each managed path, safety classification, effective source when already ignored, target ignore file when a write is needed, planned/applied rule, warnings, and changed state.

The service has separate inspect, plan, apply, and restore boundaries so commands can reuse discovery without mutating and can register undo data with their existing transaction/rollback mechanisms. This is preferred over command-specific helpers because `init`, `pull`, `clone`, `add`, `create`, and `doctor` must agree on path safety, precedence, and output.

### Ask Git for effective ignore state

Use `git check-ignore -v` (with machine-safe parsing such as `-z` where practical) against normalized workspace-relative probe paths. The result identifies whether a tracked ignore file, the common repository's `info/exclude`, or an existing global excludes file already provides the effective rule. Existing effective rules always win and suppress duplicate writes regardless of the selected scope.

Resolve the repository-local target through `git rev-parse --git-path info/exclude` from the workspace repository and normalize the returned path before reading or writing it. This follows Git's common-directory semantics for linked worktrees instead of assuming `<worktree>/.git/info/exclude` is a directory.

Alternatives considered:

- Parse `.gitignore` directly: rejected because it cannot represent Git's complete precedence and nested/global sources.
- Always append both tracked and local rules: rejected because duplicate rules obscure the effective source and create unnecessary tracked changes.

### Default to local scope and store only explicit non-default preferences

`local` is the built-in default for configured `init`, `pull`, `clone`, `add`, and `create`. Missing safe rules are written to the common repository's local exclude file. `tracked` writes missing rules to the workspace-root `.gitignore`, and `none` performs no ignore-file mutation while reporting unignored paths.

Expose `--ignore-scope <local|tracked|none>` on `init`. Scope precedence is explicit option, then valid stored preference, then built-in `local`. Persist explicit `tracked` or `none` selection in clone-local Git config under `arashi.ignoreScope`; selecting `local` removes the key so absence naturally means the default. Validate unknown stored or requested values before mutation. Existing effective rules remain authoritative even when the resolved scope differs.

On a new workspace, ordinary `init` has no stored preference and therefore uses `local`. On an existing workspace, `init --force` without an explicit scope preserves the valid stored preference. An invocation that supplies only `--ignore-scope` against an existing valid workspace acts as a preference-and-reconciliation operation without recreating config, hooks, or managed repositories; this lets `init --ignore-scope local` reset a prior preference safely without requiring `--force`. Other initialization changes retain the existing config-exists/`--force` contract.

This avoids putting personal preferences in shared config. A committed tracked rule naturally propagates without requiring the preference to propagate. A fresh clone with no local key safely defaults to local reconciliation.

### Normalize and classify managed paths before writing

Derive candidate rules from `reposDir` and `worktreesDir`, normalize separators and optional trailing slashes, deduplicate equivalent paths, and permit automatic writes only for repository-relative subdirectories. Repository root, empty/dot paths, absolute paths, and parent traversal are unsafe and produce structured skips rather than writes.

Preserve the current human-readable trailing-slash convention for directory rules. The same classifier governs tracked and local scopes so local storage cannot bypass safety checks.

### Track ownership conservatively

Writes use an identifiable Arashi-managed block in the selected target. Reconciliation may update or remove only entries inside that block; matching user-authored rules elsewhere remain authoritative and untouched. A managed entry is stale when it remains in an Arashi-owned block but no longer corresponds to a current safe configured path. Reconciliation removes stale owned entries from the active writable scope, while `doctor` reports stale entries without mutation. Selecting `none` freezes existing ignore content, including owned blocks, and reports stale entries rather than removing them.

This permits config-path changes and scope transitions to converge without guessing ownership of pre-existing ignore rules.

### Reconcile at mutation boundaries

- `init` resolves paths and scope, plans ignore changes, and applies them before creating managed directories. Its existing dry-run and operation log include local Git config and ignore-file changes.
- `pull` reconciles current config before selected repository operations. The parent follows ordinary `--only`/`--group` selection; it is processed first only when selected. If its pull succeeds, Arashi reloads config, reapplies the original filters to the post-pull repository set, reconciles resulting paths, and then processes selected children. An unfiltered run uses all post-pull configured children. A filtered name/group that no longer resolves after reload becomes a structured usage failure before remaining child pulls; newly configured missing children are skipped with clone guidance rather than implicitly cloned. If the parent is not selected or its pull fails and rolls back, remaining selection continues from the pre-pull snapshot.
- `clone` reconciles before creating a configured repository path.
- `add` reconciles before cloning a newly configured repository into `reposDir` and includes config plus ignore mutations in its rollback boundary.
- `create` reconciles before creating any parent or child worktree.
- `doctor` runs inspection only and emits stable findings for unignored safe paths, stale Arashi-owned entries, invalid stored scope, or unsafe configured paths.

A stored `none` preference is explicit: mutating commands proceed without writing ignore files but emit structured warnings for unignored safe paths. Unsafe configured paths are skipped because they do not represent safe in-repository ignore candidates.

### Align rollback with each command's transaction boundary

Applying reconciliation returns original file content and original local-config state. Rollback is based on final surviving state, not merely exit status:

- `init` and `create` restore reconciliation only when their corresponding config/directories/worktrees are fully rolled back.
- `clone` and `add` retain reconciliation when any successful repository clone is retained; if no target materializes and the operation restores its pre-command config and filesystem state, they restore ignore/preference changes.
- `pull` retains reconciliation required by the final checked-out parent configuration. If the parent pull rolls back and no surviving state needs the new rules, it restores the prior ignore state.
- A rollback failure retains the safest effective rule and reports both the original failure and restoration failure.

Human and JSON results distinguish `attempted`, final `changed`, and `restored` state. This is safer than unconditional rollback after any non-zero exit, which could expose retained repositories or worktrees as untracked.

### Extend existing JSON envelopes rather than create a new output channel

JSON-capable commands add a `managedIgnore` object to command data or error details. It includes effective scope, stored preference when present, per-path source/status, planned/applied changes, warnings, unsafe skips, and whether tracked or local files changed. Human progress is suppressed in JSON mode and stdout remains one envelope.

Doctor uses stable finding codes and the existing diagnostics envelope rather than a separate reconciliation payload.

### Keep docs and skills aligned with command ownership

Update Getting Started and command pages for `init`, `pull`, `clone`, `add`, and `create`; generated Markdown and LLM exports inherit those source updates. Update packaged Arashi skill guidance so agents expect clone-local reconciliation, avoid manually editing global Git config, and understand when `tracked` or `none` is intentional.

## Risks / Trade-offs

- **Git ignore parsing differs across platforms or path styles** → Use Git porcelain output, normalized relative probe paths, NUL-safe parsing where available, and Windows integration fixtures.
- **`pull` changes config midway through execution** → Pull parent first, reload config, reconcile again, and rebuild child targets from the post-pull config.
- **Tracked opt-in can dirty the workspace during later commands** → Require an explicit stored `tracked` preference, report the changed file prominently, and never select tracked on a fresh clone by default.
- **Rollback could remove a rule still needed by surviving filesystem state** → Restore only when the owning command restores the corresponding config/materialized paths; otherwise retain state consistent with disk.
- **Global ignore rules can be hard to identify portably** → Treat Git's effective match as authoritative and surface source details when available without ever rewriting global config.
- **Local Git config is shared by linked worktrees** → This is intentional: ignore scope applies to the repository's common managed paths and should remain consistent across its worktrees.
- **`none` permits visible untracked generated content** → Require explicit selection, persist it locally, and emit warnings in human and JSON output.

## Migration Plan

1. Introduce the shared inspect/plan/apply/restore module with focused Git fixtures and no command integration.
2. Change `init` to local-default scope handling and persist explicit non-default preferences; retain tracked behavior behind the option.
3. Integrate reconciliation into `clone`, `add`, and `create`, then restructure `pull` for selected-parent-first reload and reconciliation.
4. Add doctor findings and structured JSON fields.
5. Update docs, generated exports, and skills; validate cross-repository command/docs contracts.
6. Existing tracked `.gitignore` rules remain valid and are discovered without duplication. Existing workspaces require no migration command; the next lifecycle command reconciles missing local state.

Rollback is repository-by-repository: revert command integration while leaving existing tracked or local rules harmlessly valid. No destructive config migration is required.

## Open Questions

None. The issue decisions establish local as the default, tracked as explicit opt-in, `none` as explicit non-mutation, and global configuration as read-only.
