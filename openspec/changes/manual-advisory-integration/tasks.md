## 1. Design gate and inventory

- [ ] 1.1 Obtain independent semantic and architecture approval at this exact design HEAD; repeat both after corrections. Structural validation alone is not approval.
- [ ] 1.2 Inventory all six repositories' callers, invocation consumers, test child reads, local quality/release workflows and live protection contexts; record a reviewed diff or explicit no-change finding for each child. Obtain scoped live-settings authorization before rollout writes.

## 2. RED acceptance before implementation

- [ ] 2.1 Resolver tests: valid upstream main dispatch; reject non-main/tag/fork/call/automatic events, wrong workflow identity/ref, malformed or unequal workflow/event SHAs, wrong child source, missing main, API errors and malformed child SHAs before checkout. Prove one lookup per child and immutable checkout despite main advancing.
- [ ] 2.2 Evidence tests: reject wrong checkout HEAD, missing/duplicate/extra/out-of-order entries, wrong attribution/provenance, malformed SHA, missing artifact/file, empty/malformed digest and log-only evidence before semantic stages; preserve artifact on later semantic failure and distinguish early inability from drift.
- [ ] 2.3 Trigger/cleanup tests: final integration is dispatch-only without reusable/revision inputs, no direct or indirect automatic integration caller remains, and meta PR/main CI still runs local tests/typecheck/format. Prove obsolete required contexts are absent by settings readback, not source assertions alone.
- [ ] 2.4 Test-isolation acceptance: run all default meta tests/typecheck/format in a clean checkout without `repos/` or child network access. Map every former child-dependent assertion to tracked fixture coverage or explicit manual integration tests; fail rather than skip missing children in integration mode.
- [ ] 2.5 Real semantic negatives: missing docs coverage, stale skills reference and missing VS Code parity fail with owning diagnostics; source/package aggregate checker failures propagate. Preserve registry mutation and stage-alignment tests, exactly-once authoritative stages, and unchanged real worktrees using isolated fixtures.

## 3. Implementation after approvals

- [ ] 3.1 Separate automatic meta-local CI and deterministic fixtures from explicit child-dependent integration tests without losing checker coverage.
- [ ] 3.2 Implement main-only immutable resolution, provenance guards, complete evidence gate and truthful outcome reporting; retain stable semantic/package aggregates and least privilege.
- [ ] 3.3 Remove all five callers and audited invocation-only junk; replace caller-enforcement expectations and stale maintained docs. Preserve all child local quality/release checks and contract inputs.
- [ ] 3.4 Document exact dispatch/artifact inspection, local complete validation, advisory outcomes, snapshot limits, no automatic follow-up actions and the staged rollout.

## 4. Delivery and verification

- [ ] 4.1 Run targeted and full meta-local tests, typecheck, formatting, explicit child-dependent integration tests and complete contracts/package validation; run affected child local checks, `openspec validate manual-advisory-integration --strict` and `git diff --check`. Record genuine failures without suppressing them.
- [ ] 4.2 Obtain exact-head implementation reviews and CI; prepare automatic local CI before retiring old wiring. Apply authorized status removals with readback before caller deletion; land all child deletions before removing the reusable interface. Stop for protections outside authorized control.
- [ ] 4.3 Verify final six-repository active wiring, no dangling references, protection readback and preserved local/release coverage. Dispatch a new main run, inspect completion and downloaded revision evidence/digest, report actual drift separately from inability, then archive/sync the spec and close #377 with evidence. No green integration prerequisite for unrelated merges.
