## ADDED Requirements

### Requirement: Invocation-scoped context lifetime and failure retention
The system SHALL create exactly one Git probe context per command invocation and discard it when the invocation settles. Concurrent consumers MAY share one in-flight scoped probe. Repository, worktree, ref, configuration, identity/discovery, and derived-probe failures that are retry-safe MUST be compare-and-delete evicted after rejection; arbitrary failed probes MUST NOT remain cached for invocation lifetime. Only a classified exact fetch failure whose consumers must observe one logical attempt MAY remain, and only for that attempt token and mutation epoch.

#### Scenario: Consumers share one invocation context
- **WHEN** concurrent consumers request the same eligible scoped probe
- **THEN** they share one in-flight attempt
- **AND** successful results remain only at their valid scope

#### Scenario: Retry-safe failed probe is evicted
- **WHEN** a repository, worktree, ref, configuration, or discovery probe rejects and a later retry is safe
- **THEN** the rejecting promise is removed only if the map still points to it
- **AND** a corrected later request starts a new probe
- **AND** old cleanup cannot delete the newer attempt

#### Scenario: Exact-attempt failure is retained narrowly
- **WHEN** concurrent consumers join one exact failing fetch attempt
- **THEN** they observe the same classified failure for that token and epoch
- **AND** unrelated probes and later explicit retries do not reuse it

#### Scenario: Later invocation starts fresh
- **WHEN** one command settles and another begins for the same paths
- **THEN** no identity, result, failure, attempt token, or generation survives

### Requirement: Git-proven canonical identity
The context MUST run the non-shell argv `git rev-parse --show-toplevel --git-common-dir --is-bare-repository` from the canonical existing discovery directory, strictly parse three LF-delimited fields, resolve relative Git paths against that directory, and realpath-canonicalize them. Only the expected bare no-top-level failure MAY fall back to `git rev-parse --git-common-dir --is-bare-repository`, whose two fields are accepted only when bare is `true`. The canonical common directory SHALL be the repository key; the repository key plus canonical top level, or a distinct bare sentinel, SHALL be the worktree key. Configured paths MUST remain hints.

#### Scenario: Aliases converge only after Git proof
- **WHEN** root, subdirectory, and symlink hints identify one non-bare worktree under the same spawn semantics
- **THEN** strict combined identity and realpath results produce one repository key and one worktree key

#### Scenario: Linked worktrees separate local state
- **WHEN** linked worktrees have one canonical common directory and different canonical top levels
- **THEN** they share the repository key
- **AND** receive distinct worktree keys
- **AND** worktree-local facts do not share

#### Scenario: Bare fallback is strict
- **WHEN** the three-field command fails because no top level exists
- **THEN** the two-field fallback is accepted only with `true`
- **AND** malformed, non-bare, extra-field, NUL-containing, or uncanonicalizable output fails closed

#### Scenario: Separate Git directory and overrides remain authoritative
- **WHEN** a separate Git directory or discovery environment changes Git's result
- **THEN** keys come from that exact Git output and spawn semantics
- **AND** no `.git`, gitfile, or `commondir` data is parsed

### Requirement: Combined identity replaces redundant status discovery
Status SHALL use combined identity's top-level/bare result instead of `shouldIncludeWorkspaceRootInRepositoryChecks()` or a separate repository-type probe. Clean-path current branch/upstream discovery SHALL come from the pre-fetch porcelain branch headers plus the already charged exact config snapshot, and default/ref discovery SHALL come from exact ref snapshots, instead of separate upstream `rev-parse`, config-get, `show-ref`, or branch-list probes. Pre-fetch porcelain `branch.ab` MUST NOT be reported as refreshed divergence; refreshed comparisons MUST come from the post-fetch snapshot.

#### Scenario: Workspace root inclusion is decided from identity
- **WHEN** status classifies a non-bare or bare workspace root
- **THEN** it uses the combined identity result
- **AND** starts no extra `rev-parse --is-bare-repository`

#### Scenario: Upstream discovery uses existing ledger data
- **WHEN** porcelain contains branch upstream headers and the ref snapshot contains matching remote refs
- **THEN** status resolves upstream/default roles from those facts
- **AND** does not start a hidden upstream/config/ref probe

