## ADDED Requirements

### Requirement: Finish selects one configured workspace
`aw finish [target]` SHALL target one registered non-main coordinated parent, including when invoked from its registered child. In main, omitted human TTY target SHALL open a single-select picker; explicit fuzzy/branch/path targets MUST identify exactly one parent even across sibling workspaces. Non-TTY/JSON SHALL require an explicit unambiguous target. Selection MUST NOT itself authorize cleanup. Finish SHALL inventory parent and every configured child present at its configured location regardless of branch, report absent children as nonparticipants, and block cleanup for inaccessible, duplicated, unregistered, escaped or missing-canonical-clone participants. Standalone/main deletion is forbidden.

#### Scenario: Picker selects but does not confirm cleanup
- **WHEN** a human in main selects a parent from the picker with `--dry-run`
- **THEN** finish assesses that parent without cleanup, policy-selection, completion, discard or remove prompts

#### Scenario: Sibling branch ambiguity
- **WHEN** an explicit branch/fuzzy target matches two registered parents
- **THEN** finish refuses rather than deleting both or selecting arbitrarily

#### Scenario: Partial workspace
- **WHEN** a child on a different branch is registered and another configured child is absent
- **THEN** the first participates and the latter is reported as a nonparticipant

### Requirement: Finish distinguishes current target, integration and discard evidence
For each participant finish SHALL report exact HEAD/branch, staged/unstaged/untracked state, upstream OID/ahead/behind or unknown, effective configured base branch/source/ref/OID or omitted, integration state/source/freshness and stable reasons. Repository base policy overrides workspace policy; omitted MUST NOT silently become a default branch. Creation overrides MUST NOT be represented as historical policy. Execution MAY let an interactive operator name a per-repository remote and full base ref for omitted policy before assessment/manual judgment, without persisting it; preview MUST report omitted policy as unknown without prompting, and JSON/non-TTY cannot select a target in v1. Missing observations are unknown, never zero. Dirty/untracked and absent/ahead upstream SHALL independently require discard consent.

#### Scenario: Create override is not persisted
- **WHEN** a worktree was created with an invocation-only base override
- **THEN** finish labels only current effective policy and does not claim the override was historical policy

### Requirement: Finish uses fresh, conservative integration evidence
Finish SHALL fetch explicit relevant base/upstream refs into a private disposable Git repository without mutating managed refs, config, index or worktrees; failed refresh MUST NOT promote stale tracking refs to proof. Fetch and local HEAD transport failure or incomplete history SHALL make ancestry unknown. Exact inspected HEAD ancestry of the fresh named base OID in a complete graph, with replace refs/grafts disabled, MAY prove integration. Non-ancestry, ahead counts, open/no PR, deleted branch, patch equivalence and default-branch assumptions MUST NOT prove either integration or affirmative non-integration. Reverts are not detected. Finish MAY attempt `gh` for authenticated, unambiguous, paginated GitHub correlation, but MUST NOT claim a squash/rebase PR proves this inspected HEAD was integrated unless an actual verifiable immutable merge-time head binding exists, with matching head/base identities and reachable merge commit. Current `headRefOid`, commit-list membership or inferred merge-parent OIDs do not supply that binding. If `gh` cannot provide it, or pagination/auth/identity is uncertain, report unknown and allow interactive grouped manual judgment. Other forges are unknown absent Git ancestry proof.

#### Scenario: Fresh exact ancestry
- **WHEN** the inspected HEAD is an ancestor of a freshly fetched configured base in a complete graph
- **THEN** finish reports proven integration and states that later reverts were not checked

#### Scenario: Squash correlation without historical binding
- **WHEN** `gh` finds a matching merged squash PR but exposes only mutable current head metadata
- **THEN** finish reports unknown and offers manual judgment on interactive execution, not automatic proof

#### Scenario: Fetch failure with cached tracking ref
- **WHEN** refresh fails but a stale tracking ref contains the HEAD
- **THEN** finish reports unknown rather than using the cached ref as proof

### Requirement: Finish separates completion judgment and discard consent
Interactive execution SHALL group unknown completion judgments by repository, named target and reason, recording acceptance as `manually-confirmed`, not `proven`. Hard topology/identity/plan blockers cannot be waived. Discard consent SHALL be separate for dirty/unpublished participants. `--force` SHALL cover discard and ordinary remove confirmation only. JSON/non-TTY SHALL NOT manually confirm unknown completion in v1; a declined judgment/consent SHALL leave worktrees and branches untouched.

#### Scenario: Force cannot prove completion
- **WHEN** non-TTY execution supplies `--force` with unknown integration
- **THEN** it returns confirmation-required without cleanup

### Requirement: Finish preview is nonmutating and scope-closed
After selection `--dry-run` SHALL report all participants/reasons and prospective exact ordered remove worktree/branch operations, hook previews and keep-branches policy without cleanup prompts, hooks, detach, branch/worktree deletion or managed ref/config/index/worktree writes (including incidental status index refresh). Disposable fetch state and network metadata refresh are permitted and disclosed. An invalid scope SHALL have a null plan. Finish SHALL reject extra/unassessed targets, unrelated branches, missing participants or unplanned descendants, and SHALL not treat a remove plan as completion proof.

#### Scenario: Blocked preview
- **WHEN** one participant is dirty and another has unknown integration
- **THEN** preview returns a full report without asking for cleanup consent or running hooks

### Requirement: Finish revalidates at a narrow remove pre-mutation gate
Finish SHALL revalidate accepted configuration/policy, participant and physical registration identities, HEAD/branch/dirty/upstream, fresh base/PR observations and exact remove actions/hook targets after execution consent and again through an internal finish-only callback after successful `pre-remove` hooks and remove's descendant refresh, before the first destructive detach/worktree/branch action. Changes or failed required local observations SHALL abort mutation with structured invalidation and retain completed hook outcomes. Repeated remote failure MAY retain only an unchanged explicit manual judgment with identical named target, local identity and failure class while warning that freshness cannot be proved; successful contradictory refresh invalidates. Finish SHALL reuse ordinary remove ordering, dirty/confirmation protections, hooks, branch behavior and partial-failure semantics; no rollback is promised. No universal cross-command lock or add/delete/create/prune refactor is required. External actors and concurrent commands can race after the final check, so the gate does not guarantee atomic deletion safety.

#### Scenario: Pre-remove hook changes evidence
- **WHEN** a successful pre-remove hook changes participant HEAD or configured base
- **THEN** finish aborts before deletion and reports the already-run hook outcome

#### Scenario: Partial failure after mutation
- **WHEN** a descendant removal fails after execution starts
- **THEN** established remove partial-failure and ancestor protections remain, without a rollback claim

### Requirement: Finish reports safe deterministic outcomes
Human and JSON output SHALL order parent first, children by configured key and reasons by stable code. JSON SHALL use one `schemaVersion: 1`, `command: "finish"` envelope with report under success `data` or failure `error.details`, readiness `ready|blocked|unknown`, integration `proven|not-finished|unknown|manually-confirmed`, nullable unknown facts and safe cleanup plan/result projections. Raw remove ledgers, hook stdout/stderr, Git/exception text, URL/config/environment, commit/PR bodies and unscreened labels MUST NOT leak. Completed preview, even blocked/unknown, and successful cleanup exit 0; required/declined selection/consent exits 2; ineligible mutation, invalidation or remove failure exits 1. A failure after target resolution retains a safe report.

#### Scenario: JSON mutation needs human judgment
- **WHEN** JSON execution finds unknown completion
- **THEN** one failure envelope retains the assessment, exits 2 and performs no cleanup
