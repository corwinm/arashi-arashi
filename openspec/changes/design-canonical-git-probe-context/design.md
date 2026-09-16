## Context

Issue #372 is the canonical caching slice split from #364 after #371 delivered public `status --local`, truthful freshness, NUL-delimited porcelain-v2 parsing, native verbose status, and truthful per-repository Trace2 attribution. At CLI child revision `b648825295a5c342b6920be0585711678377b452`, refreshed status still resolves overlapping topology, configuration, refs, tracking targets, fetches, and comparisons through independent helpers.

Correct sharing cannot use a configured path as repository identity: a root, subdirectory, symlink, linked worktree, separate-Git-dir checkout, and environment-directed invocation can name the same or a different Git repository. It also cannot parse `.git`, gitfiles, `commondir`, refs, or object storage directly. Git plumbing must establish identity before any alias is trusted.

The benchmark harness delivered by #371 counts Arashi-originated root Git Trace2 sessions and attributes them to canonical worktrees. Current measured refreshed baselines are 39 normal / 42 verbose for the small fixture and 93 normal / 102 verbose for the large fixture. Representative per-repository baselines are 13 normal / 14 verbose for the main repository and 9 normal / 10 verbose for a child repository. The fixture topology, configuration, command boundary, runtime, and attribution rules are fixed comparison inputs.

## Goals / Non-Goals

**Goals:**

- Establish one invocation-owned context with Git-proven canonical repository and worktree identities.
- Share stable repository facts, worktree-local facts, exact fetch attempts, and ref-derived snapshots at scopes that preserve Git semantics.
- Deduplicate identical cross-worktree fetches only when effective Git configuration and environment semantics match.
- Make ref reads linearizable around successful and failed fetch attempts.
- Preserve retry behavior for transient discovery failures.
- Integrate only after deterministic identity/lifecycle tests prove the context independently.
- Reduce refreshed normal and verbose status Git starts for every named repository and in aggregate on both representative fixture sizes without changing #371 semantics.

**Non-Goals:**

- Persistent, daemon, cross-command, or time-based caching.
- Parsing Git-internal filesystem formats or reading refs/object storage directly.
- Treating configured paths, realpaths alone, or Trace2 records as identity authority.
- Replacing native verbose `git status`, changing public status output, or weakening refresh/failure diagnostics.
- Implementing or modifying Rust.

## Decisions

### 1. One context owns all probe state for one command invocation

The command entry point creates one `GitProbeContext` and passes it through status orchestration and Git-remote helpers. The context owns identity discovery, scoped promise maps, effective-semantics fingerprints, fetch attempts, and repository ref generations. It is neither global nor reusable; all maps become unreachable when the invocation settles.

The API distinguishes:

- **discovery hints**: caller-provided paths and environment used only to ask Git for identity;
- **repository key**: canonical common Git directory;
- **worktree key**: repository key plus canonical top level, with an explicit bare sentinel;
- **stable repository probes**: common across linked worktrees only when their semantics permit sharing;
- **worktree probes**: HEAD, porcelain status, native status, and other checkout-local facts;
- **ref-derived probes**: keyed by repository ref generation;
- **mutation attempts**: exact targeted fetch calls with ordered invalidation.

This prevents a convenient cache key from silently broadening the semantic scope of a value.

### 2. Git proves identity in one combined plumbing probe

For a non-bare discovery hint, the context runs exactly:

```text
git rev-parse --show-toplevel --git-common-dir --is-bare-repository
```

It parses the three ordered outputs strictly. If Git rejects `--show-toplevel` because the repository is bare, the context uses the bare-compatible fallback:

```text
git rev-parse --git-common-dir --is-bare-repository
```

The fallback is accepted only when Git reports `true`; any other combined-probe failure remains a discovery failure. Relative Git paths are resolved according to the probe working directory, then both the common directory and non-bare top level are canonicalized with filesystem `realpath`. A non-bare result without a top level, a bare fallback that reports non-bare, malformed output, or failed canonicalization is rejected rather than guessed.

