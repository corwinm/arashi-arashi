# Coordinated finish acceptance audit

> Historical pre-repair snapshot. G1/G2 and the canonical-docs gap were subsequently repaired; see [closeout.md](closeout.md) for final disposition. Preserve the original findings and historical evidence limits below.

## Scope and evidence rules

This audit does **not** authorize release, merge, issue closure, or archiving. It distinguishes delivered implementation from acceptance coverage and historical pre-implementation RED evidence. An unchecked compound task remains unchecked if any named acceptance obligation lacks evidence. Missing tests are not automatically production defects. No retrospective GREEN run establishes a historical RED gate.

Audited immutable revisions:

- Meta baseline `906eaa4e888681389d58cf19efe0df4b3cea7f43`; design merged in #375, `6118ec1502703ba7da4306f15078b1c31b80eb50`; reviewed design head `f058b8870f8ae5e9a3d16c68066908848f6929f9`.
- CLI #194 merge `f6380e2a80b0b0e7b37d46e57ed3574190e854c5`, PR head `8dcf6acae7bb196046103af8dac15f07a4d34444`. `finish.ts`, `remove.ts`, and `finish.test.ts` have no diff between these revisions. Observed subsequent CLI main `4a99788d932c98f5c6d670e1de3aabdbefb080dd` changes CI wiring/dependency actions, not these files.
- Docs #112 `988c8406eabbeaa31458fa15fa610e637a65ed9d`; skills #77 `84cb8504a8a0fddef2bc5eb64aab66d9ba29bc83` and #78 `531e2b46fc8a0fdad3a48f4d16c612b89f080ceb`; meta hook ownership #378 `b22d47cfae3224d818baa43b4de8f7e20e13a259`.

Unless qualified otherwise, implementation references below are CLI merge-revision paths. `T` means `tests/integration/finish.test.ts`, `F` means `src/commands/finish.ts`, and `R` means `src/commands/remove.ts`. Task numbers below identify bullets in section order, without changing their original text.

## Per-task disposition

### 0.1 Independent design gates — SATISFIED

Independent semantic and architecture approvals explicitly name `f058b8870f8ae5e9a3d16c68066908848f6929f9`. Local recorded evidence: `~/.hermes/cache/delegation/live/deleg_efb189eb/task-0.log` and `task-1.log`, final approvals at 23:28:49 and 23:29:02; implementation kickoff is later at 23:29:17 in `deleg_2df75035/task-0.log`. `deleg_d1bb6604/task-0.log` records successful SSH verification and strict validation at that design head. Earlier designs were rejected and corrected, not silently treated as approved.

The final architecture review identifies the existing post-hook/pre-mutation insertion point and approves private fetch feasibility. The final semantic review accepts correlation without invented immutable head binding. Actual GitHub REST inspection of merged PR #194 returned head/base keys `label, ref, repo, sha, user`; no historical binding is asserted. Real private fetch and callback behavior are exercised by T:62–87, 116–153, 315–333. These establish the design gate, not completion of every implementation acceptance case.

### 0.2 Proportional v1 and separate children — SATISFIED

F:657–807 delegates to existing `executeRemove`; R:132–143 defines the internal optional callback, R:1064 and 1264–1271 call it at plan/post-hook boundaries. No universal lock or create/prune/add/delete refactor was introduced by this feature. CLI #194, docs #112, and skills #77/#78 are separate changes referencing the coordinated feature. The exact-head architecture approval above explicitly covers the narrowed value/scope checkpoint. This does not assert that every ordering case is correct (see G1).

### 1.1 Selection/scope RED matrix — GAP

Delivered/covered: contextual parent/child (T:62, 801), differently branched child (T:68), explicit relative/tilde/slash targets (T:518, 592, 634), sibling ambiguity (T:372), JSON omitted target (T:361), present unregistered child (T:95), escaped/dangling child (T:609), missing canonical clone (T:626), mixed Windows identities (T:447, 569, 572), exact two-repository order (T:166) and sibling order (T:177).

Not demonstrated by the focused suite: actual main-picker interaction selecting exactly one target, detached/main/standalone rejection matrix, non-JSON non-TTY omission, successful absent-child nonparticipant, inaccessible participant, deliberate extra branch/hook target/no-op injection. TTY tests assign `process.stdin.isTTY = true`; they are not real PTY picker/consent runs. **G1 reproduces a nested distinct-branch exact-plan failure despite green sibling tests.** Initial RED records cover only a subset; do not check off the compound pre-implementation task.

### 1.2 Preview RED boundary — GAP (coverage)

F:972–974 returns preview before policy/completion/discard/remove prompts. T:103 prevents migration writes; T:850 snapshots canonical index/config/refs; T:223 snapshots a child index/ref; T:211–301 uses real executable clean/process-filter markers. Omitted policy is unknown in T:88. Executable filter regressions were added later in commits `c286be9` and `b9dfcf3`, not all before initial implementation.

