## Context

Issue #312 extends the shared repository base policy introduced for configured create and clone. Today, persisted base configuration is not supplied to the shared status path used by status, handoff, and doctor; pull follows the current branch upstream; and push's no-upstream uniqueness check falls back to the remote default. The system also still accepts `defaults.create.baseBranch` as compatibility input.

Three Git relationships must remain separate:

1. **Upstream**: the remote-tracking branch for publishing and synchronizing the current branch.
2. **Configured base**: the long-running branch from which work is based and whose changes should be incorporated.
3. **Remote default**: the host-selected default branch, retained as an independent health signal.

The change crosses CLI configuration, Git refresh/comparison helpers, shared status records and consumers, JSON contracts, documentation, packaged skill guidance, and meta-repository semantic validation. It must preserve parent-first pull, post-parent configuration reload, repository filters, managed-ignore reconciliation, timeout/partial-failure behavior, and standalone semantics.

## Goals / Non-Goals

**Goals:**

- Establish repository override then root as the only persisted configured-base precedence for every configured base-aware command.
- Preserve upstream, configured-base, and remote-default roles independently in behavior and structured output.
- Reuse refreshed comparison targets and avoid duplicate fetches, calculations, and human diagnostics when base and default identify the same remote ref.
- Fail explicitly when a configured base cannot be refreshed or resolved; never silently substitute an upstream or remote default.
- Remove `defaults.create.baseBranch` completely and reject it at the configuration-validation boundary with actionable migration guidance.
- Keep docs, generated contracts, packaged skills, and semantic checkers aligned.

**Non-Goals:**

- Changing push's destination or upstream setup semantics.
- Making `sync` align repositories to configured bases; it remains coordinated-current-branch alignment.
- Adding base-aware behavior to `list`, `switch`, `move`, `remove`, `prune`, `setup`, or `exec`.
- Changing standalone behavior or adding persisted base policy to standalone workspaces.
- Resetting, rebasing, or ancestry-validating existing create/clone target branches.
- Changing `defaults.create` launch, switch, editor, terminal, or tab-disposition settings.

## Decisions

### 1. Separate persisted configured-base resolution from create/clone invocation overrides

A shared resolver will expose an optional configured base for each configured repository using exactly:

1. `meta.baseBranch` or `repos.<name>.baseBranch` for the owning repository;
2. root `baseBranch`;
3. absent.

Status, pull, push fallback, handoff, and doctor consume this persisted result. Create and clone continue layering repository-specific CLI and invocation-wide CLI overrides above it. No resolver reads `defaults.create.baseBranch`, and source enums no longer expose a legacy source.

This avoids leaking create-only CLI concepts into diagnostics while keeping one canonical persisted policy. The alternative—teaching each command its own precedence—would invite drift and inconsistent failure behavior.

### 2. Reject the removed legacy property during semantic configuration validation

The configuration shape and generated schema will no longer define `defaults.create.baseBranch`. Because generic schema errors may not explain migration, semantic validation will detect that exact unsupported path and report that it must move to root `baseBranch`, or to `meta.baseBranch` / `repos.<name>.baseBranch` when repository-specific behavior is intended. Rejection occurs before repository discovery, hook discovery/execution, managed-ignore work, fetches, or Git mutation.

The existing deprecation diagnostic, compatibility normalization, legacy source value, and root-versus-legacy conflict branch are deleted. `defaults.create` itself remains valid for non-base settings. Continuing a warning period was rejected because the approved scope explicitly completes the migration and because permitting the key would keep divergent command semantics alive.

### 3. Represent comparison roles independently and share target work by identity

Shared repository status will retain upstream state and add role-specific configured-base and remote-default comparisons. Each comparison records its role, logical branch, selected remote/ref, ahead/behind counts when available, state, and unavailable reason/details when comparison was requested but could not complete.

Network and Git comparison work will be keyed by normalized target identity (selected remote plus canonical remote ref). If configured base and remote default resolve to the same identity, the command fetches and compares once, then projects the result into both structured role records. Human status, handoff, and doctor output may emit one combined `Base/default` line or finding, but JSON retains both roles and marks their shared target relationship.

This preserves semantic clarity for automation without duplicate network work or noisy diagnostics. Collapsing the JSON objects was rejected because consumers could no longer tell whether a target was configured policy, remote metadata, or both.

### 4. Treat configured-base unavailability as explicit state, not fallback

When a configured base exists but its selected remote branch cannot be resolved, refreshed, or compared, status remains locally useful and reports an explicit per-repository warning/unavailable record. It does not substitute the remote default. Detached HEAD also preserves local status and produces a non-misleading configured-base unavailable/skipped reason rather than claiming branch lag.