### Requirement: Exact effective configuration snapshot
For every worktree considered for cross-worktree sharing, the context MUST execute argv `git config --null --list --show-origin --show-scope` from that canonical worktree directory. It MUST parse raw repeated `scope NUL origin NUL (key LF value | key-only) NUL` records, preserving order, duplicate keys, valueless entries, explicitly empty values, origins, scopes, and exact bytes. A third field without LF is a valid valueless entry and MUST remain distinct from `key LF` with an empty value. Malformed framing or lack of required supported-Git options MUST fail sharing closed.

#### Scenario: Exact NUL records are fingerprinted
- **WHEN** effective config contains duplicate keys, includes, valueless keys, explicitly empty values, or secret-bearing values
- **THEN** the parser retains exact stdout bytes for in-memory fingerprinting
- **AND** does not collapse or text-normalize the records

#### Scenario: Config snapshot cannot be obtained exactly
- **WHEN** Git rejects the required command or emits malformed/truncated fields
- **THEN** cross-worktree fetches execute separately or fail according to the established operation
- **AND** no lossy config fallback authorizes sharing

### Requirement: Secret-safe complete spawn-semantic fingerprint
Cross-worktree sharing MUST be gated by a normalized record containing canonical repository and execution/CWD semantics, resolved executable and PATH/PATHEXT lookup semantics, every environment entry passed to spawn, HOME/USERPROFILE/XDG, SSH/askpass/proxy/credential/transport inputs, Git discovery/storage/config injection, exact effective-config bytes, and exact fetch argv/options. Windows environment keys MUST be case-normalized and duplicate case variants rejected. The record MUST use versioned domain separation and length framing and a cryptographic SHA-256 digest. Digest equality MUST be followed by exact normalized-byte equality so collisions do not share. Raw secrets MUST NOT enter errors, diagnostics, logs, traces, snapshots, or artifacts.

#### Scenario: Complete equivalent records share eligibility
- **WHEN** two candidates have byte-equal normalized records after positive CWD equivalence proof
- **THEN** their digest and retained bytes establish fetch-sharing eligibility

#### Scenario: Environment and executable semantics differ
- **WHEN** resolved Git executable, PATH/PATHEXT, any complete environment entry, HOME/XDG, helper/transport input, Git injection, or exact config bytes differ
- **THEN** records differ and attempts execute separately

#### Scenario: Windows environment aliases are safe
- **WHEN** Windows input contains case variants such as `Path` and `PATH`
- **THEN** normalization rejects ambiguous duplicates
- **AND** deterministic case-normalized environments compare independent of key spelling

#### Scenario: Digest collision does not alias
- **WHEN** a test forces two distinct normalized records to return one digest
- **THEN** byte comparison places them in separate attempts

#### Scenario: Fingerprint sources remain secret
- **WHEN** source data includes credential, token, proxy, askpass, SSH, or URL secrets and the operation succeeds or fails
- **THEN** no raw source value appears in user output, errors, diagnostics, logs, Trace2 labels, benchmark data, snapshots, or artifacts

### Requirement: CWD and relative-remote equivalence require positive proof
The normalized record MUST account for the canonical execution directory. Relative local remote/direct fetch paths MUST be resolved under each worktree's exact canonical CWD and represented by canonical endpoint. CWD-sensitive conditional config, URL rewrites, helpers, credentials, proxies, SSH commands/config, hooks, transport commands, or ambiguous inputs MUST include material CWD semantics and prohibit cross-worktree sharing. A shared `cwd-independent` projection MAY be used only after endpoints, exact config bytes, complete environment, executable semantics, and absence of CWD-sensitive behavior are positively proven equivalent.

#### Scenario: Same raw relative remote resolves differently
- **WHEN** a real-Git linked-worktree fixture gives both worktrees identical raw remote config and fetch argv but `../remote.git` resolves from their canonical CWDs to different repositories
- **THEN** fingerprints differ
- **AND** the fetches MUST NOT share

#### Scenario: Equivalent linked worktrees share safely
- **WHEN** a real-Git linked-worktree fixture uses the same absolute or canonically equivalent endpoint, exact config bytes, complete environment/executable semantics, and no CWD-sensitive helper/configuration
- **THEN** positive proof yields one equivalent semantic record
- **AND** identical concurrent fetch requests share one attempt

