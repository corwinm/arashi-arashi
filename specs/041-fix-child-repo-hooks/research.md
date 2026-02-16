# Research: Fix child-repo create hook execution

**Date**: 2026-02-15  
**Context**: Ensure `arashi create <name>` runs the same hooks and reports the same outcomes whether invoked from workspace root or from a managed child repository.

## Decisions

- **Decision**: Use the resolved workspace context from command entry as the canonical hook root for create orchestration, instead of deriving hook root from process current directory.
  **Rationale**: Current behavior resolves create context correctly in command layer but hook lookup still uses current working directory, which causes silent misses when invoked from child repositories.
  **Alternatives considered**: Continue using current directory for hook lookup; rejected because it cannot guarantee consistent hook discovery across invocation locations.

- **Decision**: Remove create-time configuration re-resolution from orchestration internals when canonical configuration is already resolved by command context.
  **Rationale**: Re-loading config from `.` can diverge from resolved workspace root in child invocation and create inconsistent repository/hook behavior.
  **Alternatives considered**: Keep dual config resolution and attempt to reconcile downstream; rejected because it adds ambiguity and regression risk.

- **Decision**: Keep fail-fast hook semantics and rollback behavior unchanged when hooks fail or time out.
  **Rationale**: Constitution requires error recovery consistency; existing behavior already provides rollback guarantees and should remain predictable.
  **Alternatives considered**: Continue processing other repositories after a hook failure; rejected as out-of-scope behavior change with broader UX and safety implications.

- **Decision**: Model per-repository hook outcomes explicitly as `success`, `failure`, or `skipped`, with structured skip/failure reasons.
  **Rationale**: The bug impact is currently obscured by silent skip behavior when a hook is not found in the expected root; explicit statuses make diagnosis and recovery straightforward.
  **Alternatives considered**: Keep only aggregate command-level failure summary; rejected because it does not identify affected repository/hook quickly.

- **Decision**: Enforce at-most-once hook execution per repository within one create run using deterministic repository iteration and per-run tracking.
  **Rationale**: Prevents duplicate side effects and aligns with expected lifecycle hook semantics in multi-repository orchestration.
  **Alternatives considered**: Allow implicit retries after transient failure; rejected because hooks may be non-idempotent and this feature does not introduce retry policy changes.

- **Decision**: Add integration coverage for child-repository invocation with hooks enabled, including success and failure/timeout cases.
  **Rationale**: Existing parity tests disable hooks, leaving this regression path untested.
  **Alternatives considered**: Unit-only tests around path resolution; rejected because they do not validate full command orchestration and user-visible outcomes.

## Resolved Clarifications

All technical context items are resolved; no `NEEDS CLARIFICATION` markers remain.