Pull and no-upstream push comparison are stricter because their decisions can mutate or publish: a missing/unrefreshable configured base produces a per-repository failure/manual-action result, and neither command falls back to upstream or default. Independent repositories continue under existing partial-failure rules.

### 5. Pull configured bases, otherwise preserve the existing upstream path

For each selected configured repository, pull resolves the effective configured base after the current configuration load. If present, it uses the command's established selected-remote policy, refreshes the remote base ref, compares `HEAD`, and when behind invokes the existing rollback-protected `git pull --no-rebase <remote> <baseBranch>` merge path. Being checked out on the base is not a special bypass: it updates that branch normally. A missing remote base is a named failure with no upstream fallback.

If no configured base exists, the current upstream/current-branch behavior remains byte-for-byte in intent. Parent-first processing and post-parent configuration reload mean child effective bases and selection are recomputed from the reloaded configuration. Existing group/repository filters, ignore reconciliation, timeout, JSON, rollback-on-conflict, and partial-failure boundaries remain intact.

A rebase design was rejected because pull already promises merge/rollback semantics. Fetching all bases up front was rejected because it would violate parent-first configuration reload and selected-set boundaries.

### 6. Limit push's configured-base use to no-upstream publishability

When the current branch has a usable upstream, push keeps the existing divergence check and destination. When it lacks an upstream and has a configured base, push refreshes that base and uses `HEAD` versus the base to determine whether branch-unique commits exist. If no configured base exists, the current remote-default fallback remains. Publishing a no-upstream branch still requires `--set-upstream`; configured base never becomes a destination.

This prevents base-only commits from manufacturing coordinated remote branches while preserving existing publication policy. Automatically pushing to the configured base was rejected as destructive and semantically incorrect.

### 7. Keep handoff and doctor as consumers of the shared status model

Handoff Markdown and JSON include configured-base branch, lag, and unavailable state. Doctor emits stable configured-base lag and unavailable finding codes with the actual remote base ref and practical status/pull guidance. Default findings remain when their target differs. Same-target results generate one human diagnostic (or an explicitly combined finding) while structured details preserve both roles.

This keeps command-specific formatting and guidance at the consumer layer while centralizing refresh/comparison truth.

### 8. Update all durable and generated contract surfaces together

CLI types, normalization, schema, JSON records, command docs, canonical/generated docs, packaged skills, and meta semantic contracts change in one coordinated delivery. Semantic fixtures will include root/meta/child precedence, same-target de-duplication, unavailable targets, and legacy-key rejection. Historical archived OpenSpec changes remain historical unless a checker needs an explicit supersession fixture.

## Risks / Trade-offs

- **[More remote work in status]** → Use targeted refreshes, selected repository filters, and target-identity caching; same base/default refs fetch once.
- **[Shared status shape can break consumers]** → Add role-specific fields without conflating or removing upstream/default meaning, update handoff/doctor together, and lock JSON with contract tests.
- **[Legacy rejection surprises users]** → Return exact-path migration guidance before side effects and update every current documentation/skill surface.
- **[Remote selection ambiguity]** → Reuse each command's established selected-remote policy and always report the concrete remote/ref used.
- **[Conflict or partial pull failure]** → Retain existing rollback protection, per-repository outcomes, timeout, and partial-failure behavior.
- **[Base/default de-duplication hides a role]** → De-duplicate only work and human diagnostics; preserve both role records in structured output.
- **[Parent pull changes configuration]** → Preserve parent-first execution and reload configuration before resolving child bases or filters.

## Migration Plan

1. Add fail-fast unsupported-key validation and remove the legacy property, normalization path, diagnostic, source enum, and schema/contract entries.
2. Extend the shared configured-base resolver and status/comparison model with role-aware target caching.
3. Integrate status, pull, push fallback, handoff, and doctor, preserving existing no-config and standalone paths.
4. Update human/JSON formatters and tests, including failure, fallback, detached, missing repository, same-target, filter, rollback, and config-reload cases.
5. Update canonical docs, generated exports/contracts, packaged skills, and cross-repository semantic checks.
6. Validate each child repository and then run the meta-repository coordinated checks.

Rollback requires reverting the coordinated CLI/docs/skills/meta changes together. Configuration already migrated to canonical `baseBranch` remains valid after rollback; no repository history or persisted data migration is performed.

## Open Questions

None. The issue fixes precedence, command scope, failure behavior, de-duplication, legacy removal, and standalone non-goals.