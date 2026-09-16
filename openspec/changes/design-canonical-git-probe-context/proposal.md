## Why

`arashi status` repeatedly rediscovers Git topology, configuration, refs, and fetch outcomes during one invocation. A safe optimization needs Git-proven identity, positive fetch-equivalence proof, linearizable ref reads, and an auditable command budget; path-keyed or invocation-wide failure caches are not correct enough.

## What Changes

- Add one invocation-scoped Git probe context with Git-proven repository/worktree identities and scope-correct sharing.
- Define an exact command ledger for identity, effective configuration, ref snapshots, targeted fetch, porcelain-v2 status, symbolic remote-HEAD fallback, native verbose status, and supported-Git fallbacks.
- Replace the extra repository-type/upstream discovery paths, including `shouldIncludeWorkspaceRootInRepositoryChecks()`, with combined identity and snapshot/porcelain facts so the clean tracked benchmark path has no hidden config, porcelain, or comparison probe beyond the 7/8 normal/verbose budget.
- Gate cross-worktree fetch sharing on a secret-safe cryptographic fingerprint of the complete normalized spawn semantics, including positively proven CWD/relative-remote equivalence; ambiguous inputs execute separately.
- Make ref reads linearizable around every mutation and make fetch sharing attempt-epoch aware, so A→B→A reruns A while identical concurrent A consumers share one result or classified failure.
- Apply compare-and-delete eviction to retry-safe repository, worktree, ref, and discovery failures; retain failures only for consumers of one exact fetch attempt token.
- Preserve #371 normatively: `--local` performs no fetch or other network operation, and existing human/JSON freshness truthfully represents successful, failed, skipped, not-applicable, and local outcomes.
- Pin benchmark comparison to CLI base `b648825295a5c342b6920be0585711678377b452` and require one unchanged external adapter, fixture, runtime, build, and attribution boundary for both binaries.

## Capabilities

### New Capabilities

- `invocation-scoped-git-probe-context`: Canonical Git identity, exact probe framing, scoped sharing, fetch equivalence/epochs, linearizable ref reads, retry semantics, and invocation lifetime.

### Modified Capabilities

- `status-command`: Local/refreshed behavior, factual freshness, context integration, exact command accounting, and benchmark acceptance.

## Impact

- `corwinm/arashi`: probe-context implementation and deterministic fake-runner/real-Git tests; status and remote-helper wiring; benchmark evidence.
- `corwinm/arashi-arashi`: this OpenSpec change and later implementation evidence/archive only.
- No Rust implementation, persistent cache, new CLI option, configured topology change, or replacement of native verbose Git status.