## Context

Doctor obtains each repository's branch relationship from `checkAllRepos()`. Status refreshes a target selected by `resolveRemoteTrackingTarget()`, then parses `git status --porcelain=v1 --branch`. In a bare clone, `branch.<name>.remote`, `branch.<name>.merge`, and `refs/remotes/<remote>/<branch>` can all exist while `remote.<remote>.fetch` does not map the remote branch into that namespace. Git then rejects `@{upstream}`, and porcelain omits `...<upstream>`, so doctor currently emits `REPOSITORY_NO_UPSTREAM` and suggests only `git branch --set-upstream-to`—a command Git will continue rejecting until the fetch mapping exists.

The status command's strict Git semantics and public branch shape are used beyond doctor. This change therefore needs a doctor-specific diagnostic seam rather than redefining every null `remoteBranch` as tracked.

## Goals / Non-Goals

**Goals:**

- Reliably distinguish absent branch upstream configuration from configured-but-unresolvable upstream tracking caused by a missing or incompatible remote fetch mapping.
- Preserve Git's strict upstream semantics for divergence calculations.
- Emit stable, structured, actionable doctor output in both human and JSON modes.
- Prove the diagnosis through the real bare-clone and linked-worktree topology without adding a new mutation path beyond doctor's existing repository-status refresh.

**Non-Goals:**

- Automatically repair Git configuration or fetch mappings.
- Treat branch remote/merge configuration alone as sufficient for ahead/behind reporting.
- Change `arashi status`, `arashi pull`, or `arashi push` behavior.
- Diagnose every possible reason Git can reject `@{upstream}` under the new topology-specific code.

## Decisions

### Add a doctor-only upstream-configuration inspection

Introduce a read-only Git helper that inspects the current local branch, `branch.<name>.remote`, `branch.<name>.merge`, strict `@{upstream}` resolution, the expected `refs/remotes/<remote>/<merge-branch>` ref, and all `remote.<remote>.fetch` values. Doctor invokes it only for a non-detached repository whose parsed `remoteBranch` is null. The helper itself performs no fetch or Git mutation; it consumes the state available after doctor's existing `checkAllRepos()` status refresh, which remains outside this narrow classification change and can update remote-tracking refs.

The helper returns a discriminated result rather than changing `BranchTrackingInfo` or the status JSON contract. It identifies the topology-specific state only when:

1. the branch has a non-local configured remote and a `refs/heads/*` merge target;
2. strict upstream resolution fails;
3. the expected local remote-tracking ref exists after status refresh;
4. no configured fetch refspec maps the merge source to that expected destination; and
5. status did not report that the remote branch itself is missing.

All other cases retain existing doctor classification. This avoids presenting speculative refspec advice for branches that are simply unpublished, remotes that lack the branch, local-dot remotes, malformed configuration, or unrelated Git failures.

Alternative considered: teach `parseGitStatus()` to synthesize `remoteBranch`. Rejected because that would imply valid strict upstream tracking and could produce misleading divergence semantics across status, handoff, pull, and push consumers.

### Emit a distinct stable finding and retain generic no-upstream behavior

The diagnosed state emits `REPOSITORY_UPSTREAM_TRACKING_UNAVAILABLE` as a warning. Its structured details include repository, path, local branch, configured remote, merge ref, expected remote-tracking ref, and a reason identifying the missing fetch mapping. The message explains that upstream configuration exists but Git cannot use it because the remote fetch mapping does not populate the expected tracking namespace.

Suggested commands form an ordered, copy-pasteable sequence that adds a branch-specific fetch mapping, fetches the configured remote, and sets the local branch upstream to `<remote>/<merge-branch>`. A branch-specific mapping is preferred over replacing all remote fetch mappings because it repairs the diagnosed branch without broadening or deleting user-owned configuration.

When branch remote/merge configuration is absent, doctor continues emitting `REPOSITORY_NO_UPSTREAM`. When the remote branch does not exist, `REPOSITORY_MISSING_REMOTE_REF` remains authoritative and no refspec finding is added.

Alternative considered: suppress the generic warning entirely for bare-backed linked worktrees. Rejected because the strict upstream remains unusable and doctor can provide a safe, actionable diagnosis.

### Test the complete topology and pure classification

Add a real-Git integration fixture that creates a bare workspace repository, adds a linked `main` worktree, configures branch remote/merge state, creates the expected remote-tracking ref without a fetch refspec, and runs doctor through the real CLI. The pre-implementation test asserts the new stable finding, exact structured evidence, complete ordered remediation, JSON isolation, and preservation of Git configuration, branches, and worktrees. Focused dependency sentinels prove that the new diagnostic helper itself performs no fetch or mutation; the fixture does not mischaracterize the existing status refresh as ref-non-mutating.

Focused tests cover generic no-upstream preservation, missing-remote-ref precedence, valid strict upstream behavior, and incompatible versus covering fetch refspecs. The regression test must fail against current doctor behavior with `REPOSITORY_NO_UPSTREAM`, not because fixture setup or workspace discovery fails.

## Risks / Trade-offs

- **Refspec matching can be subtle** → Parse positive fetch mappings conservatively, support exact and wildcard source/destination pairs needed by Git remote tracking, and fall back to the generic finding when classification is uncertain.
- **Doctor could duplicate missing-remote-ref findings** → Give the existing refresh warning precedence and require the expected local tracking ref before emitting the topology-aware code.
- **Suggested configuration can affect user-owned Git state** → The new diagnostic path remains read-only and recommends an additive branch-specific mapping rather than replacing existing mappings; only a user who runs the suggested commands changes configuration.
- **Bare clone fixtures can accidentally test only helper behavior** → Run the real CLI from the linked worktree, inspect before/after Git configuration, branches, and worktree metadata, and use focused sentinels to prove the new helper adds no fetch or mutation.

## Migration Plan

No persisted Arashi migration is required. Ship the refined finding classification with the CLI. Rolling back only removes the new classification and restores the previous generic warning; the topology-specific inspector itself creates no state that needs reversal.

## Open Questions

None.
