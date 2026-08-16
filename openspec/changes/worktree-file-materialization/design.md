## Context

Configured create currently loads repository entries into `WorkspaceRepository`, preflights branch/worktree and lifecycle-hook behavior, then orchestrates each selected repository in `src/core/worktree.ts`. A repository worktree is created before its `pre-create` hook, and `post-create` follows immediately. Results and rollback are coordinated at that same core boundary; `src/commands/create.ts` adapts them to human and JSON output. Configuration normalization/persistence lives in `src/lib/config.ts`, with schema generation from the typed contract. `arashi doctor` composes non-mutating checks through `src/lib/doctor.ts` and command orchestration.

The configured path, active coordinated worktree, and canonical Git primary checkout are intentionally distinct. `executionRoot + repos.<name>.path` identifies the active repository worktree used to create the next coordinated worktree, but neither it nor `configurationRoot + repos.<name>.path` is guaranteed to be the canonical source when configuration is loaded from a linked non-bare worktree. For each configured child, Arashi must resolve the repository's primary non-bare checkout from Git worktree metadata (the main/first worktree from `git worktree list --porcelain`) and carry that explicit source identity alongside the active execution path. A bare repository with no usable non-bare primary checkout cannot supply configured materialization sources.

The configured paths may identify secrets and shared state. The implementation must never read content for diagnostics/output, must not invoke shell copy/link commands, and must be safe on native macOS, Linux, and Windows.

## Goals / Non-Goals

**Goals:**

- Add optional direct `copy` and `symlink` arrays to configured child repository entries.
- Resolve source paths from the canonical configured checkout and destinations from each newly created worktree.
- Validate the complete configured path set before create mutation.
- Materialize deterministically after repository `pre-create` and before repository `post-create`, independent of `--no-hooks`.
- Make dry-run, human/JSON output, partial failure, rollback, removal, and doctor behavior deterministic and safe.
- Reuse one resolver and typed outcome vocabulary across runtime, dry-run, doctor, docs, skills, and contract checks.

**Non-Goals:**

- Source/destination remapping, globs, conditions, interpolation, required entries, per-entry modes, external sources, or standalone/configless configuration.
- Hard links, Windows junctions, or fallback between materialization actions.
- Sharing `node_modules` as a recommended normal workflow.
- Reading, hashing, comparing, or displaying configured file contents.
- Changing existing hook source, timeout, input, or output-ledger semantics beyond the new ordering boundary.

## Decisions

### 1. Keep the public configuration small and the internal plan explicit

`RepoConfig` gains optional `copy?: string[]` and `symlink?: string[]`. Normalization preserves declared array order and persists only present fields. The configured repository projection gains normalized materialization policy plus an explicit canonical source checkout path resolved from that repository's Git worktree metadata; it does not infer the source from the configuration root, execution root, or caller's active linked worktree. Resolution must cover ordinary non-bare linked worktrees and configured bare-root layouts and must fail actionably when Git exposes no usable non-bare primary checkout.

Internally, create and doctor consume a shared typed plan containing repository identity, action, original relative path, normalized relative path, absolute source, absolute destination, source kind when known, and preflight status. Public output projects only repository identity, action, relative path, status, and bounded diagnostics.

Alternatives rejected: a nested `worktree` object or per-entry `{source,destination,mode}` objects would overstate first-slice flexibility; hook-only implementation would prevent shared validation, dry-run, doctor, and rollback contracts.

### 2. Use a platform-neutral relative-path grammar and pre-mutation set validation

