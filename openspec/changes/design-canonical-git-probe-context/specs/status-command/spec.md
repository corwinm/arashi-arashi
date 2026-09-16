## ADDED Requirements

### Requirement: Status uses one invocation-scoped Git probe context
Configured and implicit standalone status SHALL create and pass one invocation-scoped Git probe context through repository inspection and Git-remote resolution. Integration MUST begin only after identity, framing, equivalence, failure-retention, fetch-epoch, and linearizable-read contracts pass deterministic tests.

#### Scenario: Configured status shares only eligible work
- **WHEN** configured status evaluates the main repository and selected present children
- **THEN** all inspections use one invocation context
- **AND** configured paths remain discovery hints
- **AND** output order and repository-local failure isolation remain unchanged

#### Scenario: Standalone linked-worktree status separates local facts
- **WHEN** implicit standalone status evaluates a main repository and linked worktrees
- **THEN** repository facts share only at repository scope after positive equivalence proof
- **AND** worktree status remains separate by canonical top level
- **AND** caller/current-worktree semantics remain unchanged

### Requirement: Local status performs no network operation
When `--local` is selected, status MUST NOT start fetch, `ls-remote`, a remote helper, credential helper, SSH, HTTP(S), or any other transport-capable operation. It SHALL inspect only local configuration, refs, and worktree state and MUST NOT claim that remote refs were refreshed.

#### Scenario: Local target exists
- **WHEN** `arashi status --local` can resolve tracking, configured-base, or default targets from local state
- **THEN** it compares only existing local remote-tracking refs
- **AND** starts no transport-capable subprocess or helper

#### Scenario: Local target is absent
- **WHEN** local refs/config do not resolve a comparison target
- **THEN** status reports the established skipped or unavailable local outcome
- **AND** does not contact a remote to fill the gap

### Requirement: Human and JSON freshness remain factual for every outcome
Status SHALL preserve the established JSON freshness object and human diagnostics while truthfully covering successful, failed, skipped, not-applicable, local, and mixed outcomes. Repository JSON SHALL use `mode=refreshed, remoteRefsRefreshed=true` only for successful refresh; failed, skipped, and not-applicable outcomes SHALL be false and retain their established warning/unavailable/skipped details. Local SHALL use `mode=local, remoteRefsRefreshed=false`. Command-level true requires every evaluated present repository participating in the result to have successful refresh; empty and mixed outcome sets are false.

#### Scenario: Every repository refresh succeeds
- **WHEN** every evaluated present repository successfully refreshes its applicable refs
- **THEN** repository and command JSON report refreshed/true
- **AND** human output reports refreshed remote-tracking refs

#### Scenario: Refresh fails
- **WHEN** one repository refresh has a missing-ref, authentication, network, transport, or Git failure
- **THEN** its JSON reports refreshed/false with the established warning or unavailable details
- **AND** human output preserves missing-ref versus stale-tracking diagnostics
- **AND** command freshness is false

#### Scenario: Refresh is skipped
- **WHEN** an applicable role is skipped for an established reason such as detached HEAD or duplicate target
- **THEN** JSON retains that role's skipped reason and does not claim refresh solely from a local comparison
- **AND** command freshness is false unless the role is only a deduplicated view of an exact successfully refreshed target and every repository otherwise succeeded

#### Scenario: Refresh is not applicable
- **WHEN** a repository has no remote-tracking/configured-base/default target to refresh
- **THEN** JSON reports refreshed/false without inventing a network attempt
- **AND** human output uses the established incomplete-or-not-applicable freshness notice without a false failure warning

#### Scenario: Local mode is reported
- **WHEN** the user selects `--local`
- **THEN** repository and command JSON report local/false
- **AND** human output says `Freshness: local remote-tracking refs (no fetch performed)`

#### Scenario: Command outcomes are mixed
- **WHEN** repositories include any mix of successful, failed, skipped, not-applicable, or local outcomes
- **THEN** ordered repository records retain their own truthful details
- **AND** command `remoteRefsRefreshed` is false

