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
For every participant finish SHALL report clean/dirty/missing/unavailable state, branch and exact HEAD OID, upstream presence/ahead/behind or unknown, configured effective base branch/source/ref/OID or omitted, integration state/source/freshness, dirty and unpublished discard exposure, and per-repository blockers and warnings. It MUST NOT infer a historical creation base from current configuration: invocation-only create/clone base overrides need not persist. No configured base SHALL NOT implicitly become the default branch. An omitted base MUST remain unknown until an interactive operator names the repository-specific remote and full base ref; record this as an operator-selected current target, not historical policy. Manual completion judgment MUST name such a target; non-TTY/JSON cannot choose one in v1. Uninspectable values MUST be null/unknown, not zero or success.

#### Scenario: Create override was not persisted
- **WHEN** a worktree was created with `--repo-base` but current config has a different base
- **THEN** finish labels the current configured base as current policy, not historical creation policy
- **AND** compares against current policy or reports an explicit uncertainty

#### Scenario: Upstream is absent or ahead
- **WHEN** the local tip has no upstream or is ahead of it
- **THEN** finish reports unpublished work independently of Git/PR integration proof
- **AND** cleanup requires discard consent

### Requirement: Finish refreshes remote evidence and proves exact integration
Finish SHALL refresh each participant's relevant remote base and upstream before evaluation and pin remote/ref/OID identity in a disposable private Git object store, without changing managed refs, index, config or worktree. Failed refresh MUST NOT use stale tracking refs as proof; it SHALL report unknown evidence with a repository-specific reason. Git proof SHALL require exact HEAD ancestry of the fetched target OID with replace refs/grafts disabled and complete non-shallow object history; incomplete/suspect graphs are unknown. Non-ancestry and ahead counts are unknown absent other proof, never affirmative unmerged proof. GitHub PR proof SHALL require authenticated historical provenance that the inspected HEAD was the PR head *at merge*, exact head repository and branch, base repository/ref, merged status/time and a merge commit reachable from freshly fetched base; current headRefOid or presence in a PR commit list alone is insufficient. Ambiguous/multiple candidates, unavailable historical provenance and incomplete queries are unknown. Open PR, missing PR, deleted remote branch, patch equivalence and default-branch assumptions are not negative or positive integration proof. Other forges require manual confirmation.

#### Scenario: Squash PR uniquely matches exact head
- **WHEN** a unique merged GitHub PR has authenticated merge-time head provenance matching the participant HEAD, exact head/base identities and a merge commit reachable from refreshed base
- **THEN** integration is proven with PR metadata and source, while the report does not claim that content cannot later be reverted

#### Scenario: Multiple candidate PRs
- **WHEN** multiple qualifying PRs or conflicting head/base metadata match
- **THEN** finish reports unknown rather than selecting a favorable PR

#### Scenario: Fetch fails but cached tracking ref suggests merged
- **WHEN** remote refresh fails and old local tracking refs contain the work
- **THEN** finish reports failed refresh and unknown completion, never automatic proof

#### Scenario: Negative ancestry and mutable PR head
- **WHEN** the local tip is ahead of base, and a squash PR's current headRefOid matches but no authenticated merge-time head binding is available
- **THEN** finish reports unknown rather than not-finished or proven

#### Scenario: Git history substitution or shallow clone
- **WHEN** a replace ref, graft or shallow/incomplete graph could alter the ancestry test
- **THEN** finish cannot call that ancestry proof and reports unknown

### Requirement: Finish separates manual completion from discard consent
Finish SHALL offer one interactive grouped completion confirmation for participants whose completion remains unknown, retaining each reason and explicitly named target; it SHALL separately require interactive discard consent for dirty or unpublished participants. Positive hard blockers and ambiguous/unavailable identity MUST block rather than be silently overridden; negative ancestry or an open PR alone is not such a blocker. `--force` SHALL authorize discard and normal remove confirmation only, not manual completion. JSON and non-TTY SHALL NOT accept manual-completion confirmation in v1; when needed they SHALL return a report and a confirmation-required error. Decline SHALL leave worktrees/branches intact.

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
Finish SHALL present a deterministic complete report and the coordinated remove typed plan before mutation. `--dry-run` SHALL expose the same assessed participants, reasons and prospective ordered worktree/branch operations, keep-branches policy and hook previews, without running hooks, deleting branches/worktrees, or changing managed workspace refs/config/index (including incidental Git status index refresh). Read-only network requests and isolated disposable fetch state MAY be used for fresh evidence. Finish MUST refuse a remove plan with extra/unassessed targets, missing participants, unplanned descendants or unrelated branch deletions; it SHALL not equate a remove success with completion proof.