The canonical common directory is the repository key. The worktree key is a structured pair of that key and the canonical top level; bare repositories use a distinct `bare` member rather than pretending the common directory is a worktree. Root paths, subdirectories, and symlink aliases therefore converge only after Git and `realpath` prove they converge. Separate Git directories and linked worktrees retain Git's own common-directory relationship. Git discovery environment overrides are passed into the probe and participate in the semantics fingerprint; a configured path is never promoted from hint to identity. A missing/unusable working directory reports the established missing/local failure rather than manufacturing identity.

Rejected identity promises are removed with identity-safe compare-and-delete logic: concurrent callers observe the same failed attempt, while a later call can retry. Successful identities remain for the invocation.

### 3. Optional worktree-list seeding follows, never replaces, proven identity

After one path has a proven repository key, the context may run:

```text
git -c core.quotePath=false worktree list --porcelain
```

It may seed canonical top-level-to-worktree-key aliases only after realpath canonicalization and only under the already proven common-directory key. Each seeded path is a hint optimization; it cannot establish repository ownership for an unrelated request, bypass environment-sensitive discovery, or make a configured path authoritative. If seeding is not cost-effective, callers use the combined identity probe.

The command is optional because it costs a Git start. On a measured path it must replace at least one later identity probe in the same named repository and remain within the command budget; otherwise it is omitted.

### 4. Effective semantics gate cross-worktree fetch sharing

Linked worktrees share refs but can observe different effective configuration through worktree config, conditional includes, command environment, and Git discovery overrides. Before cross-worktree fetch sharing, the context captures one deterministic, NUL-delimited effective configuration snapshot through Git, including origin and scope, and fingerprints that byte sequence together with the normalized values/presence of Git environment inputs that can affect discovery, config, ref namespace/storage, transport, credentials, and fetch behavior. At minimum this includes `GIT_DIR`, `GIT_WORK_TREE`, `GIT_COMMON_DIR`, `GIT_NAMESPACE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_CONFIG_SYSTEM`, `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_NOSYSTEM`, `GIT_CONFIG_COUNT` and its indexed key/value entries, and transport/config injection variables retained by the production spawn environment. The implementation keeps the fingerprint internal and does not expose secrets in diagnostics or benchmark artifacts.

An exact fetch-attempt key contains:

```text
(repository key, effective-semantics fingerprint, remote,
 source ref, destination ref, prune/force/options)
```

Only an identical key shares one in-flight and settled attempt. Different fingerprints, refspecs, remotes, or options execute independently even when common-directory identity matches. The shared value is the complete classified attempt result, including missing-remote-ref and generic failure, so all consumers of that logical attempt observe the same success or failure rather than silently retrying. This is attempt sharing, not a claim of lasting remote freshness.

Alternative: share by common directory and target alone. Rejected because linked worktrees can have different effective fetch semantics.

### 5. Ref generations form barriers around every fetch attempt

Each repository key owns a monotonic ref generation. Ref snapshots and ref-derived resolutions include the generation in their cache key. Starting an exact fetch attempt acquires the repository mutation sequencer, advances the generation and invalidates ref-derived entries **before** spawning Git. Completion advances it and invalidates again **after** the attempt settles, whether it succeeded or failed. Waiters that require post-attempt state await the shared attempt and then read only from the resulting generation.

The pre-barrier prevents a read that races with mutation from being reused as current. The post-barrier prevents a snapshot taken while Git was running—or while a failed fetch partially changed refs—from surviving. Successful and failed fetches receive identical invalidation treatment because Git failure does not prove no local ref mutation occurred. Independent exact fetch keys for one repository are serialized through the same mutation sequencer; identical keys share one result. Worktree-local non-ref facts remain separately scoped.