### Requirement: Refreshed fixture command ledger is bounded and auditable
For the unchanged clean tracked benchmark fixture on a Git version supporting `%(ahead-behind:HEAD)`, each named repository SHALL start at most seven Arashi-originated root Git sessions in normal refreshed mode and eight in verbose mode. The exact normal ledger is combined identity; effective-config snapshot; one pre-fetch NUL porcelain-v2 status that identifies current branch/upstream; pre-fetch ref snapshot; exact targeted fetch; post-fetch ref snapshot with refreshed comparisons; and at most one symbolic remote-HEAD fallback. Pre-fetch porcelain worktree records remain valid but its `branch.ab` MUST be discarded for refreshed roles. Verbose adds exactly one native status. Every session MUST record executable, argv, canonical CWD, parser owner, purpose, and repository attribution.

#### Scenario: Normal fixture remains within seven
- **WHEN** refreshed normal status runs on the unchanged clean tracked fixture
- **THEN** every named repository uses at most the seven ledger slots
- **AND** current branch/upstream is selected from pre-fetch porcelain plus the charged config snapshot
- **AND** no hidden upstream/config getter, `show-ref`, branch listing, `rev-list`, duplicate fetch, or second porcelain probe runs

#### Scenario: Verbose fixture remains within eight
- **WHEN** refreshed verbose status runs on that fixture
- **THEN** every named repository uses at most eight sessions
- **AND** the only additional session is native `git status`

#### Scenario: Optional seeding is charged
- **WHEN** `worktree list --porcelain` seeds aliases
- **THEN** its session is attributed to that repository and replaces at least as many identity sessions
- **AND** the 7/8 cap remains intact

#### Scenario: Compatibility path needs extra probes
- **WHEN** supported Git lacks the ahead-behind atom or a non-happy-path diagnostic requires fallback probes
- **THEN** correctness is preserved through the specified fallback
- **AND** those sessions are separately attributed and are not represented as satisfying the optimized 7/8 path

### Requirement: Benchmark acceptance uses pinned identical provenance
Optimization evidence MUST compare candidate behavior with base CLI `b648825295a5c342b6920be0585711678377b452`. Before harness edits, evidence MUST capture fixture source hash/version and exact topology/config/remotes; unchanged external adapter source hash/argv; Trace2 rule; OS/architecture and Git/Node/Bun/pnpm versions; build commands/options/environment; executable hashes; warm-up/samples; and metric method. The same adapter MUST invoke both independently built binaries at the public CLI boundary.

#### Scenario: Small and large fixtures improve
- **WHEN** candidate refreshed normal/verbose runs are compared with small 39/42 and large 93/102 aggregate baselines
- **THEN** every candidate aggregate is strictly lower
- **AND** every named repository is strictly lower than its matching base, including representative main 13/14 and child 9/10
- **AND** the clean path meets 7/8

#### Scenario: Counts reconcile
- **WHEN** either binary's result is evaluated
- **THEN** named-repository counts plus explicit unattributed count equal aggregate
- **AND** no unattributed session is unexplained
- **AND** canonical repository paths and semantic output match fixture expectations

#### Scenario: Measurement boundary drifts
- **WHEN** fixture, adapter, command boundary, runtime, build, attribution, freshness, native output, or executable provenance differs
- **THEN** the comparison is invalid
- **AND** it is rerun through the same adapter and boundary

## MODIFIED Requirements

### Requirement: Refresh tracked remote state before reporting branch divergence
The system SHALL refresh the resolved remote-tracking branch for each locally present repository before `arashi status` reports refreshed ahead/behind information, unless the user selects `--local`. In local mode the system SHALL use only existing local remote-tracking refs and SHALL perform no fetch or other network operation.

#### Scenario: Repository has a resolvable upstream branch
- **WHEN** the user runs `arashi status` for a repository whose current branch maps to a remote-tracking branch
- **THEN** the command runs a targeted `git fetch` for that tracking branch before parsing branch divergence output
- **AND** the reported ahead/behind counts reflect the refreshed remote-tracking ref

#### Scenario: Repository has no remote-tracking target
- **WHEN** the user runs `arashi status` for a repository that has no configured remote, no upstream, or no resolvable branch target
- **THEN** the command skips the remote refresh for that repository
- **AND** the command still reports the repository's local branch and working-tree status

#### Scenario: Local mode has a resolvable upstream branch
- **WHEN** the user runs `arashi status --local` for a repository whose current branch maps to an existing remote-tracking branch
- **THEN** the command does not fetch or start any network operation
- **AND** ahead/behind counts are explicitly based on the local remote-tracking ref
- **AND** freshness reports local/false