#### Scenario: Blocked preview
- **WHEN** one participant is dirty, another has unknown integration and a third is absent
- **THEN** preview returns the complete sorted report with readiness and blockers, and no cleanup hook or destructive operation runs

#### Scenario: Remove plan expands to a different branch
- **WHEN** remove would include a nested worktree on another branch
- **THEN** finish assesses it before presenting the plan
- **AND** refuses any destructive operation not included in that assessment

### Requirement: Finish invalidates stale accepted evidence before remove mutation
After confirmations and after acquiring the shared cross-process workspace/common-dir lock, and after all remove `pre-remove` hooks while holding that lock and before any detach/worktree/branch mutation, finish SHALL revalidate exact configuration policy, participant set/registration/physical path identity, HEAD/branch/dirty/upstream/base identities and OIDs, relevant PR provenance/status, and the full closed typed remove plan and hook target set. Configured remove, prune and create mutation paths sharing these worktrees SHALL participate in the same ordered lock; hold it through remove confirmation, hooks, mutation and finalization, then release even on error. External actors/remote changes do not honor it; no atomic check-to-delete guarantee is claimed. Detected change or failed required local observation MUST abort destructive operations with a structured invalidation report. A repeated remote/PR read failure MAY retain only the same explicitly manually confirmed unknown with unchanged named target, local identity and failure class; preserve inability to prove remote freshness. Newly successful contradictory evidence MUST invalidate. The internal typed remove executor SHALL invoke an optional finish-only post-hook guard; ordinary remove evidence policy SHALL remain unchanged. Hook side effects already performed MUST be reported honestly.

#### Scenario: Hook changes base or local head
- **WHEN** a successful `pre-remove` hook modifies a participant HEAD, remote base, config or target registration
- **THEN** the finish callback rejects the stale plan before the first destructive operation
- **AND** the hook outcome remains visible

#### Scenario: Remove partially fails
- **WHEN** a descendant removal fails after mutation begins
- **THEN** finish preserves the established remove operation and post-hook ledgers, descendant-before-ancestor protection and partial-failure result
- **AND** it does not claim atomic rollback or complete cleanup

### Requirement: Finish reports stable assessment and cleanup outcomes
Human and JSON output SHALL order parent first, children by configured key and reasons by stable code regardless of asynchronous inspection order. JSON SHALL use one standard `schemaVersion: 1`, `command: "finish"` envelope, with report at `data` on success or `error.details` on failure; it SHALL distinguish readiness `ready|blocked|unknown`, integration `proven|not-finished|unknown|manually-confirmed`, confirmation states, nullable observations, nonparticipants, and safe projections of typed pending plan/executed result. Never directly serialize raw remove ledgers, hook stdout/stderr, exception text, Git stderr, raw URLs/config/env, commit or PR bodies or unscreened path/branch/hook labels; retain typed attribution/status with stable codes and redact unsafe labels. Preview completion (even blocked) and successful cleanup exit `0`; required/declined selection or consent exits `2`; failed evidence/config/revalidation, ineligible cleanup and removal failure exit `1`. Structured failure SHALL preserve the safe report whenever target resolution succeeded.

#### Scenario: Parallel inspection completes in reverse order
- **WHEN** repository reads resolve in different orders for identical state
- **THEN** assessment JSON and human repository/reason/operation order are stable

#### Scenario: Noninteractive cleanup cannot be authorized
- **WHEN** JSON cleanup needs manual completion proof or discard consent without `--force`
- **THEN** it emits exactly one failure envelope, exits `2`, includes the available report and performs no cleanup

#### Scenario: Cleanup fails after partial mutation
- **WHEN** remove returns partial operations and post-hook failures
- **THEN** one finish failure envelope retains the original assessment and remove ledger with exit `1`