Alternative: invalidate only after successful fetch. Rejected because failed fetches can still alter refs and racing snapshots can become stale. Alternative: invalidate only after completion. Rejected because reads started during the mutation could be admitted into the post-fetch generation.

### 6. The passed design gate fixes a conservative fixture command budget

For the clean tracked fixture path, status uses the following maximum root Git sessions per named repository in normal mode:

1. combined identity probe (or an amortized, charged worktree-seeding substitution);
2. effective configuration/environment snapshot;
3. pre-fetch ref snapshot;
4. one exact targeted `fetch --prune` attempt;
5. post-fetch ref snapshot after the generation barrier;
6. `status --porcelain=v2 --branch -z` for worktree state and upstream divergence;
7. symbolic remote-HEAD resolution only when the selected remote/default cannot be resolved from the ref snapshot.

Verbose mode adds exactly one native `git status`, for a conservative target of **7 normal / 8 verbose per named repository**. The symbolic remote-HEAD item is a reserved fallback budget: when the snapshot resolves it, the actual count is lower. Optional `worktree list --porcelain` is charged and may be used only when its seeded aliases remove at least as many identity probes while preserving the same per-repository cap. No hidden `rev-list`, repeated config lookup, duplicate fetch, or second porcelain call may exceed this fixture budget; non-happy-path diagnostics may use additional probes only when required to preserve established semantics and must be covered separately.

The budget is below the measured representative baselines (main 13/14 and child 9/10), and therefore demonstrates a net path before implementation. Acceptance is not satisfied by the budget alone: measured candidate counts must be strictly below their same-topology baselines for every named repository and aggregate in small and large refreshed normal and verbose cases. Current aggregate baselines are small 39/42 and large 93/102. Candidate runs must also have no unexplained unattributed root sessions.

### 7. Status integration preserves #371 behavior and ordering

Context tests land and pass before status receives the context. Refreshed status keeps the semantic order: resolve the exact target, establish a pre-mutation ref view, perform/await the targeted fetch, establish the post-mutation ref view, and only then consume porcelain divergence for refreshed reporting. Local mode performs no fetch and never claims refreshed refs. Configured-base, upstream, default-branch, duplicate-target, detached/unborn HEAD, missing-ref, stale-tracking, missing-repository, bare-workspace, and JSON warning/error behavior remain unchanged.

Porcelain v2 remains NUL-delimited and continues to preserve all #371 path/status cases. Symbolic default HEAD resolution remains remote-aware: preferred/upstream remote first, `origin` fallback, then a unique unambiguous remote; unresolved or ambiguous cases retain current diagnostics. Verbose output remains one native `git status`, not a porcelain reconstruction. Repository output ordering and repository-local failure isolation remain unchanged.

## Alternatives Rejected

- **Configured-path trust:** configured roots and child paths are hints, not proof; aliases, nested paths, linked worktrees, and environment overrides break this identity.
- **Realpath-only identity:** filesystem identity cannot prove Git repository/common-directory membership and does not model separate Git directories.
- **Worktree-list-only identity:** the listing is repository-scoped only after a repository is known, may omit/prune entries, and cannot safely classify an arbitrary initial path or environment override.
- **Trace2 identity:** Trace2 is measurement telemetry emitted after process start, can be unavailable, and is not a correctness API for pre-probe cache keys.
- **Git-internal parsing:** reading `.git`, gitfiles, `commondir`, refs, or object storage directly violates the stable-plumbing constraint and creates portability/format races.

## Risks / Trade-offs

