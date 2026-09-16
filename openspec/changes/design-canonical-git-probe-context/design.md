## Context

Issue #372 is the caching slice split from #364 after #371 delivered public `status --local`, truthful freshness, NUL-delimited porcelain-v2 parsing, native verbose status, and per-repository Trace2 attribution. The immutable comparison base is CLI `b648825295a5c342b6920be0585711678377b452`.

Configured paths are only hints: roots, subdirectories, symlinks, linked worktrees, separate Git directories, and Git discovery overrides can name the same or different repositories. Sharing also cannot be inferred from common-directory identity alone because relative remotes, worktree config, conditional includes, helpers, environment, and execution directory can change fetch meaning.

## Goals / Non-Goals

**Goals**

- Establish one invocation-owned, Git-proven context.
- Specify exact commands, byte framing, parser ownership, fallbacks, and count accounting before implementation.
- Share only facts and mutation attempts whose equivalence is positively proven.
- Make ref reads linearizable and fetch reuse mutation-epoch aware.
- Evict retry-safe failed probes without allowing old cleanup to delete a newer attempt.
- Preserve every #371 local/refreshed, freshness, parsing, diagnostic, and native-output behavior.
- Prove lower process counts against one pinned base and unchanged external measurement boundary.

**Non-goals**

- Persistent/cross-command caches, Git-internal filesystem parsing, Rust changes, a new CLI option, or synthesized verbose status.

## Decisions

### 1. Context scopes and general failure retention

The status command creates exactly one `GitProbeContext`, passes it through configured/standalone orchestration and remote helpers, and drops it when the invocation settles. It distinguishes:

- discovery hint: caller path plus spawn semantics used only to ask Git;
- repository key: canonical realpath of Git's common directory;
- worktree key: repository key plus canonical top level, or a distinct bare sentinel;
- repository/worktree facts at their narrowest valid scope;
- repository-only ref metadata at `(repository key, generation)` and HEAD-relative comparisons at `(worktree key, exact HEAD identity, generation)`;
- fetch attempts at `(repository key, semantic-record digest+bytes, exact argv, attempt token)`.

Any repository, worktree, ref, configuration, identity/discovery, or derived-probe rejection that is safe to retry is shared only while in flight and then compare-and-delete evicted. Cleanup removes the entry only if it still points to the rejecting promise. Arbitrary failures are never retained for invocation lifetime. The sole retained classified failures are exact mutation attempts whose concurrent consumers must observe one logical attempt; retention is bounded by that attempt token and repository mutation epoch. Explicit retry always allocates a new token.

### 2. Exact Git-proven identity and replacement of old discovery

Every spawn uses argv arrays, never a shell. From the canonicalized existing discovery directory, identity runs:

```text
executable: <resolved git executable>
argv: ["rev-parse", "--show-toplevel", "--git-common-dir", "--is-bare-repository"]
cwd: canonical discovery directory
stdout framing: exactly three LF-terminated UTF-8 fields, with one optional final LF
parser owner: GitProbeContext identity parser
```

The parser rejects NUL, extra/missing fields, non-`true|false` bare values, a bare result from the three-field form, and failed realpath. Relative top-level/common-dir output is resolved against the command CWD before realpath.

Only when Git's failure is the expected absence of a top level does it run:

```text
argv: ["rev-parse", "--git-common-dir", "--is-bare-repository"]
stdout: two LF-delimited fields
```

The fallback is accepted only with `true`; otherwise discovery fails closed. Bare uses a typed sentinel, not a fake top level.

This combined identity supplies repository type, common identity, and top level. Its top-level/bare result replaces `shouldIncludeWorkspaceRootInRepositoryChecks()`; status includes a non-bare canonical top level and applies established bare-workspace reporting without a separate `rev-parse --is-bare-repository`. Upstream/default discovery comes from the single ref snapshot plus porcelain branch headers below, replacing standalone `rev-parse @{upstream}`, `show-ref`, branch-list, and repeated config helpers on the clean path.

Optional `git -c core.quotePath=false worktree list --porcelain` seeding is permitted only after direct identity, canonicalizes every path, rejects prunable/ambiguous entries, and is charged to the repository. It may run only when it removes at least one direct identity spawn and preserves the cap.

### 3. Exact effective-config snapshot and normalized spawn-semantic record

For each worktree considered for cross-worktree sharing, status runs exactly:

```text
argv: ["config", "--null", "--list", "--show-origin", "--show-scope"]
cwd: that canonical worktree execution directory
stdout record: scope NUL origin NUL (key LF value | key-only) NUL, repeated in Git emission order
parser owner: effective-config byte parser
```

