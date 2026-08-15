## Context

Configured create currently discovers the parent and child repositories, resolves launch defaults, applies filters, reconciles managed ignore state, and then delegates branch/worktree creation to `createCoordinatedWorktrees`. The parent repository is synthesized with its current branch as `defaultBranch`; each child gets its detected Git default branch. `processRepository` resolves that value local-first and `origin`-second immediately before creating each branch. This means resolution can fail after workspace hooks or earlier repositories have already mutated, and the current fallback to the first local ref is appropriate only for legacy detected-default recovery—not for an explicit user-selected base.

Create defaults are currently shared between generic and editor-scoped launch/switch configuration. A base branch is workspace topology rather than editor behavior, so exposing it through the shared editor-default type would create an unintended host-specific base API.

Implicit standalone create bypasses workspace configuration and creates a new branch from Git's current start point unless it reuses a local or remote target branch. The explicit CLI option must remain useful there without introducing persisted standalone state.

## Goals / Non-Goals

**Goals:**

- Resolve one logical base branch name across the effective selected repository set.
- Support generic configured `defaults.create.baseBranch` and explicit `--base`, with CLI precedence.
- Fail before hooks, managed-ignore reconciliation, branch creation, or worktree creation if any selected new target branch cannot use the requested base.
- Preserve local-first, then `origin/<branch>` resolution and report the exact resolved ref per repository.
- Preserve existing target-branch reuse and current behavior when no base is requested.
- Support explicit `--base` in configured and implicit standalone create.
- Keep human, dry-run, JSON, schema, completion, generated-contract, docs, and skill surfaces synchronized.

**Non-Goals:**

- Per-repository or editor-scoped base-branch configuration.
- Arbitrary commit, tag, or remote selection; this slice accepts a logical branch name and the existing `origin` remote only.
- Fetching remote refs automatically, changing remote default branches, or making status/pull treat the configured create base as the repository default branch.
- Rebasing, resetting, or otherwise rewriting an existing target branch selected through `REUSE_EXISTING`.
- Persisting defaults in implicit standalone mode.

## Decisions

### 1. Keep the configured base generic and separate from editor defaults

Add optional `baseBranch` only to generic `defaults.create`. Split the shared configuration type/schema shape so editor-scoped create defaults remain launch/switch-only. This prevents invocation host from changing branch ancestry and avoids silently expanding the issue into editor-specific topology configuration.

Alternative: allow `defaults.editors.<host>.create.baseBranch`. Rejected because branch ancestry is not presentation context and would make the same command vary structurally by host.

### 2. Resolve one invocation-level request before orchestration

The command layer resolves `requestedBaseBranch` as:

1. explicit `options.base`;
2. generic `config.defaults.create.baseBranch` in configured mode;
3. absent.

Editor-scoped default lookup remains responsible only for launch/switch. The command validates the logical branch syntax and passes the request separately from launch defaults into create orchestration. Implicit standalone uses only explicit `options.base`.

Alternative: add the field to `ResolvedCreateDefaults`. Rejected because that object models post-create launch/switch behavior and is host-scoped; mixing ancestry into it risks applying editor defaults.

### 3. Preflight selected repositories with a strict resolver

After effective filtering/interactive selection and before managed-ignore reconciliation, conflict handling, create-hook preflight, or create hooks, run a read-only preflight for every selected repository. Normalize one leading `origin/` from the logical request, verify branch syntax, then resolve in order:

1. `refs/heads/<branch>`;
2. `refs/remotes/origin/<branch>`.

Collect all missing-base failures and return them together. A divergent local and origin ref is deterministic rather than ambiguous because local wins; other remotes are outside the candidate set. Do not use the legacy first-local-ref or detected-default fallback for an explicit/configured request. Resolve each selected ref to a commit OID during preflight, key the immutable plan by canonical repository path, report the selected full ref, and create new target branches from the captured OID so a moving symbolic ref cannot change ancestry between planning and sequential execution.

