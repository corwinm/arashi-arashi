## Context

The shipped create-base feature stores one branch at `defaults.create.baseBranch` and builds one strict local-first/origin-second resolution plan for all selected repositories. That model cannot represent a meta repository and children with different integration branches. Clone currently follows each remote's default branch for ordinary clones and, inside coordinated worktrees, adds an existing child worktree on the current coordinated branch when a canonical source checkout is available.

Base ancestry is repository topology, not create presentation. The canonical configuration therefore needs one shared policy consumed by create and clone, with ownership-local overrides. The implementation must preserve omitted-policy behavior, standalone create, existing target branches, clone URL/protocol handling, fail-before-mutation guarantees, and exact JSON isolation.

## Goals / Non-Goals

**Goals:**

- Define a concise root workspace default plus explicit meta and configured-child overrides.
- Reuse one typed resolver for create and clone precedence, validation, selectors, normalized branches, and source reporting.
- Keep `--base` as the invocation-wide option and add one repeatable repository-specific option.
- Apply clone bases without leaving a missing child on the base when it belongs to an active coordinated target branch.
- Preserve strict create planning with immutable resolved OIDs and aggregate clone preflight before managed-ignore/filesystem mutation.
- Provide safe compatibility for the old create-only setting.

**Non-Goals:**

- Changing Git remotes, supporting tags/commit expressions, fetching arbitrary remotes, or adding remote-name configuration.
- Persisting base policy in implicit standalone mode.
- Rewriting, rebasing, resetting, or ancestry-validating existing target branches.
- Making base policy redefine status/pull/push default-branch diagnostics.
- Adding editor-scoped, command-duplicated, or group-scoped base settings.

## Decisions

### 1. Put shared policy at root and overrides with repository ownership

Canonical configuration is:

```json
{
  "baseBranch": "main",
  "meta": { "baseBranch": "meta/integration" },
  "repos": {
    "api": {
      "path": "repos/api",
      "gitUrl": "git@github.com:example/api.git",
      "baseBranch": "api/integration"
    }
  }
}
```

Root `baseBranch` is the fallback for configured create and clone. `meta.baseBranch` applies only to the parent/meta repository; `repos.<name>.baseBranch` applies only to that child. `meta` is an explicit object rather than a magic `repos` entry or root `metaBaseBranch`, leaving one stable ownership scope and room for future meta-specific repository settings without polluting the child map.

Alternative: `defaults.baseBranch`. Rejected because base ancestry is workspace topology rather than command/default presentation, and the user explicitly wants to simplify duplicate command settings.

Alternative: retain `defaults.create.baseBranch` and add `defaults.clone.baseBranch`. Rejected because it duplicates the same policy and permits accidental create/clone drift.

### 2. Use separate global and repository CLI options

Keep `--base <branch>` as the invocation-wide override. Add repeatable `--repo-base <repository=branch>` to configured create and clone. The reserved selector `@meta` names the meta repository; child selectors are exact configured repository IDs.

A separate option avoids overloading `--base` with an `=` grammar that conflicts with legal Git branch characters and preserves existing scripts. Parse at the first `=` after selector validation, reject empty pieces, duplicates, unknown/unselected selectors, `@meta` on clone, and repository overrides in implicit standalone mode.

Alternative: repeat `--base repo=branch`. Rejected as ambiguous and backward-incompatible for branch names containing `=`.

### 3. Resolve one effective request per selected repository

A pure shared policy resolver produces ordered records keyed by canonical repository identity:

1. matching repository `--repo-base`;
2. invocation-wide `--base`;
3. `meta.baseBranch` or `repos.<name>.baseBranch`;
4. root `baseBranch`;
5. deprecated `defaults.create.baseBranch` for configured create only;
6. legacy omitted behavior.

Stable source values are `repository-cli`, `cli`, `repository-config`, `workspace-config`, and `legacy-omitted`. Create passes non-omitted records to its existing strict resolver, extended to accept per-repository requests instead of one branch/source pair. Each strict resolution still normalizes one leading `origin/`, prefers local then `origin`, and captures an immutable OID.

Selector/branch validation occurs after final repository selection but before managed-ignore, hooks, conflicts, or mutation. Unknown selectors are invalid even if a similarly named directory exists; unselected selectors are errors rather than silently ignored, preventing a typo from appearing to succeed.