Missing closed acceptance evidence: real picker followed by zero policy/consent prompts; configured hooks proven not to run in finish preview; byte snapshots of all participant indexes, refs, config and worktree contents together. T:64 reads the worktree `.git` pointer, **not** its index; that original test name alone is insufficient evidence for index immutability. Later explicit index tests partially repair the coverage.

### 1.3 Base/freshness RED matrix — GAP (coverage)

F:303–335 implements repository-over-workspace policy with omitted/manual sources. F:423–540 performs disposable bare-repository local HEAD transport, explicit upstream/base fetch, completeness checks, ancestry, and cleanup. T:116 verifies fresh upstream over stale tracking; T:125 rejects failed fresh base fetch despite stale tracking; T:62 proves direct ancestry; T:88/385 covers omitted policy; T:397 covers unstaged porcelain; T:428 covers ignored discard data.

Missing focused cases: repository override versus workspace/create override, end-to-end per-repository interactive base entry, local HEAD transport failure, shallow/missing-object/graft/replace scenarios, divergent/ahead upstream counts and unavailable upstream independent of base failure, private-directory cleanup after failure, and real squash/rebase histories that remain unknown. The task wording says replace refs/grafts are unknown, whereas the normative spec permits proof with them disabled; F:36 disables replacements and the disposable repository does not copy graft files. Resolve that task/spec wording explicitly rather than claim a nonexistent blanket-unknown test.

### 1.4 GitHub adapter RED matrix — GAP (coverage; conservative implementation)

F:184–233 uses real REST fields and authenticated `gh auth status`, caps traversal at three pages and returns unavailable if the third page is full. Thus it requires observed exhaustion before matching, rather than treating truncation as a match. F:507–530 only attaches correlation and never promotes it to integration proof. T:712 checks injected runner pagination/identity; T:762 checks duplicate and full-page ambiguity. Other-forge identity is covered in T:749.

No real `gh` adapter acceptance run is in those tests: they inject string-returning runners. Missing cases include auth/rate failures, fork/wrong-base/reused branch mismatch, unreachable merge commit, mutable-head/commit-list temptation, and complete integration-level squash/rebase unknown behavior. The audit's read-only GitHub field-shape observation is not a substitute for those cases. A literal requirement for unbounded exhaustive pagination differs from the documented safe bounded adapter; specify exhaustion-or-unknown explicitly if that is the intended acceptance rule.

### 1.5 Consent/output RED matrix — GAP

T:664 groups unknowns and labels manual confirmation; T:689 sanitizes prompt repository keys; T:385 proves force is not completion; T:334 proves one success JSON envelope; T:361/385/428 checks exit-2 refusal paths; T:407/485 checks label redaction; T:829 verifies a credential URL canary never enters Git argv. That argv canary is **not** an stdout/stderr/hook/partial-failure secrecy matrix. T:434's ignored-file canary checks preservation, not output exclusion.

Missing evidence: declined manual/discard/remove flows with branch/worktree snapshots; all human/JSON preview/success/invalidation/partial-failure outputs with URL/config/hook/Git-error canaries; stable multi-child ordering; mutation error envelope behavior through real failures. **G2 reproduces an unscreened base-ref label in JSON.**

### 1.6 Remove-gate RED matrix — GAP

Covered real worktrees: pre-hook config mutation with retained successful hook result (T:134), config change between assessment/handoff before hooks (T:154), pre-hook HEAD mutation (T:315), pre-hook remote URL mutation (T:651), newly configured remote after absence (T:820), branch retention (T:303), sibling order (T:177). F:694–774 compares accepted repositories and exact actions/hook targets; R:1242–1271 places callback after descendant refresh and before destructive operations. Ordinary remove tests cover hook failure and dependency-blocked partial failure (`remove.hooks.test.ts`:384/461, `inline-hook-remove.test.ts`:386, `remove.coordinated.test.ts`:693).

Not demonstrated through finish: consent-time HEAD/registration/plan changes; post-hook physical registration/extra descendant/hook-target changes; unchanged explicitly manually confirmed repeated remote failure versus changed failure class and contradictory successful refresh; finish partial-removal/post-hook failure safe results. Ordinary remove coverage cannot alone prove finish's adapter/result projection. **G1 shows the exact-plan acceptance matrix is incomplete.**

Residual concurrency is an accepted non-atomic limitation, not a missing global lock requirement: F:298 warns `NOT_ATOMIC`, and the final validation cannot prevent external actors racing afterward. No guaranteed prevention test should be invented for that interval.

### 2.1 Finish implementation — GAP (delivered, not acceptance-complete)

Feature exists in `src/commands/finish.ts`, registered through `src/cli-program.ts`, with metadata in `src/contracts/cli-commands.ts`. Initial feature commit `3b7d6a7` and follow-ups through `9f2c13e` implement selection/evidence/reporting using private metadata and conservative GitHub correlation. No child implementation was made in the design worktree. G1/G2 prevent declaring the complete implementation acceptance satisfied.

### 2.2 Minimal internal remove exposure — SATISFIED (mechanism only)

