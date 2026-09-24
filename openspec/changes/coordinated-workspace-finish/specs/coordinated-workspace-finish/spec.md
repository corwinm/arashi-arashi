## ADDED Requirements

### Requirement: Finish resolves exactly one configured coordinated workspace
`aw finish [target]` SHALL target one non-main registered coordinated parent. A caller inside that parent or its registered child SHALL target that parent; from main an omitted human target SHALL use a single-select picker and an explicit fuzzy/branch/path target SHALL resolve uniquely. Non-TTY/JSON SHALL require an explicit unambiguous target. The command MUST NOT expand ambiguity into a batch. The assessed set SHALL include parent and every configured child with a worktree at its configured position beneath that parent, independent of child branch; configured children without a worktree SHALL appear as nonparticipants. Present but unregistered, duplicated, inaccessible or ambiguous child locations SHALL block cleanup rather than disappear from the set. Standalone and main-worktree deletion SHALL be rejected.

#### Scenario: Same branch occurs in two workspaces
- **WHEN** two registered parents match an explicit branch or fuzzy target
- **THEN** finish refuses before assessment until one exact parent is selected
- **AND** it does not infer both as one workspace

#### Scenario: Partial workspace has differently named child
- **WHEN** a parent contains a registered child on another branch and a configured child with no worktree
- **THEN** the former is assessed and the latter is listed as nonparticipant
- **AND** branch equality is not required for participation

#### Scenario: Configured child is present but inaccessible
- **WHEN** a configured child directory exists but its canonical repository or Git registration cannot be verified
- **THEN** the child is an unavailable required participant and no cleanup runs

### Requirement: Finish reports current, distinct evidence roles
For every participant finish SHALL report clean/dirty/missing/unavailable state, branch and exact HEAD OID, upstream presence/ahead/behind or unknown, configured effective base branch/source/ref/OID or omitted, integration state/source/freshness, dirty and unpublished discard exposure, and per-repository blockers and warnings. It MUST NOT infer a historical creation base from current configuration: invocation-only create/clone base overrides need not persist. No configured base SHALL NOT implicitly become the default branch. Uninspectable values MUST be null/unknown, not zero or success.

#### Scenario: Create override was not persisted
- **WHEN** a worktree was created with `--repo-base` but current config has a different base
- **THEN** finish labels the current configured base as current policy, not historical creation policy
- **AND** compares against current policy or reports an explicit uncertainty

#### Scenario: Upstream is absent or ahead
- **WHEN** the local tip has no upstream or is ahead of it
- **THEN** finish reports unpublished work independently of Git/PR integration proof
- **AND** cleanup requires discard consent

### Requirement: Finish refreshes remote evidence and proves exact integration
Finish SHALL refresh each participant's relevant remote base and upstream before evaluation and pin remote/ref/OID identity. Failed refresh MUST NOT use stale tracking refs as proof; it SHALL report unknown evidence with a repository-specific reason. Git proof SHALL require exact HEAD ancestry of the fetched configured base OID. GitHub PR proof SHALL require authenticated exact head repository, branch, head OID, base repository/ref, merged status/time, and a merge commit reachable from freshly fetched base; ambiguous/multiple matching PRs and incomplete queries are unknown. A known exact open PR with no other proof is not finished. Missing PR, deleted remote branch, patch equivalence, and default-branch assumptions are not proof. Other forges require manual confirmation.

#### Scenario: Squash PR uniquely matches exact head
- **WHEN** a unique merged GitHub PR has the exact participant head and effective base identities and its merge commit is reachable from refreshed base
- **THEN** integration is proven with PR metadata and source, while the report does not claim that content cannot later be reverted

#### Scenario: Multiple candidate PRs
- **WHEN** multiple qualifying PRs or conflicting head/base metadata match
- **THEN** finish reports unknown rather than selecting a favorable PR

#### Scenario: Fetch fails but cached tracking ref suggests merged
- **WHEN** remote refresh fails and old local tracking refs contain the work
- **THEN** finish reports failed refresh and unknown completion, never automatic proof

### Requirement: Finish separates manual completion from discard consent
Finish SHALL offer one interactive grouped completion confirmation for participants whose completion remains unknown, retaining each reason; it SHALL separately require interactive discard consent for dirty or unpublished participants. Known unmerged work and ambiguous/unavailable identity MUST block rather than be silently overridden. `--force` SHALL authorize discard and normal remove confirmation only, not manual completion. JSON and non-TTY SHALL NOT accept manual-completion confirmation in v1; when needed they SHALL return a report and a confirmation-required error. Decline SHALL leave worktrees/branches intact.