### Requirement: Refresh default-branch state before reporting behind-default status
The system SHALL resolve each repository's default branch and refresh the compare target before `arashi status` reports refreshed behind-default status, unless the user selects `--local`. Local mode SHALL compare only an existing locally resolvable default target and SHALL perform no fetch or other network operation.

#### Scenario: Repository has a resolvable default branch target
- **WHEN** the user runs `arashi status` for a repository whose current branch is not detached, is not already the default branch, and has a refreshable default-branch ref
- **THEN** the command refreshes that default-branch ref before computing branch divergence
- **AND** any reported behind-default count reflects the refreshed default-branch state

#### Scenario: Repository does not need a default-branch comparison
- **WHEN** the user runs `arashi status` for a repository that is on its default branch or is in a detached HEAD state
- **THEN** the command skips default-branch comparison for that repository
- **AND** the command still reports the repository's local branch and working-tree status

#### Scenario: Local mode resolves a default target
- **WHEN** the user runs `arashi status --local` and an existing local remote-tracking default target is resolvable
- **THEN** status compares against that local ref without fetching or starting another network operation
- **AND** labels the freshness as local rather than refreshed

### Requirement: Compare configured repositories with their effective base

Configured `arashi status` SHALL resolve each selected repository's effective configured base using repository override then root fallback, and compare `HEAD` with the selected remote base ref independently of current-branch upstream and remote-default comparisons. Refreshed mode SHALL refresh that ref before comparison. Local mode SHALL use only an existing local remote-tracking base ref, perform no fetch or other network operation, and report local freshness. When no configured base exists, the established upstream/default status behavior SHALL remain unchanged. Implicit standalone status SHALL remain unchanged.

#### Scenario: Feature branch uses a different upstream from its base

- **WHEN** child `api` configures base `develop` while the current feature branch tracks `origin/feature-api`
- **THEN** status retains the upstream comparison with `origin/feature-api`
- **AND** separately reports ahead/behind state against the refreshed remote `develop` base

#### Scenario: Repository override and root fallback are independent

- **WHEN** root base is `main`, child `api` overrides it with `develop`, and selected child `web` has no override
- **THEN** status compares `api` with its selected remote `develop`
- **AND** compares `web` with its selected remote `main`

#### Scenario: No configured base exists

- **WHEN** a configured repository has neither an owning override nor root `baseBranch`
- **THEN** status performs no configured-base comparison for that repository
- **AND** preserves its upstream and remote-default reporting

#### Scenario: Detached HEAD is inspected safely

- **WHEN** a selected configured repository is in detached HEAD state and has an effective base
- **THEN** status preserves local detached and working-tree status
- **AND** represents the configured-base comparison as skipped or unavailable with reason `detached-head`
- **AND** does not claim branch lag or fall back to the remote default

#### Scenario: Local mode compares configured base without refresh

- **WHEN** a selected configured repository has an effective base and the user runs `arashi status --local`
- **THEN** status uses only the existing local remote-tracking base ref
- **AND** performs no fetch or other network operation
- **AND** reports unavailable/skipped when that local ref is absent rather than contacting the remote

### Requirement: De-duplicate configured-base and remote-default target work

When configured base and detected remote default resolve to the same selected remote ref, refreshed status SHALL fetch and compare that target at most once per repository. Local status SHALL fetch it zero times and compare the existing local ref at most once. Human output MUST avoid duplicate base/default lines while structured output MUST preserve both role records and make their common target unambiguous.

#### Scenario: Base and default are the same target

- **WHEN** configured base and detected remote default both resolve to `origin/main`
- **THEN** status performs one targeted refresh and one divergence computation for `origin/main`
- **AND** human output emits one combined `Base/default` diagnostic where a diagnostic is needed
- **AND** JSON exposes separate configured-base and default role objects that identify the shared target

#### Scenario: Base and default differ

- **WHEN** configured base resolves to `origin/develop` and remote default resolves to `origin/main`
- **THEN** status refreshes and compares each target independently
- **AND** human and structured output retain distinct base and default information

#### Scenario: Local base and default share a target

- **WHEN** configured base and detected remote default both resolve to one existing local remote-tracking ref under `--local`
- **THEN** status performs no fetch or other network operation
- **AND** computes divergence from that local ref at most once
- **AND** preserves separate structured role records and one combined human diagnostic
