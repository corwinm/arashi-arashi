## Why

Arashi currently supports setup/create-time hook flows, but remove operations do not expose lifecycle hooks for cleanup. Adding `pre-remove` and `post-remove` hooks now enables reliable teardown workflows (for example, tmux session cleanup) when worktrees are removed.

## What Changes

- Add `pre-remove` and `post-remove` hook phases to the remove workflow.
- Define execution order and behavior for both successful and failed remove operations.
- Extend hook discovery/configuration so remove hooks can be registered alongside existing hook scripts.
- Surface clear CLI output for remove hook execution, including failures and skipped hooks.
- Add tests for remove hook invocation timing, error handling, and no-hook behavior.

## Capabilities

### New Capabilities
- `remove-lifecycle-hooks`: Hook lifecycle support around worktree removal, including pre-remove and post-remove execution contracts.

### Modified Capabilities

## Impact

- Affected code: remove command orchestration, hook execution utilities, and workspace hook configuration handling in `repos/arashi`.
- Affected behavior: remove operations now expose lifecycle extension points for cleanup automation.
- Affected UX: users receive explicit feedback when remove hooks run, fail, or are not configured.
- Affected quality gates: unit/integration tests covering remove hook sequencing and failure semantics.
