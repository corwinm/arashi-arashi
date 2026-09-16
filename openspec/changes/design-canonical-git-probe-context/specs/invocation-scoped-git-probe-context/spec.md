## ADDED Requirements

### Requirement: Invocation-scoped context lifetime
The system SHALL create exactly one Git probe context for a command invocation, SHALL share eligible probes only through that context, and MUST discard all cached identities, results, failures, and generations when the invocation settles.

#### Scenario: Consumers share one invocation context
- **WHEN** multiple status consumers request eligible Git facts during one command invocation
- **THEN** they use the same invocation-owned probe context
- **AND** concurrent requests for the same scoped probe share one in-flight result

#### Scenario: A later command starts fresh
- **WHEN** one command invocation completes and another command begins for the same paths
- **THEN** the later command creates a fresh context
- **AND** no identity, probe, fetch, failure, or ref generation from the prior invocation is reused

### Requirement: Git-proven canonical identity
The context MUST derive identity through stable Git plumbing and filesystem canonicalization. It SHALL use the canonical common Git directory as the repository key and the canonical common directory plus canonical top level as the worktree key. Configured paths and aliases MUST remain discovery hints and MUST NOT be used as identities.

#### Scenario: Root and subdirectory aliases converge
- **WHEN** callers discover the same non-bare worktree through its root, a nested subdirectory, or a symlink alias
- **THEN** the context runs the combined `git rev-parse --show-toplevel --git-common-dir --is-bare-repository` identity probe as needed
- **AND** realpath-canonicalized results produce one repository key and one worktree key

#### Scenario: Linked worktrees share only repository identity
- **WHEN** two linked worktrees resolve to the same canonical common Git directory and different canonical top levels
- **THEN** they receive the same repository key
- **AND** they receive distinct worktree keys
- **AND** worktree-local facts are not shared between them

#### Scenario: Bare repository uses the fallback
- **WHEN** the combined identity probe cannot return a top level because Git identifies a bare repository
- **THEN** the context uses the bare-compatible `git rev-parse --git-common-dir --is-bare-repository` fallback
- **AND** accepts the fallback only when Git reports a bare repository
- **AND** represents the worktree component with a distinct bare sentinel

#### Scenario: Separate Git directory is canonicalized
- **WHEN** Git discovers a non-bare checkout whose Git directory is separate from its working tree
- **THEN** the common-directory repository key and top-level worktree key are derived from Git output and realpath canonicalization
- **AND** no `.git`, gitfile, or `commondir` content is parsed directly

#### Scenario: Discovery environment overrides identity
- **WHEN** Git discovery environment directs the same filesystem hint to a different repository or worktree
- **THEN** the context passes the effective environment to Git discovery
- **AND** keys the result from Git-proven canonical output rather than the configured hint

#### Scenario: Missing or malformed identity fails closed
- **WHEN** the discovery working directory is missing, Git reports a non-repository, output is malformed, or canonicalization fails
- **THEN** the context returns the established discovery failure
- **AND** does not manufacture an identity from the input path

### Requirement: Proven and amortized worktree seeding
The context MAY seed worktree aliases from `git worktree list --porcelain` only after Git has proven the repository identity. Seeded entries MUST remain hints under that repository key, MUST be realpath-canonicalized, and MUST NOT be used when their ownership or effective discovery semantics are uncertain.

#### Scenario: Proven repository seeds linked paths
- **WHEN** a repository identity is already proven and one worktree-list probe will avoid at least one later identity probe
- **THEN** the context may seed canonical linked-worktree hints beneath that repository key
- **AND** the charged seeding probe does not increase the accepted per-repository command budget

#### Scenario: Unproven or stale entry is not trusted
- **WHEN** worktree-list output is requested before identity, names an uncanonicalizable or prunable entry, or conflicts with an environment-sensitive discovery
- **THEN** the context does not use that entry as identity proof
- **AND** direct Git discovery remains required

### Requirement: Scope-correct probe sharing
The context SHALL scope repository facts by repository key, worktree facts by worktree key, and ref-derived facts by repository key plus ref generation. It MUST NOT return a fact cached at a broader scope than the Git semantics of that fact.

#### Scenario: Repository and worktree facts are separated
- **WHEN** linked worktrees request one common repository fact and one checkout-local fact
- **THEN** the repository fact may execute once for their shared repository key
- **AND** the checkout-local fact executes separately for each worktree key

