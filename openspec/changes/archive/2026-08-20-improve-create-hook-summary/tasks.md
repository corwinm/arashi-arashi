## 1. CLI Output Tests (RED)

- [x] 1.1 Add pure formatter tests for success-only, skip-only, mixed, multiple-failure, workspace/repository ownership, validation, timeout, nonzero, inline-source, multiline diagnostic, and long file-path outcomes
- [x] 1.2 Add narrow/redirected-output assertions proving failure identity, diagnostics, and paths remain separate without color or fixed-column alignment
- [x] 1.3 Update configured-create command tests to require aggregate counts, collapsed routine rows, complete failure detail, and unchanged recovery guidance
- [x] 1.4 Run the focused formatter and create suites before implementation and record the expected RED failures
- [x] 1.5 Add exact success/failure JSON compatibility assertions for envelope locations, complete outcome schemas, ledger ordering, and single-document stdout

## 2. CLI Implementation (GREEN)

- [x] 2.1 Extract a pure human hook-summary formatter over the existing complete `HookOutcomeRecord[]`
- [x] 2.2 Render deterministic succeeded/skipped/failed counts and one vertically structured, fully attributed detail block per failed outcome
- [x] 2.3 Keep complete outcome construction, ordering, JSON projection, exit behavior, rollback, and next-step derivation unchanged
- [x] 2.4 Run focused tests and prove the new tests fail against the previous renderer and pass against the implementation

## 3. Validation and Delivery

- [x] 3.1 Run CLI format, lint, typecheck, full tests, build, and contract checks
- [x] 3.2 Run strict OpenSpec validation and meta-repository format, typecheck, tests, contract checks, and diff checks
- [x] 3.3 Self-review the exact child and meta diffs for issue scope, JSON compatibility, narrow-output readability, and sibling call sites
- [x] 3.4 Commit and open linked CLI and meta pull requests for corwinm/arashi-arashi#302, then report exact-head CI honestly
- [x] 3.5 Reconcile canonical CLI website and skill guidance so human summaries are not described as complete per-outcome output