The parser consumes raw bytes and requires groups of three NUL fields. In the third field, the first LF separates key from value when present; no LF is Git's valid valueless/key-only form and is distinct from `key LF NUL`, an explicitly empty value. It preserves duplicate keys, both value forms, origins, scope, order, and all remaining bytes, and rejects malformed/truncated output. The exact stdout bytes—not a reserialized map—enter the fingerprint. On the supported Git floor, failure of `--show-scope` is an operational error; no lossy config fallback may authorize sharing.

A versioned normalized spawn-semantic record is encoded with domain `arashi.git-fetch-equivalence.v1` and unsigned 64-bit big-endian length prefixes. It contains:

1. repository key and operation kind;
2. canonical execution semantics: canonical worktree/CWD, plus a CWD-equivalence projection described below;
3. resolved executable realpath and lookup mode; exact `PATH`, and on Windows `PATHEXT` and executable-suffix resolution;
4. every environment entry actually passed to spawn, with presence distinguished from empty, sorted by byte key on POSIX and case-folded key on Windows; Windows duplicate case variants are rejected rather than last-write-wins;
5. explicit HOME/USERPROFILE and XDG variables (also present in the complete environment section);
6. SSH command/variant/config/agent/socket, askpass/display/terminal-prompt, proxy, credential-helper/prompt, HTTP(S), SSL/TLS, transport, protocol, and locale inputs through complete env/config capture;
7. all Git discovery/storage/config injection semantics, including `GIT_DIR`, `GIT_WORK_TREE`, `GIT_COMMON_DIR`, `GIT_CEILING_DIRECTORIES`, `GIT_DISCOVERY_ACROSS_FILESYSTEM`, `GIT_NAMESPACE`, object/alternate/quarantine paths, config system/global/nosystem/count/indexed key-value entries, and command `-c` options;
8. exact effective-config stdout bytes;
9. exact fetch executable, ordered argv, resolved remote endpoint proof, stdin/stdio policy, timeout/signal policy, and platform spawn flags.

The context computes SHA-256 over those framed bytes with a separate hash domain from every other cache key. Digest equality alone is not proof: the in-memory bucket retains normalized bytes and requires byte equality; a synthetic or cryptographic collision forms separate attempts. Raw record/config/environment values may exist only in memory long enough to compare/hash. Errors, status diagnostics, logs, Trace2 labels, benchmark JSON, snapshots, and artifacts expose neither raw bytes nor secret-bearing hashes that can be used as diagnostics; tests inject canary credentials and assert absence.

### 4. CWD and relative-remote equivalence are proven, never assumed

Before cross-worktree sharing, GitProbeContext derives an execution-equivalence projection for each canonical worktree. It resolves the selected remote's effective URL/pushURL and any direct relative fetch argument under the exact canonical execution CWD using Git's local-path rules. It also examines the exact config bytes and environment for CWD-sensitive conditional includes, URL rewrites, external remote helpers, credential/askpass helpers, proxy commands, SSH commands/config, hooks, and transport commands.

- Relative filesystem remotes are represented by their canonical resolved endpoint, not their identical raw text.
- If two worktrees resolve identical raw `../remote.git` to different endpoints, their records differ and they MUST execute separately.
- If an input may consult CWD and independence cannot be positively established, the projection includes the canonical CWD and attempts do not share.
- A shared `cwd-independent` projection is allowed only when remote/transport endpoints resolve identically, effective config bytes and complete environment are equal, no worktree/conditional config differs, and no helper/command can observe a different CWD. This permits a real safe linked-worktree case with an absolute remote and otherwise equivalent spawn semantics to share once.

Thus CWD is never omitted; it is either material to the record or replaced by an explicit, test-backed proof that this operation is CWD-independent. Ambiguity fails toward separate attempts.

### 5. Exact ref snapshots, comparison data, and supported-Git fallback

The one porcelain command runs before ref resolution/fetch. Its branch headers identify current symbolic branch or detached/unborn state and upstream; the exact config snapshot supplies `branch.<name>.remote` and `.merge` when no porcelain upstream exists. This selects the exact fetch target without a separate probe. Porcelain worktree records remain valid across ref-only fetch mutation, while its pre-fetch `branch.ab` is never used for refreshed divergence.

For a born HEAD, pre- and post-mutation snapshots run from that canonical worktree and use exactly:

```text
argv: ["for-each-ref",
       "--format=%(refname)%00%(objectname)%00%(symref)%00%(ahead-behind:HEAD)%00",
       "refs/heads", "refs/remotes"]
stdout record: refname NUL object-id NUL symref NUL "ahead behind" NUL LF
parser owner: ref-snapshot parser
```