R:132–143, 1064, 1089–1113, 1224–1227, 1264–1271, 1390–1392 expose the optional plan gate and structured summary internally. F:784–795 reuses `executeRemove`; public command options have no gate bypass flag. Existing hook/branch/partial-failure execution remains in R:1288–1392. Focused keep-branches and hook invalidation tests pass. The missing full behavioral matrix and nested plan defect remain open under 1.6/2.1, not hidden by this bookkeeping check.

### 2.3 Docs, packaged skill, contracts/completion — GAP (documentation detail)

Delivered: CLI `README.md`, generated command contract/completions in #194; canonical `docs/commands/finish.md`, command index/remove/lifecycle links and agent export in docs #112; packaged skill references and routing in skills #77; machine-readable coverage in skills #78; hook ownership checker in meta #378. Exact-head cross-repository contract CI succeeded at CLI PR head.

Skills `references/commands/remove-and-maintenance.md`:20–22 explicitly distinguishes current versus historical base and disclaims cross-process atomicity. Canonical docs `docs/commands/finish.md`:42–46 describe current policy and lack of atomic rollback, but omit an explicit warning that external/concurrent mutation can race **after the final check**, and omit explicit denial of remembered create-time override policy. No rollback is not the same claim as no atomic deletion safety. Add those concise canonical clarifications; this isolated meta audit does not edit the child docs.

### 2.4 Tests/lint/build/strict validation/exact-head review — UNVERIFIED as a compound gate

Verified: PR #194 reports successful quality, Ubuntu/Windows test, Linux/macOS/Windows build/native acceptance checks at `8dcf6ac`; CI run [36292182547](https://github.com/corwinm/arashi/actions/runs/36292182547), contract run [36292182828](https://github.com/corwinm/arashi/actions/runs/36292182828). The PR body records earlier local full-suite results; these are recorded claims, not a fresh audit full-suite run.

Fresh audit execution on an isolated archive of merge `f6380e2`: finish suite **50 passed, 1 skipped**; combined finish plus four ordinary-remove suites **103 passed, 2 skipped (5 files)**. Windows-only finish identity test is skipped on macOS. `openspec validate coordinated-workspace-finish --strict` passes.

Historical RED output exists (e.g. `deleg_2df75035/task-0.log`:23:32:51, 23:38:56, 23:42:36, 00:02:44); the complete requested matrix was not present before implementation. `~/.hermes/cache/scratch/finish-stability-review.txt` approves exactly `8dcf6ac` **only against `a379d28`**, with instructions excluding broad finish feature review. This does not establish cumulative exact-head semantic/architecture acceptance. GitHub's exact-head Codex review also contains G1. Obtain a cumulative exact-fixed-head review after acceptance repairs; do not equate green CI with design completion.

## Reproduced acceptance defects

### G1 — Valid nested repositories cannot finish with default branch cleanup

A real configured parent with `outer` at `repos/outer` and `inner` at `repos/outer/repos/inner`, configured outer first, and distinct feature/outer/inner branches yields all integrations `proven` but preview `readiness: blocked`, `REMOVE_PLAN_UNAVAILABLE`, null cleanup plan, exit 0. This is not a mutation safety failure; it is a supported-topology functional blocker.

F:575–587 sorts worktree operations descendant-first but leaves branch operations in configuration order. Remove derives target branch order from its selected/closed worktree plan (R:971–980), and F:757 rejects the mismatch. The existing sibling test cannot detect nested branch reordering. Exact-head Codex review of #194 reports the same issue; independently reproduced in this audit.

Reproducer: `/Users/corwin/.hermes/cache/scratch/finish-audit-nested.py`, using the immutable CLI archive in `/Users/corwin/.hermes/cache/scratch/finish-audit-cli`. Add a regression for nested distinct branches, repair agreement with remove's actual plan, and retain extra/unassessed-target rejection.

### G2 — Base ref bypasses presentation screening

Real preview with valid configured base branch `CANARY+UNSCREENED` prints `base.ref: refs/heads/CANARY+UNSCREENED` unchanged in its success JSON. The same plus-sign identity is deliberately redacted when it is the checked-out branch (T:485). F:638 screens base remote but spreads raw base ref; F:871 interpolates that raw ref into manual confirmation. Paths are also spread without the label policy and merit dedicated canaries. This proves inconsistent unscreened-label handling, not exposure of an actual credential in this audit.

Reproducer: `/Users/corwin/.hermes/cache/scratch/finish-audit-probe.py`. Expected safety policy must cover every outbound field while preserving exact raw identities internally. Test preview, manual prompt, success and failure projection rather than screening only repository/branch fields.

## Audit execution limitations

The first `pnpm exec` attempt rejected the archive's shared node_modules symlink with `ERR_PNPM_UNSAFE_MODULES_DIR`; no dependency cleanup was allowed. Direct `node node_modules/vitest/vitest.mjs` then ran the archive tests successfully. Later test/probe commands explicitly set `TMPDIR` to Hermes scratch because the terminal's actual default differed from the advertised scratch environment. No protected worktree source was edited. No release/merge/issue-close action was taken.