A configured entry must be a non-empty string. Both `/` and `\` are treated as separators for validation so Windows absolute, UNC, drive-relative/absolute, traversal, and separator-equivalent collisions cannot pass on another host. Empty segments and `.` segments may be normalized away, but any `..`, root/drive/UNC prefix, NUL, normalized empty result, colon/NTFS alternate-stream syntax, component ending in dot or space, or case-insensitive Windows reserved device component (`CON`, `PRN`, `AUX`, `NUL`, `COM1`–`COM9`, or `LPT1`–`LPT9`, with or without an extension) is rejected. Collision keys normalize separators and dot segments, normalize Unicode to NFC, and case-fold so case-only aliases cannot appear within or across actions even when authored on a case-sensitive host.

The shared resolver joins only validated normalized segments beneath canonical source and destination roots. It then walks existing destination ancestors with `lstat`; any symlink, junction/reparse-point equivalent, or non-directory ancestor blocks materialization. Real/canonical root checks remain a second defense rather than replacing lexical validation.

Alternatives rejected: host-only `path.isAbsolute` leaves cross-platform configurations unsafe; checking only final `resolve().startsWith(root)` misses existing symlink ancestors and path-prefix ambiguity.

### 3. Separate configuration validation, create preflight, and execution

Pure configuration normalization rejects types, unsafe paths, duplicates, and cross-array collisions. The command layer performs complete configured materialization preflight before managed-ignore reconciliation or any other create mutation, then passes the immutable plan into core orchestration before workspace `pre-create` or Git mutation. Preflight resolves every selected repository's Git-primary canonical source checkout and deterministic destination paths. It also uses the immutable planned target OID to inspect each target Git tree for configured destinations or incompatible ancestors that `git worktree add` would create. Missing sources become planned `skipped` outcomes; discoverable filesystem or target-tree destinations, unsafe ancestors, unusable canonical source checkouts, and determinably unsupported symlink capability become blocking planned failures. Operational filesystem errors are not relabeled as missing sources. A blocking plan leaves managed-ignore files/preferences and every later create surface unchanged.

Preflight is refreshed immediately before each repository materialization after Git and `pre-create`, because hooks or concurrent processes may alter sources or destinations. A newly missing source may skip; a newly introduced destination/safety/capability conflict fails without overwrite.

Dry-run performs the non-mutating preflight and emits the ordered plan. It does not create parent directories, probe capability by creating test links, execute hooks, or mutate Git.

Alternatives rejected: delaying all checks until after worktree creation weakens fail-before-mutation guarantees; treating every `lstat` failure as absence hides permission and I/O failures.

### 4. Materialize between repository hook boundaries

For each selected configured repository, existing Git worktree creation remains first. Existing repository `pre-create` then runs when hooks are enabled. Arashi next processes all `copy` entries in declaration order and all `symlink` entries in declaration order. Existing repository `post-create` runs only after materialization completes. `--no-hooks` skips hook discovery/execution but not materialization.

A materialization failure fails that repository and enters the existing coordinated create rollback path. A later repository or workspace `post-create` failure also rolls back invocation-owned materialized entries as part of removing the failed worktree. Workspace `post-create` remains after all repository work succeeds.

Alternatives rejected: materializing before repository `pre-create` changes that hook's compatibility boundary; materializing after `post-create` prevents hooks from relying on declared files.

### 5. Use native, ledgered, no-overwrite filesystem operations

A dedicated materializer uses `fs/promises` APIs only. Missing parent directories are created component-by-component and recorded. Destination objects are created with exclusive/no-overwrite primitives. Directory copies use a controlled recursive walker rather than an opaque recursive delete rollback: each created directory, file, and link object is ledgered, and rollback removes ledger entries in reverse order without following links. Parent directories are removed only when created by this invocation and empty.

`copy` produces independent destination state. Source symbolic links encountered at the configured path or inside a copied directory are dereferenced only when their resolved targets remain inside the canonical source checkout. The walker tracks canonical directory identities on the active recursion stack; a self-link or link to an ancestor fails as `source_cycle` before unbounded recursion. Broken, cyclic, or escaping source links fail safely rather than copying a misdirected link object or importing an external source. File copies use exclusive creation and preserve ordinary file bytes without emitting them. Directory traversal order is deterministic.

`symlink` creates one native symbolic link whose target is the absolute canonical source path. The source must resolve to an existing file or directory at execution time. Windows passes the matching `file` or `dir` type and never requests `junction`; privilege, developer-mode, filesystem, or policy failure is actionable and has no copy fallback.

Alternatives rejected: shelling out to `cp`, `ln`, or `mklink` creates quoting/platform risk; recursive `fs.cp` plus recursive cleanup cannot prove object-level ownership; rename-based staging can overwrite an intervening destination on platforms without a no-replace rename.

### 6. Treat outcomes as a repository-local ordered ledger

Each selected configured repository result carries `materializationOutcomes` in exact copy-then-symlink declaration order. Public executed records contain `action: "copy" | "symlink"`, normalized repository-relative `path`, `status: "copied" | "linked" | "skipped" | "failed" | "rolled-back"`, and the closed reason vocabulary specified by the machine-output delta. A missing source is `skipped`; successful objects become `rolled-back` if rollback removes them. Failure records include a stable reason code and bounded message/details without file contents. Dry-run uses a distinct `data.dryRunOutcome.materializationPlans` projection and `would-copy | would-link | skipped | blocked` statuses rather than falsely claiming execution.

Human output is derived from this ledger. JSON success places outcomes under each repository result; structured execution failures preserve partial repository results and the same ledgers plus a materialization-specific rollback summary under error details. Actionable dry-run uses `data.dryRunOutcome.materializationPlans`; materialization-blocked dry-run is a nonzero `MATERIALIZATION_PLAN_BLOCKED` error with plans at `error.details.dryRunOutcome.materializationPlans`. Existing command-wide rollback details remain separate for branch/worktree/directory cleanup. Stdout remains one document in JSON mode.

Alternatives rejected: separate human and JSON bookkeeping invites drift; command-global flattening loses repository ordering and partial-success context.

### 7. Extend doctor through the same resolver without mutation

Configured doctor validates normalized policy, Git-primary canonical source-checkout availability, source existence, destination ancestor containment, existing destination shape in managed worktrees, and current managed links. For `copy`, doctor may classify only missing destination, unsafe ancestor, and source/destination kind mismatch; a present compatible-kind copy has unknown ownership/freshness because no persistent ledger or content comparison exists and is not called a conflict. For `symlink`, a healthy destination must point exactly to the canonical configured source path and resolve to the expected source kind; broken or misdirected links receive stable findings. Platform capability is determined from non-mutating evidence where possible; when native capability cannot be proven without mutation, doctor reports an explicit informational/unknown result rather than creating a probe link or a false blocking success/failure.

Doctor never traverses file contents, hashes secrets, executes hooks, creates directories/links, or repairs a finding. Standalone mode remains unchanged because no persisted materialization policy exists there.

Alternatives rejected: a temporary symlink probe violates doctor non-mutation; independent doctor path logic would drift from create safety.

### 8. Keep removal link-safe through worktree-root ownership

Normal coordinated removal continues removing the selected worktree root and branch under its established contract. Materialization adds no mutation to the canonical source checkout. During a partial materialization failure, the object ledger first removes only objects it created and preserves every object that predated its exclusive top-level destination creation. Once the overall create command rolls back a newly created worktree, that entire worktree is invocation-owned under the existing Git rollback contract; objects concurrently introduced inside it are not promised preservation. Removal and create rollback must use link-object-safe filesystem/Git behavior: they remove the destination link or owned worktree tree without following a symlink target. Focused native tests assert that canonical source files/directories survive both rollback and ordinary worktree removal.

No persistent materialization ledger is required after successful create because the whole worktree is the removal ownership boundary; invocation-time rollback retains its in-memory object ledger for partial materialization.

### 9. Deliver companions through stable aggregate validation

CLI schema/types/runtime/tests land in the CLI child PR. Website guidance and generated exports land in the docs child PR. Authored and extracted-package guidance/checks land in the skills child PR. Each repository registers focused semantic checks in its existing fail-closed aggregate; authoritative workflows are unchanged unless actual topology/trigger/runtime requirements change. The meta checker compares normalized schema semantics and companion guidance through the stable docs, skills source/package, and meta aggregates.

Guidance recommends `copy` for independently mutable local configuration/secrets, `symlink` only for intentionally shared state, and package-manager stores plus per-worktree installs instead of shared `node_modules`.

## Risks / Trade-offs

- **[Cross-platform path spellings collide differently]** → Validate both separator families and Windows root forms on every host; add platform-neutral unit fixtures plus native Windows acceptance.
- **[Symlink capability differs by Windows policy and filesystem]** → Use native file/dir links, no junction/copy fallback, actionable errors, injected classification tests, and real Windows CI.
- **[TOCTOU between preflight and execution]** → Refresh source/destination/ancestor checks immediately before exclusive mutation and treat conflicts as failures without overwrite.
- **[Partial recursive copy leaves state]** → Record every created object and reverse only the invocation ledger; never follow links during cleanup.
- **[Source trees contain links outside the checkout]** → Resolve and contain every dereferenced source link; reject broken or escaping links.
- **[Paths themselves may reveal sensitive naming]** → Output only configured relative paths and bounded statuses; never content, hashes, snippets, or environment values.
- **[Large copies increase create time]** → Keep operations sequential/deterministic for the first slice and document hooks as the escape hatch for specialized behavior; do not add concurrency before ownership semantics are proven.
- **[Companion checker growth duplicates CI]** → Register focused checks under existing stable aggregates and avoid feature-specific workflow steps.

## Migration Plan

1. Add strict RED tests for config normalization/schema/persistence, Git-primary source-root projection, pre-managed-ignore planning, lifecycle ordering, exact planner/outcome schemas, materializer safety/rollback/cycles, doctor, JSON isolation, native platforms, and companion semantics; wire the native materialization acceptance suite into macOS, Linux, and Windows CI before production GREEN work.
2. Implement the shared path policy/resolver and typed outcome model, then configuration projection and schema generation.
3. Implement ledgered materialization and wire it into configured create at the established hook boundary.
4. Add create human/JSON/dry-run/partial-failure projection, doctor diagnostics, and removal/rollback native safety acceptance.
5. Deliver docs, generated exports, skills package guidance, and registered cross-repository checks in separate child PRs.
6. Merge green child PRs, archive/sync this change, and merge the meta PR last.

The change is additive. Rolling back the release means removing the optional fields/runtime support; existing configurations without the fields remain unchanged. Users who adopt the fields must remove them before downgrading to a version whose strict schema does not recognize them.

## Open Questions

None. The first slice intentionally resolves copy-of-source-symlink behavior as contained dereferencing and treats unknown non-mutating doctor capability evidence conservatively rather than adding probe mutations.