#### Scenario: Ref-derived snapshot is generation-specific
- **WHEN** a ref-derived value was captured at one repository generation
- **THEN** a request at another generation does not reuse it
- **AND** stable non-ref facts may remain reusable within the invocation

### Requirement: Effective-semantics fetch identity
The context SHALL share a targeted fetch across linked worktrees only when repository identity, effective Git configuration/environment fingerprint, remote, source, destination, force/prune behavior, and other fetch options are identical. Fingerprint source values MUST remain internal and MUST NOT expose credentials or configuration secrets.

#### Scenario: Equivalent linked worktrees share a fetch
- **WHEN** linked worktrees have the same repository key, effective-semantics fingerprint, and exact targeted fetch arguments
- **THEN** one Git fetch attempt serves all consumers
- **AND** every consumer observes the same complete classified result

#### Scenario: Different effective semantics do not share
- **WHEN** linked worktrees differ in worktree/conditional configuration, Git config injection, discovery overrides, namespace/storage overrides, transport environment, refspec, remote, or fetch options
- **THEN** their fetch-attempt keys differ
- **AND** each semantic context executes its own fetch

#### Scenario: Fingerprint data remains private
- **WHEN** the context computes a fingerprint from effective configuration and environment
- **THEN** raw values are not emitted in status diagnostics or benchmark artifacts
- **AND** only an internal non-secret fingerprint participates in cache identity

### Requirement: Exact fetch attempts share success and failure
The context SHALL share the in-flight and settled result of one exact fetch attempt, including failure classification, so consumers of that attempt cannot observe contradictory outcomes or trigger implicit duplicate retries.

#### Scenario: Successful attempt is shared
- **WHEN** concurrent consumers request one exact targeted fetch and it succeeds
- **THEN** Git executes the fetch once
- **AND** all consumers observe that successful attempt

#### Scenario: Failed attempt is shared
- **WHEN** concurrent consumers request one exact targeted fetch and it fails with a missing-ref or generic error
- **THEN** Git executes the fetch once
- **AND** all consumers observe the same classified failure
- **AND** no consumer silently retries that logical attempt

### Requirement: Fetch mutation barriers invalidate ref state
The context MUST advance the repository ref generation and invalidate ref-derived probes before starting a fetch and after the fetch settles. The post-fetch barrier MUST run after both success and failure, and independent fetch attempts for one repository MUST be ordered so ref readers can request a well-defined pre- or post-attempt generation.

#### Scenario: Successful fetch invalidates both boundaries
- **WHEN** a targeted fetch succeeds
- **THEN** no pre-fetch or in-flight ref-derived result is reused for post-fetch reporting
- **AND** post-fetch consumers read from the generation established after settlement

#### Scenario: Failed fetch invalidates both boundaries
- **WHEN** a targeted fetch fails after changing or possibly changing repository refs
- **THEN** the context still performs the post-fetch generation advance and invalidation
- **AND** post-failure consumers do not reuse pre-attempt or in-flight ref snapshots

#### Scenario: Distinct mutations are ordered
- **WHEN** different exact fetch attempts target one common repository during an invocation
- **THEN** the context sequences their mutation boundaries
- **AND** identical attempts still share one result

### Requirement: Discovery failures are retry-safe
The context SHALL share one concurrent discovery attempt but MUST evict its rejected promise with compare-and-delete semantics so a later request can retry without deleting a newer attempt.

#### Scenario: Concurrent callers share one failed discovery
- **WHEN** concurrent callers request the same discovery and that attempt rejects
- **THEN** they observe the same failed attempt
- **AND** the rejected entry is removed after settlement

#### Scenario: Later discovery retries safely
- **WHEN** the transient cause is corrected after a rejected discovery
- **THEN** a later request runs a new Git discovery
- **AND** cleanup from the older rejection cannot delete the newer in-flight or successful entry

### Requirement: Stable-plumbing implementation boundary
Production code implementing the context MUST use Git commands and filesystem canonicalization and MUST NOT parse `.git`, gitfiles, `commondir`, loose/packed refs, or object storage directly.

#### Scenario: Implementation is inspected for identity and refs access
- **WHEN** the probe-context production diff is reviewed
- **THEN** repository identity and ref facts are obtained through stable Git plumbing
- **AND** no direct Git-internal filesystem parser is introduced