### 4. Preserve legacy create-only behavior until explicit migration

`defaults.create.baseBranch` remains accepted as deprecated compatibility input for configured create only. It emits one diagnostic directing users to root `baseBranch`; clone ignores the legacy value. If canonical root and legacy values differ, validation fails because silently choosing would hide a partial migration. If they agree, canonical root policy applies to both commands and one migration diagnostic remains.

This choice avoids silently changing clone behavior for existing workspaces merely because they upgrade Arashi. Moving the value to root is the explicit opt-in to shared create/clone semantics. A future major version may remove the compatibility key through a separate approved change.

### 5. Apply bases differently for ordinary and coordinated clone

For clone from the main configured workspace, preflight each selected missing repository's effective branch against its remote, then clone that branch so the local checkout tracks `origin/<base>`. Omitted policy keeps plain remote-default clone behavior.

Inside a coordinated worktree, the desired checkout remains the current coordinated target branch. When a canonical source repository exists:

- reuse the current target branch if it exists;
- otherwise resolve/capture the effective base in that source, create the target from the captured OID, then add the target worktree.

When the canonical source is unavailable and clone must materialize from the remote, clone/fetch enough state to validate the effective base, create or reuse the current coordinated target from that base, and leave the destination checked out on the coordinated target. The base is never presented as the coordinated target branch.

All selected clone branch/remote checks complete before managed-ignore reconciliation or destination creation. Execution records ownership so partial failure removes only destinations/target branches created by this invocation and preserves reused branches and source repositories.

Alternative: always clone `--branch <base>` inside a coordinated worktree. Rejected because it breaks the invariant that children in one coordinated worktree are on the coordinated branch.

### 6. Extend results/contracts without contaminating legacy shapes

Create retains its optional base-plan result but each repository record carries its own normalized branch and source. Clone gains optional ordered base-policy results and stable structured preflight failures. Omit optional policy fields when every selected repository is `legacy-omitted` so existing automation shapes remain compatible.

Commander registration remains the source for option/help/completion metadata. Typed semantic policy remains the source for configuration paths, precedence, selectors, source vocabulary, migration, standalone scope, clone alignment, and failure order. Generated CLI artifacts feed docs/skills/meta comparisons.

## Risks / Trade-offs

- **Remote clone preflight adds network calls** → Batch only selected missing repositories, preserve exact URLs/protocol aliases, aggregate failures, and do not mutate before all checks pass.
- **`meta` becomes a new root object** → Keep it narrowly typed and reject unknown keys; document that child repositories remain exclusively under `repos`.
- **Repository names contain `=` or collide with `@meta`** → Selectors split at the first `=`; `@meta` is reserved and invalid as a child repository ID for this option.
- **Legacy users expect migration to affect clone immediately** → Preserve create-only compatibility and make root migration semantics explicit in diagnostics/docs.
- **Coordinated clone target creation can partially mutate Git refs** → Capture ownership and rollback only invocation-created target refs/destinations; preflight all bases first.
- **Per-repository result changes create tests/contracts broadly** → Keep omitted-policy output absent and adapt the existing immutable create-base plan rather than introducing a second planner.
- **Companion repositories drift during staged delivery** → Deliver CLI producer first, then docs/skills, then meta semantic checks; verify exact child heads before merging meta.

## Migration Plan

1. Add RED tests for canonical config, per-repository CLI parsing/precedence, legacy compatibility, and schema/contract output.
2. Implement the shared policy resolver and adapt create's strict immutable plan.
3. Add real-Git RED tests for normal clone, coordinated source reuse/target creation, remote-only materialization, preflight aggregation, rollback, and JSON.
4. Implement clone preflight/execution and regenerate schema/completions/contracts.
5. Update canonical docs/exports and packaged skill guidance/checkers.
6. Add meta cross-repository semantic checks and run all repository quality gates.
7. Release additively. Existing old-key users retain create behavior and receive migration guidance.

Rollback removes canonical root/meta/child policy and the repository override options. Configurations using new fields would then fail closed as unknown; release notes must instruct users to remove them. The legacy create-only key remains available independently until its separately approved removal.

## Open Questions

None. The requested shared default, meta/child overrides, flag surfaces, and create/clone boundaries are specified for implementation.
