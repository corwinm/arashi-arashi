## ADDED Requirements

### Requirement: Status uses the invocation-scoped Git probe context
Configured and implicit standalone status SHALL create and pass one invocation-scoped Git probe context through repository inspection and Git-remote resolution. Status MUST integrate the context only after its identity, lifecycle, fetch, invalidation, and retry contracts pass deterministic tests.

#### Scenario: Configured status shares eligible work
- **WHEN** configured status evaluates the main repository and selected present children
- **THEN** all repository inspections use one invocation context
- **AND** configured paths are supplied only as discovery hints
- **AND** repository output order and repository-local failure isolation remain unchanged

#### Scenario: Standalone linked-worktree status preserves caller context
- **WHEN** implicit standalone status evaluates a main repository and linked worktrees
- **THEN** repository-scoped facts may share by canonical common-directory identity
- **AND** worktree-local status remains separate by canonical top-level identity
- **AND** caller/current-worktree semantics remain unchanged

### Requirement: Status preserves all established refresh and output semantics
Probe sharing MUST preserve the status behavior delivered by #371: local mode performs no fetch; refreshed mode orders target resolution and fetch before refreshed divergence reporting; freshness is factual; porcelain v2 remains NUL-delimited; configured-base, upstream, default-branch, missing-ref, stale-tracking, detached/unborn HEAD, bare-workspace, missing-repository, JSON warning/error, and native verbose semantics remain unchanged.

#### Scenario: Refreshed status reports post-fetch state
- **WHEN** refreshed status has a resolvable tracking, configured-base, or default target
- **THEN** it establishes the target and pre-fetch ref view, performs or awaits the exact targeted fetch, crosses the post-fetch generation barrier, and reports from post-fetch state
- **AND** a shared fetch failure retains the established per-repository warning or unavailable outcome

#### Scenario: Local status remains network-free
- **WHEN** the user runs status with `--local`
- **THEN** the invocation context performs no fetch
- **AND** command and repository freshness continue to report local remote-tracking refs without claiming refresh

#### Scenario: Porcelain and verbose outputs remain native
- **WHEN** status inspects paths containing tabs, newlines, Unicode, rename/copy origins, conflicts, ignored files, type changes, detached HEAD, or unborn HEAD
- **THEN** structured status continues to use NUL-delimited porcelain v2 without semantic loss
- **AND** verbose mode adds one native `git status` result rather than reconstructing Git's human diagnostics

#### Scenario: Default remote HEAD fallback remains deterministic
- **WHEN** status must resolve a remote default branch
- **THEN** it prefers the selected upstream remote, then `origin`, then a unique unambiguous remote HEAD
- **AND** unresolved or ambiguous cases preserve their established diagnostics without arbitrary selection

#### Scenario: Missing repositories remain unprobed
- **WHEN** a configured repository path is missing
- **THEN** status preserves established default/short omission and verbose/JSON clone guidance
- **AND** it does not manufacture canonical identity or run fetch/status probes for that path

### Requirement: Refreshed fixture Git-command budget is bounded
For the unchanged clean tracked benchmark fixtures, refreshed status SHALL have a conservative maximum of seven Arashi-originated root Git sessions per named repository in normal mode and eight in verbose mode. The normal budget SHALL cover combined identity, effective configuration/environment snapshot, pre-fetch ref snapshot, exact targeted fetch, post-fetch ref snapshot, porcelain-v2 status, and symbolic remote-HEAD fallback. Verbose mode SHALL add only native verbose status. Optional worktree-list seeding MUST be charged and amortized without exceeding the same cap.

#### Scenario: Normal refreshed fixture stays within seven
- **WHEN** the candidate runs refreshed normal status on the unchanged clean tracked fixture
- **THEN** each named repository starts at most seven Arashi-originated root Git sessions for the budgeted sequence
- **AND** no hidden duplicate fetch, repeated config lookup, second porcelain status, or unexplained comparison probe exceeds the cap

#### Scenario: Verbose refreshed fixture stays within eight
- **WHEN** the candidate runs refreshed verbose status on the unchanged clean tracked fixture
- **THEN** each named repository starts at most eight Arashi-originated root Git sessions
- **AND** the one additional session is native `git status`

#### Scenario: Optional worktree seeding is amortized
- **WHEN** status uses `git worktree list --porcelain` to seed aliases
- **THEN** that root session is included in the named repository count
- **AND** it removes at least as many direct identity sessions
- **AND** the 7/8 cap is preserved

### Requirement: Status benchmark acceptance proves strict reductions
The candidate MUST use the same fixture definition, topology, configuration, command boundary, runtime, and Trace2 attribution method as the recorded base. Refreshed normal and verbose status MUST start strictly fewer Arashi-originated root Git sessions for every named repository and in aggregate on both small and large fixtures, and candidate runs MUST contain no unexplained unattributed sessions. All status semantics asserted by the fixture MUST remain unchanged.

#### Scenario: Small fixture improves normal and verbose counts
- **WHEN** candidate refreshed normal and verbose results are compared with small-fixture baselines of 39 and 42 aggregate Git starts
- **THEN** each candidate aggregate is strictly lower than its matching baseline
- **AND** every named repository is strictly lower than its own matching baseline
- **AND** representative main 13/14 and child 9/10 normal/verbose baselines are not replaced by aggregate-only evidence

#### Scenario: Large fixture improves normal and verbose counts
- **WHEN** candidate refreshed normal and verbose results are compared with large-fixture baselines of 93 and 102 aggregate Git starts
- **THEN** each candidate aggregate is strictly lower than its matching baseline
- **AND** every named repository is strictly lower than its own matching baseline
- **AND** the larger topology shows no per-repository slope regression hidden by startup savings

#### Scenario: Attribution totals reconcile
- **WHEN** a candidate benchmark result is evaluated
- **THEN** named-repository counts plus the explicit unattributed count equal the aggregate root-session count
- **AND** there are no unexplained unattributed sessions
- **AND** repository paths and semantic status output match the unchanged fixture expectations

#### Scenario: Boundary drift invalidates comparison
- **WHEN** fixture topology, configuration, command boundary, runtime provenance, Trace2 root-session rule, or semantic assertions differ between base and candidate
- **THEN** the result is not accepted as optimization evidence
- **AND** the comparison is rerun at the same boundary