#### Scenario: Equivalence is ambiguous
- **WHEN** any helper, config, endpoint, environment, or CWD dependency cannot be proven equivalent
- **THEN** the context executes separate attempts

### Requirement: Exact ref snapshots and supported-Git fallback
For born HEAD, pre/post ref snapshots MUST execute `git for-each-ref --format=%(refname)%00%(objectname)%00%(symref)%00%(ahead-behind:HEAD)%00 refs/heads refs/remotes`. The parser MUST require `refname NUL object-id NUL symref NUL ref-only SP HEAD-only NUL LF` records, normalize status `ahead=HEAD-only` and `behind=ref-only`, and reject malformed/duplicate fields. The fallback `git rev-list --left-right --count HEAD...<full-ref>` already returns `HEAD-only ref-only` and MUST NOT be swapped. Local heads and remote-tracking refs, including symbolic remote HEADs, SHALL be included; unrelated namespaces SHALL be excluded. HEAD-relative snapshots/comparisons MUST be keyed by worktree key, exact HEAD identity, ref, and repository generation; repository-only metadata MAY share only without comparison fields. On supported Git lacking `ahead-behind`, and only for unsupported-atom classification, the context MUST rerun the same namespaces with `--format=%(refname)%00%(objectname)%00%(symref)%00` and deduplicate exact fallback comparisons at the same worktree/HEAD scope. When pre-fetch porcelain reports unborn HEAD, the context MUST directly use metadata-only format, skip HEAD-relative comparisons, and preserve unborn status.

#### Scenario: Snapshot supplies target and comparison facts
- **WHEN** refs exist in `refs/heads` or `refs/remotes`
- **THEN** one exact framed snapshot supplies OIDs, symbolic targets, and supported-Git ahead/behind values
- **AND** no hidden comparison probe runs on the optimized supported path

#### Scenario: Asymmetric divergence has one orientation
- **WHEN** a real-Git fixture makes HEAD ahead-only and then behind-only relative to a target ref
- **THEN** the atom parser swaps `ref-only HEAD-only` into status `ahead behind`
- **AND** the fallback parser keeps `HEAD-only ref-only` unchanged
- **AND** both paths report identical HEAD-relative counts

#### Scenario: Ahead-behind atom is unsupported
- **WHEN** Git specifically rejects that format atom
- **THEN** the stable framed snapshot and one deduplicated rev-list per required full ref preserve behavior
- **AND** the compatibility sessions are separately attributed rather than hidden in the 7/8 claim

#### Scenario: Linked worktrees have different HEADs
- **WHEN** linked worktrees at different commits compare the same shared ref
- **THEN** their ahead/behind values use distinct worktree/HEAD-scoped cache keys
- **AND** one worktree never receives the other's counts

#### Scenario: HEAD is unborn
- **WHEN** pre-fetch porcelain reports an unborn branch
- **THEN** the context uses the metadata-only ref format without first failing an ahead-behind command
- **AND** marks HEAD-relative comparisons unavailable while preserving local unborn status

#### Scenario: Other snapshot failure occurs
- **WHEN** snapshot execution or framing fails for another reason
- **THEN** the probe fails/evicts under the general failure rule
- **AND** unsupported-atom fallback is not misapplied

### Requirement: Proven and charged worktree seeding
`git -c core.quotePath=false worktree list --porcelain` MAY seed aliases only after direct Git identity. Every path MUST be canonicalized under the proven repository, and prunable, conflicting, environment-sensitive, or otherwise ambiguous entries MUST remain hints requiring direct discovery. The root session MUST replace at least as many direct identity sessions and remain inside the named-repository budget.

#### Scenario: Safe seeding amortizes identity
- **WHEN** one proven listing safely avoids at least one direct identity probe
- **THEN** it may seed hints and is charged to that repository

#### Scenario: Entry is unsafe or not amortized
- **WHEN** listing precedes identity, is prunable/uncanonicalizable/ambiguous, or saves fewer sessions than it costs
- **THEN** it is not trusted or not run

### Requirement: Linearizable ref reads around mutation
A ref reader MUST await active mutation, capture generation while no mutation is active, run/reuse a generation-keyed probe, then verify under the repository sequencer that generation is unchanged and no mutation is active before publishing. If verification fails it MUST discard and retry. Every fetch MUST advance/invalidate immediately before spawn and again after success or failure.