#### Scenario: Mixed unknown completion reasons
- **WHEN** two repositories need manual judgment for different reasons
- **THEN** one prompt identifies both and their distinct reasons
- **AND** accepting it records `manually-confirmed`, not `proven`

#### Scenario: Force with unknown integration
- **WHEN** a non-interactive invocation supplies `--force` but completion remains unknown
- **THEN** it returns a nonzero confirmation-required/unknown result and does not remove anything

#### Scenario: Dirty proven workspace
- **WHEN** all participants are proven integrated but one is dirty
- **THEN** cleanup requires separate discard consent or non-interactive `--force`

### Requirement: Finish previews exact cleanup scope without destruction
Finish SHALL present a deterministic complete report and the existing coordinated remove plan before mutation. `--dry-run` SHALL expose the same assessed participants, reasons and prospective ordered worktree/branch operations, keep-branches policy and hook previews, without running hooks, deleting branches/worktrees, or changing managed workspace refs/config/index. Read-only network requests and isolated disposable fetch state MAY be used for fresh evidence. Finish MUST refuse a remove plan with extra/unassessed targets, missing participants, unplanned descendants or unrelated branch deletions; it SHALL not equate a remove success with completion proof.

#### Scenario: Blocked preview
- **WHEN** one participant is dirty, another has unknown integration and a third is absent
- **THEN** preview returns the complete sorted report with readiness and blockers, and no cleanup hook or destructive operation runs

#### Scenario: Remove plan expands to a different branch
- **WHEN** remove would include a nested worktree on another branch
- **THEN** finish assesses it before presenting the plan
- **AND** refuses any destructive operation not included in that assessment

### Requirement: Finish invalidates stale accepted evidence before remove mutation
After confirmations and before entering removal, and after all remove `pre-remove` hooks inside a finish/remove coordination barrier established for finish (ordinary remove has no general lock today) and before any detach/worktree/branch mutation, finish SHALL revalidate exact configuration policy, participant set/registration/path identity, HEAD/branch/dirty/upstream/base identities and OIDs, relevant PR metadata and status, and the full closed remove plan and hook target set. Detected change or failed required local observation MUST abort destructive operations with a structured invalidation report. A repeated remote/PR read failure MAY retain only the same explicitly manually confirmed unknown, with unchanged locally observable identity and failure class; the report MUST preserve the inability to prove remote freshness. Newly successful contradictory evidence MUST invalidate. An optional finish-only callback in the existing remove execution path SHALL provide the post-hook gate; ordinary remove behavior SHALL remain unchanged. Hook side effects already performed MUST be reported honestly.

#### Scenario: Hook changes base or local head
- **WHEN** a successful `pre-remove` hook modifies a participant HEAD, remote base, config or target registration
- **THEN** the finish callback rejects the stale plan before the first destructive operation
- **AND** the hook outcome remains visible

#### Scenario: Remove partially fails
- **WHEN** a descendant removal fails after mutation begins
- **THEN** finish preserves the established remove operation and post-hook ledgers, descendant-before-ancestor protection and partial-failure result
- **AND** it does not claim atomic rollback or complete cleanup

### Requirement: Finish reports stable assessment and cleanup outcomes
Human and JSON output SHALL order parent first, children by configured key and reasons by stable code regardless of asynchronous inspection order. JSON SHALL use one standard `schemaVersion: 1`, `command: "finish"` envelope, with report at `data` on success or `error.details` on failure; it SHALL distinguish readiness `ready|blocked|unknown`, integration `proven|not-finished|unknown|manually-confirmed`, confirmation states, nullable observations, nonparticipants, blockers/warnings, remove's pending plan and executed result. Preview completion (even blocked) and successful cleanup exit `0`; required/declined selection or consent exits `2`; failed evidence/config/revalidation, ineligible cleanup and removal failure exit `1`. Structured failure SHALL preserve the report whenever target resolution succeeded. No PR body, commit message, credentials or hook source shall be serialized.

#### Scenario: Parallel inspection completes in reverse order
- **WHEN** repository reads resolve in different orders for identical state
- **THEN** assessment JSON and human repository/reason/operation order are stable

#### Scenario: Noninteractive cleanup cannot be authorized
- **WHEN** JSON cleanup needs manual completion proof or discard consent without `--force`
- **THEN** it emits exactly one failure envelope, exits `2`, includes the available report and performs no cleanup

#### Scenario: Cleanup fails after partial mutation
- **WHEN** remove returns partial operations and post-hook failures
- **THEN** one finish failure envelope retains the original assessment and remove ledger with exit `1`
