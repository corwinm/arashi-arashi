## Why

`arashi status` repeatedly rediscovers Git topology, configuration, refs, and fetch outcomes during one invocation. Previous cache prototypes either trusted configured paths and merged distinct repositories incorrectly, or added an identity process per repository without removing enough duplicated work to improve the representative fixtures; the passed design gate now provides a plumbing-only identity and command budget that preserves correctness while reducing Git starts.

## What Changes

- Add one invocation-scoped Git probe context that canonicalizes repositories and worktrees from Git-proven identity, shares in-flight/result probes at the correct scope, and is discarded when the command ends.
- Resolve identity with combined stable `git rev-parse` plumbing, a bare-compatible fallback, and filesystem realpath canonicalization; treat configured paths only as discovery hints.
- Key repository facts by canonical common Git directory and worktree facts by canonical common directory plus canonical top level, with optional `git worktree list --porcelain` seeding only after identity is proven by Git.
- Include effective Git configuration and relevant environment semantics in cross-worktree fetch keys, share the exact fetch attempt including failures, and protect ref-derived probes with pre/post-fetch generation barriers.
- Evict rejected discovery promises so transient discovery failures can be retried safely.
- Integrate the context into status only after deterministic context tests pass, preserving all status, freshness, output, and failure semantics delivered by #371.
- Enforce same-topology benchmark acceptance with strictly lower aggregate and per-named-repository Git starts for small/large normal/verbose refreshed status, with no unexplained unattributed sessions.

## Capabilities

### New Capabilities

- `invocation-scoped-git-probe-context`: Defines canonical Git identity, scoped probe sharing, fetch semantics, ref invalidation, retries, and invocation lifetime.

### Modified Capabilities

- `status-command`: Requires status to consume the invocation context without changing #371 behavior and to meet deterministic per-repository process-count acceptance.

## Impact

- `corwinm/arashi`: new Git probe-context module and deterministic unit/integration tests; status and Git-remote dependency wiring; benchmark assertions and documentation if measured counts are recorded there.
- `corwinm/arashi-arashi`: this OpenSpec change and later implementation evidence/archive only.
- No Rust implementation, persistent cache, CLI option, JSON schema, completion contract, configured topology, or public status output change.