The parser consumes bytes, requires trailing `NUL LF` for every record, validates full refnames/OIDs, accepts an empty symref, parses two non-negative decimal counts, rejects duplicates/malformed records, and never splits path data through locale-sensitive whitespace. Git's atom reports `<ref>-only HEAD-only`; status reports HEAD-relative divergence, so the parser normalizes `ahead = HEAD-only` (second count) and `behind = ref-only` (first count). The fallback `rev-list HEAD...<ref>` already reports `HEAD-only ref-only` and is not swapped. Asymmetric real-Git tests require both paths to yield identical status orientation. These namespaces contain local heads, remote-tracking refs, and symbolic `refs/remotes/<remote>/HEAD`; tags and unrelated refs are intentionally excluded. Because `ahead-behind:HEAD` is worktree/HEAD-relative, the snapshot/comparison cache key is `(worktree key, exact HEAD identity, repository generation)`, never repository/generation alone. Repository-only ref metadata may be projected and shared only after discarding every HEAD-relative comparison field.

When porcelain reports unborn HEAD, the context does not invoke the HEAD-relative atom. It uses the metadata-only format `%(refname)%00%(objectname)%00%(symref)%00` for the same namespaces, marks HEAD-relative comparisons unavailable, and preserves unborn status without treating it as a snapshot failure.

For a supported Git version lacking `%(ahead-behind:HEAD)`, the first unsupported-atom failure is classified without parsing its stdout. The context reruns the stable snapshot with:

```text
--format=%(refname)%00%(objectname)%00%(symref)%00
```

and computes each unique needed non-porcelain comparison with exactly `git rev-list --left-right --count HEAD...<full-ref>`, deduplicated only by worktree key, exact HEAD identity, full ref, and generation. This compatibility path preserves behavior but is not the 7/8 benchmark path; benchmark provenance records a Git version supporting the atom. Other snapshot errors do not trigger fallback.

When no snapshot symbolic ref resolves the selected remote HEAD, the only symbolic fallback is:

```text
argv: ["symbolic-ref", "--quiet", "--short", "refs/remotes/<remote>/HEAD"]
```

Its parser requires exactly `<remote>/<branch>` plus optional final LF. Remote order is selected/upstream remote, then `origin`, then one unique remaining symbolic remote HEAD from the snapshot; ambiguity is not guessed.

### 6. Exact fetch, porcelain, and native verbose commands

A targeted refresh is exactly:

```text
argv: ["fetch", "--no-tags", "--prune", "<remote>",
       "+refs/heads/<branch>:refs/remotes/<remote>/<branch>"]
```

Remote/branch are validated as names and passed as separate argv. The complete classified result distinguishes success, missing source ref, and generic transport/authentication/command failure. No shell or broad default refspec is used.

Before target resolution and fetch, worktree status is exactly:

```text
argv: ["status", "--porcelain=v2", "--branch", "-z"]
parser owner: existing NUL porcelain-v2 parser
```

It owns `# branch.oid`, `# branch.head`, `# branch.upstream`, `# branch.ab`, ordinary/rename/unmerged/untracked/ignored records, detached/unborn state, and path bytes. Branch identity/upstream plus effective config select the fetch target. Worktree/path records remain the status result; pre-fetch `branch.ab` is discarded for refreshed roles and post-fetch snapshot comparisons are used. No second porcelain call is permitted.

Verbose adds exactly:

```text
argv: ["status"]
parser owner: none; stdout is preserved as Git-native human output
```

### 7. Linearizable ref reads

Every ref reader follows this loop:

1. await the repository's active mutation, if any;
2. capture generation `g` while no mutation is active;
3. reuse or start the generation-keyed probe;
4. before publishing, re-enter the repository sequencer and verify generation is still `g` and no mutation is active;
5. publish only if both checks hold; otherwise discard that result from the map and retry from step 1.

A mutation increments generation and invalidates before spawn, then increments/invalidates again after success or failure. Therefore a read already in flight when mutation starts cannot escape after settlement. Deterministic barrier tests pause a snapshot between spawn and publish, run a mutator, release the snapshot, and require retry/fresh bytes.

### 8. Fetch attempt epoch/token semantics

Each repository has a monotonic mutation epoch and sequencer. A new exact attempt token reserves its key at the current epoch. Concurrent identical requests joining before settlement share one promise/result/failure. Starting any distinct mutation—including one with an overlapping destination—advances the epoch and makes all settled attempt entries from prior epochs ineligible. Consequently settled A cannot survive B, and A→B→A runs A twice. Distinct mutations serialize even when destinations overlap only partially.

A retained failed result is observable only by consumers holding that exact token. An explicit retry allocates a new token, advances through normal mutation barriers, and spawns again. An old completion/cleanup cannot delete or satisfy a newer token because every map operation compare-checks key, token, and epoch.

### 9. Auditable clean-fixture command ledger and count proof

The unchanged clean tracked refreshed benchmark path records every root session with executable, argv, CWD, parser, repository attribution, and purpose:

| Slot | Exact purpose | Root sessions |
|---|---|---:|
| 1 | combined identity; also replaces `shouldIncludeWorkspaceRootInRepositoryChecks()` and separate topology/type discovery | 1 |
| 2 | exact effective-config snapshot; complete environment normalization is in-process | 1 |
| 3 | one NUL porcelain-v2 status, supplying current branch/upstream before fetch | 1 |
| 4 | pre-fetch `for-each-ref` snapshot | 1 |
| 5 | one exact targeted fetch/refspec per deduplicated fixture target | 1 |
| 6 | post-fetch `for-each-ref` snapshot with all refreshed target comparisons | 1 |
| 7 | reserved symbolic remote-HEAD fallback; zero when snapshot resolves it | 0–1 |
| 8 | verbose-only native status | 0 normal / 1 verbose |

Normal is at most 7; verbose at most 8. The supported benchmark Git uses `ahead-behind`, the clean fixture has born HEAD and deduplicates tracking/base/default to its one targeted ref, and pre-fetch porcelain plus config select the target while post-fetch snapshots provide refreshed comparisons. Therefore no `rev-list`, config getter, upstream `rev-parse`, `show-ref`, branch listing, duplicate fetch, or second porcelain call is hidden in 7/8. Optional worktree seeding replaces and is charged against identity, never added. Unsupported-Git, unborn, and non-happy-path compatibility/diagnostic probes are separately attributed and are not misreported as meeting the clean-fixture cap.

### 10. #371 local and freshness semantics

`--local` starts no transport-capable operation: no fetch, `ls-remote`, remote helper, credential helper, SSH, HTTP(S), or other network command. It may read only existing local refs/config/status. Refreshed status preserves resolve target → pre-view → exact fetch → post-view → status/report order.

The established human notice and JSON freshness object remain truthful through the following matrix; existing per-role warning/unavailable/skipped records supply details without inventing success:

| Repository outcome | JSON freshness | Human/role evidence |
|---|---|---|
| successful refresh | `mode=refreshed`, `remoteRefsRefreshed=true` | refreshed notice/available roles |
| failed refresh | `mode=refreshed`, `remoteRefsRefreshed=false` | missing-ref or stale warning/unavailable reason |
| skipped applicable target | `mode=refreshed`, `remoteRefsRefreshed=false` | established skipped reason |
| not applicable/no target | `mode=refreshed`, `remoteRefsRefreshed=false` | incomplete-or-not-applicable notice; no false warning |
| local | `mode=local`, `remoteRefsRefreshed=false` | `Freshness: local remote-tracking refs (no fetch performed)` |

Command-level `remoteRefsRefreshed` is true only when every evaluated present repository that participates in the result reports successful refresh; empty, failed, skipped, not-applicable, local, and mixed outcomes are false. Missing repositories retain established visibility and are never probed.

### 11. Benchmark provenance

Before harness edits, evidence captures base SHA `b648825295a5c342b6920be0585711678377b452`; fixture source hash/version; exact repository count, canonical paths, worktrees, branches, refs, remotes, config, groups, dirty state, and local/refresh mode; external adapter source hash and argv; Trace2 root-session/attribution rule; OS/architecture; Git/Node/Bun/pnpm versions; build command/options/environment; base executable hash; warm-up/sample counts; and metric method.

Base and candidate are built separately, with executable hashes and logs. The same unchanged external adapter invokes both binaries at the same public CLI boundary. An internal base collector may not be compared with a candidate CLI. Named counts plus explicit unattributed count must equal aggregate, with no unexplained unattributed sessions and identical semantic output/canonical paths.

Pinned baselines are small 39/42 and large 93/102 normal/verbose aggregate, representative main 13/14, and child 9/10. Candidate must be strictly lower for every named repository and aggregate in all four cases and meet 7/8 on the clean tracked fixture.

## Risks / Trade-offs

- Positive equivalence is intentionally conservative; uncertain CWD/helper semantics lose sharing, not correctness.
- The exact config snapshot contains secrets in memory; domain-separated hashing, byte equality, redaction tests, and no serialization bound exposure.
- Failed fetch can partially mutate refs; identical pre/post barriers apply to success and failure.
- Unsupported Git can exceed the optimized-path count; it preserves correctness and is reported separately rather than hidden.
- Invocation-only state repeats work across commands but keeps invalidation bounded.

## Migration Plan

1. Land deterministic context tests, including real-Git relative/equivalent linked-worktree cases, without status wiring.
2. Implement identity, parsing, fingerprint, failure eviction, linearizable reads, epochs, and optional charged seeding.
3. Integrate status and preserve the complete #371 matrix.
4. Run focused/full gates and real built-binary smoke.
5. Capture pinned base/candidate evidence with the unchanged adapter and accept only strict reductions.
6. Deliver CLI child first; archive/synchronize OpenSpec only after implementation evidence.

## Open Questions

None. Ambiguous equivalence executes separately; correctness and #371 behavior override sharing or benchmark acceptance.