## Context

The remove flow currently performs discovery, confirmation, worktree removal, and branch deletion, but it has no lifecycle hook points. Teams that rely on external session/state cleanup (for example tmux sessions tied to branch/worktree paths) must do that work manually after `arashi remove`, which is error-prone and easy to forget.

Existing hook infrastructure already supports named lifecycle scripts under `.arashi/hooks/` with timeout handling, structured outcomes, and user-visible logging. This change extends that model to remove operations without changing remove target resolution semantics.

## Goals / Non-Goals

**Goals:**
- Add `pre-remove` and `post-remove` lifecycle hooks to the remove command.
- Define deterministic execution order relative to confirmation, worktree removal, and branch deletion.
- Provide clear behavior when hooks fail (abort vs continue), including exit status and user-visible errors.
- Reuse existing hook execution primitives so timeout, validation, and output behavior remain consistent.

**Non-Goals:**
- Redesigning remove target selection, grouping, or prompt UX.
- Introducing a new hook configuration format beyond existing `.arashi/hooks/<hook-name>.sh` discovery.
- Adding persistent hook execution logs beyond current command output.

## Decisions

### 1) Lifecycle model and script names
- Add two global remove lifecycle names: `pre-remove` and `post-remove`.
- Discover scripts via existing convention: `.arashi/hooks/pre-remove.sh` and `.arashi/hooks/post-remove.sh` in the workspace root repository.
- Keep this first iteration global-only for remove lifecycle hooks; per-repository remove hook names are deferred.
- Alternative considered: also introduce `pre-remove.<repo>` / `post-remove.<repo>` now. Rejected to keep initial behavior predictable and avoid multiplying invocation counts during multi-repository removal.

### 2) Remove pipeline integration and ordering
- Integrate hook execution into `executeRemove` in `repos/arashi/src/commands/remove.ts`.
- Execution order:
  1. Resolve targets, check dirty state, and gather final operation plan.
  2. Prompt confirmation (when not forced).
  3. Run `pre-remove` once.
  4. Execute worktree removals and branch deletions.
  5. Run `post-remove` once.
  6. Print final summary.
- `pre-remove` runs after confirmation so cancelled operations do not trigger cleanup hooks.
- Alternative considered: run `pre-remove` before confirmation to allow preflight gating. Rejected because it runs side effects even when user declines.

### 3) Hook context payload for remove lifecycle
- Reuse existing hook execution plumbing and operation data builder in `repos/arashi/src/lib/hooks.ts`.
- Extend operation data for remove to include branch/repository/worktree context that hooks need for teardown logic.
- For multi-target removals, include aggregate context (counts and primary target metadata) and per-operation metadata when available.
- Keep environment contract backward-compatible by using existing `ARASHI_*` prefixed variables.
- Alternative considered: introduce a new JSON payload file contract. Rejected to avoid extra IO complexity for a first version.

### 4) Failure semantics and exit behavior
- If `pre-remove` fails (non-zero or timeout), abort all remove actions and return non-zero.
- If remove actions produce partial failures, still attempt `post-remove` to allow best-effort cleanup/finalization.
- If `post-remove` fails, include it in summary errors and return non-zero.
- If hooks are missing, mark as skipped and continue (same semantics as existing hook system).
- Alternative considered: skip `post-remove` whenever any remove action fails. Rejected because cleanup is often most important in failure scenarios.

### 5) Test strategy
- Add command-level tests that verify lifecycle ordering (`pre-remove` before remove ops, `post-remove` after).
- Add failure-path tests:
  - `pre-remove` failure aborts remove and no worktree/branch operations execute.
  - Remove operation failure still allows `post-remove` execution.
  - `post-remove` failure marks command unsuccessful.
  - Missing hooks are reported as skipped without failing command.
- Add integration coverage for a cleanup-style hook scenario (for example simulated session cleanup side effect).
- Alternative considered: rely only on unit tests in hook library. Rejected because orchestration ordering is owned by remove command flow.

## Risks / Trade-offs

- [Cleanup hook can accidentally remove unrelated resources] -> Keep hook scope explicit with clear environment variables and document safe guard clauses.
- [Post-remove hook failure may mask underlying remove errors] -> Aggregate and print both operation and hook errors in summary output.
- [Hook runtime can slow remove operations] -> Reuse existing timeout configuration and emit duration in hook outcomes.
- [Global-only hooks may be insufficient for some teams] -> Document as v1 and leave room for repo-specific remove hooks in a follow-up capability.

## Migration Plan

1. Add remove lifecycle constants and shared helper wiring in hook utilities.
2. Add remove command orchestration calls for `pre-remove` and `post-remove` with defined ordering.
3. Extend remove summary/error aggregation to include hook failures and skipped states.
4. Add tests for ordering, missing-hook behavior, and failure semantics.
5. Update user docs/examples to include `pre-remove.sh` and `post-remove.sh` usage for cleanup workflows.

Rollback strategy: revert lifecycle integration in remove command and constants; no config schema migration is required.

## Open Questions

- Should remove hooks receive a structured list of all selected targets (for example JSON string) in addition to scalar env vars?
- Do we want to add repo-specific remove lifecycle hooks in a follow-up once global behavior is stable?
