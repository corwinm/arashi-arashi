# Implementation tasks (not started; design-only change)

## 0. Exact-head design gates
- [ ] Obtain independent semantic/evidence and remove-architecture review of this design at its exact signed HEAD before implementation; resolve isolated fetch, exact-path/branch handoff, GitHub pagination/head provenance, and callback/lock placement. Corrections require new exact-head reviews, not inherited approval.
- [ ] Close executable acceptance matrix below before production code; test with real temporary Git repos/remotes and a controlled GitHub adapter, not hand-written successful API responses. Pin fixture, collector, binary and runtime provenance for acceptance. Update docs, generated contract and completion audit in owning repos only; link child PRs to #374 and each other.

## 1. Pre-implementation RED: selection and scope
- [ ] RED exact contextual parent, nested child, main picker, explicit fuzzy unique, ambiguity, sibling same branch, path alias/symlink escape, detached/prunable worktree, standalone, non-TTY missing target and main-worktree protection.
- [ ] RED parent + complete configured child inventory: different branches, absent nonparticipant, missing canonical clone with present child path, unregistered/duplicate descendant, inaccessible checkout, transitive nested child. Compare assessed identities against exact remove dry-run worktree and branch actions; reject extra branch actions and no-op scope.

## 2. Pre-implementation RED: freshness and Git
- [ ] RED per-repo base precedence `repo config > root config > omitted`; prove CLI create/clone overrides are not falsely reported as historical base; reject default-branch substitution. Mixed remotes, base names and upstream refs.
- [ ] RED isolated fetch against mutable test remote: explicit refspec, failed fetch despite stale tracking ref, missing base/upstream, remote race, changed OID, credentials-safe output; preview leaves managed config/refs/index/worktrees unchanged and disposes temporary state.
- [ ] RED exact HEAD ancestry positive (ordinary merge/fast-forward), negative (ahead), squash without direct ancestry, revert warning and non-proofs (matching title/patch/deleted branch). RED missing upstream, ahead upstream, divergent upstream, dirty staged/unstaged/untracked and inspection failure independently from integration.

## 3. Pre-implementation RED: GitHub correlation
- [ ] RED authenticated matching head/base repository identities, branch and exact head OID, mergedAt plus merge commit reachable from freshly fetched base; squash and rebase PR; fork collision, branch reuse, moved head, wrong base, unmerged PR, multiple qualifying PRs, conflicting metadata, pagination, truncated result, gh auth/rate/network failure, non-GitHub remote. Assert unknown rather than favorable or cached proof.
- [ ] RED grouped unknown confirmation with reasons; failed fetch and other forge explicitly manually confirmable, without reclassifying proof; repeated failed refresh preserves documented uncertainty, newly successful contradictory refresh invalidates; known unmerged and local identity ambiguity cannot be overridden.

## 4. Pre-implementation RED: confirmation, report and preview
- [ ] RED dirty/unpublished separate discard prompt, `--force` only discard/removal consent, unknown plus force blocks non-TTY/JSON, declined manual/discard/remove prompt has no destructive effect, clean proven successful handoff. Reject unsupported options/bypass aliases.
- [ ] RED full human and schemaVersion-1 JSON assessment for ready/blocked/unknown, preview `ok:true` with blocked readiness, mutate `ok:false` with full details and distinct exits `0/1/2`; stable parent-first/child-key/reason order under reversed completion order, nullable unknowns, one stdout document, secret canaries in config/remote/PR/commit/hook content absent.
- [ ] RED preview versus real remove planning parity: child-first plan, hook preview without invocation, branch retention default deletion and `--keep-branches`, no mutating operation from preview, no extra target/branch deletion and no invented cleanup result.

## 5. Pre-implementation RED: accepted-plan invalidation and remove integration
- [ ] RED revalidation after confirmation and **after pre-remove hooks**: config bytes/base policy, local HEAD/branch/dirty, upstream/base identity/OID, PR status/head/merge, remote advance, missing remote, registered topology, hook targets and exact remove plan. Assert no detach/worktree/branch mutation after invalidation and retain hook outcome; preserve ordinary remove unaffected.
- [ ] RED simultaneous finish/remove/prune or external actor before first operation; establish and test finish-specific coordination barrier plus residual-race reporting, without claiming an existing remove lock. RED hook failure, descendant failure, independent success, blocked ancestor, branch deletion failure, post-remove failure, partial-failure JSON ledger, no fabricated rollback and safe retry guidance.

## 6. Implementation (only after gates)
- [ ] Implement selection, inventory, isolated fetch, Git and GitHub evidence adapter and deterministic report in `repos/arashi`; never modify the meta repo with child implementation.
- [ ] Add finish command surface and interactive grouped manual/discard prompts, preview/JSON renderer and error mapping; compose the existing remove plan/executor with a finish-only internal post-hook validator under its concurrency boundary, without adding a public unsafe remove flag.
- [ ] Update CLI docs, canonical docs and packaged skills: definition/limits of finished, configured-vs-historical base, manual uncertainty, discard vs completion, preview, JSON, failure recovery and explicit non-goals. Update shell completion/generated CLI command contract and cross-repo checks as required.
- [ ] Run focused and full child lint/tests/build, exact-head acceptance matrix, `openspec validate --strict`, independently review exact implementation HEAD, and report every failing/untested gate before PRs or releases.

## Acceptance matrix (each cell requires real tests)
| Dimension | Fixtures / expected verdict |
| --- | --- |
| Selection | Contextual parent/child, main picker, exact path, unique fuzzy → one parent; duplicate/sibling alias/non-TTY absent → refusal |
| Participation | Parent + differing child branches; absent configured child → nonparticipant; present unregistered/missing clone → blocker |
| Git | Fetched ancestry positive; ahead/base mismatch/open PR negative; failed fetch/cached ref and omitted base unknown; upstream absent/ahead and dirty separately require discard |
| PR | Unique exact merged head/base/reachable merge commit proves squash; wrong fork/head/base, multiple, failed/paginated/other forge → unknown; remote deleted branch not proof |
| Confirmation | Grouped unknown manual, independent discard, decline, `--force` not completion, JSON non-interactive unknown refusal |
| Preview | Full deterministic report and exact remove plan, child-first and branch choices, no hooks/worktree/branch/managed-ref mutation |
| Freshness | Changed config/HEAD/dirty/upstream/base/PR/registrations before handoff or by pre-remove hook → no destructive operation; repeated manual unknown explicitly retains uncertainty |
| Removal | Proven ready enters ordinary remove, local branches deleted by default; hook failure/descendant failure/partial branch failure/post-hook failure preserve ledger and safe ancestor order |
| Output | Stable human/JSON order, schemaVersion 1, `ok` vs readiness distinct, exit 0/1/2, null unavailable facts, secret canaries absent |