Every selected repository must resolve the requested base even when its target branch will later be reused. Existing target branches remain authoritative when the selected conflict strategy reuses them: their ancestry is not checked or changed, and result data identifies them as reused without claiming they were created from the requested base.

Alternative: resolve inside `processRepository`. Rejected because later repositories could fail after hooks or earlier mutations, violating fail-before-mutation acceptance.

### 4. Represent base resolution in operation results

Add an optional `base` object to create results. `requestedBranch` is the normalized logical branch after removing at most one leading `origin/`; the literal prefixed spelling is not retained. `source` is exactly `cli` or `config`. Its `repositories` array follows the effective selected-set order and contains `repositoryName`, the existing canonical absolute `repositoryPath`, `resolvedRef`, `resolvedOid`, and `targetAction` (`created` or `reused`). Every selected repository reports its resolution; a reused target does not claim derivation from that ref. Human dry-run lists each planned start point. Normal human success may remain concise but errors enumerate every selected repository and attempted refs. Omit `base` entirely when no base was requested so legacy result shapes remain compatible.

Base preflight failures use stable code `CREATE_BASE_RESOLUTION_FAILED`. Error details use the same normalized `requestedBranch` and exact `source` vocabulary. `repositories` contains only affected repositories in effective selected-set order; each entry uses the canonical absolute path and `attemptedRefs` exactly equal to `["refs/heads/<normalized-branch>", "refs/remotes/origin/<normalized-branch>"]` in that order. JSON stdout remains exactly one envelope.

### 5. Preserve legacy behavior through an absent-plan path

When neither CLI nor config provides a base, no strict preflight plan is built. Configured orchestration retains current per-repository detected-default behavior, including its existing fallback rules. Standalone retains its current no-base start-point behavior. This makes omission byte-for-byte compatible at the public contract level and limits migration risk.

### 6. Generate and enforce all public contracts from owning sources

The CLI type remains the schema source. Commander remains the option/completion/command-contract source, supplemented with typed semantic policy for precedence, persistence, standalone support, and pre-mutation failure. Canonical docs and packaged skill guidance consume those contracts, while the meta checker compares normalized base semantics and includes a deliberate mismatch fixture.

## Risks / Trade-offs

- **A selected repository has a stale remote-tracking namespace** → Fail with attempted refs and advise users to fetch/pull; do not perform hidden network mutation during create.
- **A base ref moves or disappears after preflight** → Execution creates from the captured commit OID, preserving the validated ancestry; Git failures from object loss still enter existing ownership-aware rollback.
- **A target branch already exists with unexpected ancestry** → Require the requested base to resolve for selected-set consistency, but preserve `REUSE_EXISTING` semantics and report reuse rather than rewriting or asserting the target's ancestry; apply the captured OID only when creating a target.
- **Shared config types accidentally expose editor-scoped base fields** → Split generic/editor create-default types and add schema negative tests.
- **Preflight runs before interactive selection** → Place it after final selection so unselected repositories cannot block create, but before hooks and every mutation.
- **Dry-run previously deferred some failures** → Treat explicit/configured missing bases as deterministic preflight errors even in dry-run; a preview must not claim an impossible plan.
- **Companion repositories drift during staged delivery** → Update and validate the CLI contract producer first, then docs/skills, then the meta checker; keep child PRs cross-linked and merge them before the meta archive PR.

## Migration Plan

1. Add failing CLI config/schema/option, real-Git resolver, preflight-order, standalone, dry-run, JSON, and reuse tests.
2. Implement configuration and CLI parsing, strict resolution plans, orchestration plumbing, and structured output; regenerate completions/schema/command contracts.
3. Update canonical docs and regenerate agent-readable exports.
4. Update packaged skill guidance and its semantic contract.
5. Update meta cross-repository validation with controlled-drift fixtures.
6. Release as an additive feature. Existing configs require no migration.

Rollback removes the optional field/flag and companion guidance. Configs containing `baseBranch` would then fail validation rather than being silently ignored, so rollback release notes must tell users to remove the field.

## Open Questions

None. The issue's requested global configuration and invocation flag are fully specified without adding per-repository/editor variants.
