## Why

`arashi doctor` currently treats Git's strict upstream-resolution failure as proof that a branch has no upstream. In a supported bare-clone workspace with a linked worktree, branch remote/merge configuration and the corresponding remote-tracking ref can exist while the remote has no fetch refspec, so the current `REPOSITORY_NO_UPSTREAM` message and one-command remediation are misleading.

## What Changes

- Distinguish a genuinely unconfigured branch from a branch whose configured upstream cannot be recognized because its remote-tracking refspec is missing or incompatible.
- Report a stable topology-aware doctor finding with structured evidence and complete, copy-pasteable remediation for configuring the fetch refspec, fetching it, and setting the branch upstream.
- Preserve existing generic no-upstream, divergence, missing-remote-ref, human-output, JSON-output, and non-mutation behavior outside the diagnosed bare-backed linked-worktree condition.
- Add real-Git regression coverage for the bare clone plus linked worktree topology and focused finding-classification coverage.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `workspace-health-diagnostics`: Refine branch-state diagnosis so doctor distinguishes absent upstream configuration from an unusable configured upstream in bare-backed linked worktrees and provides topology-aware remediation.

## Impact

- CLI repository/status inspection and doctor finding classification in `repos/arashi`.
- Doctor integration and unit tests using temporary real Git repositories.
- The canonical workspace health diagnostics specification and generated/maintained command contract surfaces if finding metadata is enumerated there.
- No configuration schema, dependency, or mutating workflow changes.