#### Scenario: Reader starts before mutation and finishes after it
- **WHEN** a deterministic barrier pauses a snapshot after start, a fetch mutates/settles, and the snapshot resumes
- **THEN** the old snapshot is not published
- **AND** the reader retries at the post-mutation generation

#### Scenario: Reader arrives during mutation
- **WHEN** a ref read is requested while a fetch is active
- **THEN** it awaits settlement before capturing generation
- **AND** no in-flight snapshot escapes into post-fetch reporting

#### Scenario: Failed mutation may alter refs
- **WHEN** fetch changes refs and then fails
- **THEN** the same post-settlement advance/invalidation occurs
- **AND** readers publish only post-failure generation data

### Requirement: Fetch attempt epochs and tokens
Each repository MUST sequence mutation attempts with a monotonic epoch. Concurrent identical requests for one exact key/token MUST share one complete success or classified failure. Any distinct mutation MUST advance the epoch and make prior settled entries ineligible, including overlapping destinations. A settled A followed by B followed by A MUST execute A again. Explicit retry after failure MUST allocate a new attempt token and execute again.

#### Scenario: Identical concurrent A shares
- **WHEN** identical consumers request A before it settles
- **THEN** one fetch executes
- **AND** all consumers observe the same success or classified failure

#### Scenario: A then B then A reruns
- **WHEN** A settles, a distinct mutation B starts/settles, and A is requested again
- **THEN** B's epoch invalidates settled A
- **AND** the second A executes a new fetch

#### Scenario: Overlapping destinations serialize
- **WHEN** distinct refspecs mutate equal or overlapping destination refs
- **THEN** their pre/post barriers are serialized under one repository sequencer
- **AND** neither observes a stale settled attempt

#### Scenario: Failed attempt retries explicitly
- **WHEN** A fails and the caller explicitly retries
- **THEN** retry uses a new token and epoch eligibility
- **AND** old failure cleanup cannot satisfy or delete it

### Requirement: Exact targeted fetch, status, and remote-HEAD fallback
Targeted refresh MUST execute `git fetch --no-tags --prune <remote> +refs/heads/<branch>:refs/remotes/<remote>/<branch>` as argv. Before target resolution/fetch, worktree state MUST execute one `git status --porcelain=v2 --branch -z`; its branch identity/upstream plus exact config select the target, its worktree records remain valid, and its pre-fetch `branch.ab` MUST be discarded for refreshed roles. If snapshots cannot resolve the selected remote HEAD, fallback MUST execute `git symbolic-ref --quiet --short refs/remotes/<remote>/HEAD` in selected/upstream, `origin`, then unique remaining-remote order. Verbose mode MUST add exactly one native `git status` whose stdout is not reconstructed.

#### Scenario: Exact targeted fetch executes
- **WHEN** a refreshable target is selected
- **THEN** only its validated source/destination refspec is fetched with no tags and prune
- **AND** all argv remain separate shell-free arguments

#### Scenario: Porcelain parser owns structured status
- **WHEN** status contains branch headers, tabs, newlines, Unicode, rename/copy origins, conflicts, ignored/untracked entries, type changes, detached HEAD, or unborn HEAD
- **THEN** the existing NUL porcelain-v2 parser consumes the one exact command without semantic loss

#### Scenario: Symbolic fallback is deterministic
- **WHEN** the snapshot lacks a resolvable selected remote HEAD
- **THEN** exact symbolic-ref fallback follows selected/upstream, origin, then unique unambiguous remote order
- **AND** ambiguity is not guessed

#### Scenario: Verbose output remains native
- **WHEN** verbose status is requested
- **THEN** exactly one additional `git status` runs
- **AND** its human stdout is preserved rather than synthesized

### Requirement: Stable-plumbing boundary
Production MUST use Git commands and filesystem canonicalization and MUST NOT parse `.git`, gitfiles, `commondir`, loose/packed refs, or object storage directly.

#### Scenario: Implementation boundary is reviewed
- **WHEN** production context code is inspected
- **THEN** identity/ref/config facts come through the specified Git plumbing and byte parsers
- **AND** no Git-internal filesystem parser exists