- **[Risk] The identity probe consumes the savings it enables** → combine all identity fields in one call, allow post-proof seeding only when amortized, enforce 7/8 per-repository targets, and require measured per-repository and aggregate reductions.
- **[Risk] The environment fingerprint omits a fetch-affecting input** → derive it at the normalized Git spawn boundary, enumerate Git override families in tests, include the effective config byte snapshot, and fail toward separate fetches rather than unsafe sharing.
- **[Risk] The fingerprint captures secrets** → hash in memory, never serialize raw config/environment values, and assert diagnostics/artifacts contain neither snapshot bytes nor credential values.
- **[Risk] Fetch failure leaves partially changed refs** → run both generation barriers for every settled result and test a failing mutator that changes the ref view before rejecting.
- **[Risk] Promise eviction deletes a newer retry** → delete rejected discovery entries only when the map still points to the rejecting promise.
- **[Risk] Optional seeding aliases a stale/prunable worktree** → canonicalize entries, retain prune state, use entries only as hints under proven identity, and require direct discovery when semantics are uncertain.
- **[Risk] Ref snapshots cannot replace every historical helper probe on edge cases** → keep explicit fallback probes where semantics demand them, test them deterministically, and reject the implementation if representative acceptance regresses.
- **[Trade-off] Invocation-only caching repeats work across commands** → accept repetition to keep correctness and invalidation bounded; persistent caching remains a non-goal.

## Migration Plan

1. Add deterministic tests and a standalone probe-context module without wiring status.
2. Prove identity, scope separation, effective-semantics fingerprints, exact fetch sharing/failure sharing, barriers, retries, and invocation disposal.
3. Integrate the context into status and Git-remote helpers while retaining dependency injection and all #371 tests.
4. Run focused and full CLI gates, real-Git topology tests, and built-executable status smoke tests.
5. Measure unchanged small and large fixtures for refreshed normal and verbose status against the recorded baselines; inspect aggregate, every named repository, and unattributed sessions.
6. Deliver the CLI child change first; archive/synchronize this OpenSpec change in the meta repository only after the implementation and evidence gates pass.

Rollout is internal and requires no data migration or feature flag. Roll back by reverting the status integration and context together; no persisted state or public contract needs cleanup. If identity correctness, #371 parity, or any required benchmark comparison fails, stop delivery and retain the existing uncached behavior.

## Deterministic Test Plan

- Root, nested subdirectory, and symlink hints converge to one repository/worktree key only after Git identity and realpath canonicalization.
- Two linked worktrees share the common-directory repository key but have distinct common-directory-plus-top-level worktree keys; repository probes share and worktree probes do not.
- Bare repositories use the fallback and bare sentinel; separate-Git-dir repositories canonicalize correctly.
- `GIT_DIR`, `GIT_WORK_TREE`, config injection, and conditional/worktree config fixtures prove discovery and effective-semantics separation.
- Missing paths and malformed Git output fail closed; concurrent discovery callers share one failure; the rejecting entry is evicted; a later corrected retry succeeds without deleting a newer promise.
- Worktree-list seeding cannot precede identity, cross repository keys, trust prunable/uncanonicalizable entries, or change results; its charged probe removes an equal or greater number of direct identity probes.
- Identical fetch keys across linked worktrees execute once and return the same success object; differing config/environment fingerprints or refspec/options execute separately.
- Identical failing fetches execute once and return the same classified failure to every consumer.
- Barrier-controlled tests prove pre-fetch snapshots are not reused after start, in-flight snapshots are not reused after settlement, and post-fetch snapshots are fresh after both success and a failure that mutates refs.
- A fresh context repeats probes, proving invocation-only lifetime and no module-global retention.
- Status parity fixtures cover local/refreshed freshness, configured base, upstream/default deduplication, preferred and fallback symbolic remote HEAD, detached and unborn HEAD, missing remote ref, generic fetch failure, bare workspace, missing repository, NUL-path edge cases, JSON warnings/errors, stable ordering, and native verbose output.
- Benchmark tests assert unchanged fixture/topology/boundary, totals equal named-repository plus unattributed counts, no unexplained unattributed sessions, the 7/8 normal/verbose target where applicable, and strict candidate reduction versus 39/42 small, 93/102 large, 13/14 representative main, and 9/10 representative child baselines.

## Open Questions

None. The design gate is passed; implementation remains conditional on the deterministic context tests and measured acceptance above.
