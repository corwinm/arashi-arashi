## 1. Extend hook primitives for remove lifecycle

- [x] 1.1 Add `pre-remove` and `post-remove` lifecycle constants in `repos/arashi/src/lib/hooks.ts`
- [x] 1.2 Add/remove-lifecycle helper(s) to build `ARASHI_*` operation context for remove hooks
- [x] 1.3 Ensure remove lifecycle hook discovery uses existing `.arashi/hooks/<hook-name>.sh` behavior and skipped outcomes for missing scripts

## 2. Integrate remove hooks into command orchestration

- [x] 2.1 Wire `pre-remove` execution into `executeRemove` after confirmation and before destructive operations
- [x] 2.2 Enforce abort semantics when `pre-remove` fails (non-zero or timeout)
- [x] 2.3 Wire `post-remove` execution after remove operations complete, including partial-failure runs
- [x] 2.4 Aggregate hook outcomes into remove summary/error handling so hook failures produce non-zero exit status with actionable output

## 3. Add test coverage for lifecycle behavior

- [x] 3.1 Add tests that verify remove lifecycle ordering (`pre-remove` -> remove operations -> `post-remove`)
- [x] 3.2 Add tests that verify `pre-remove` failure prevents worktree removal and branch deletion
- [x] 3.3 Add tests that verify `post-remove` still executes when some remove operations fail
- [x] 3.4 Add tests for missing-hook skip behavior and post-remove failure exit status

## 4. Update examples and validation workflow

- [x] 4.1 Add or update hook template/docs to include `pre-remove.sh` and `post-remove.sh` usage for cleanup workflows
- [x] 4.2 Run `bun run lint` in `repos/arashi` and fix any issues
- [x] 4.3 Run `bun test` in `repos/arashi` and address failing tests
- [x] 4.4 Run `bun run build` in `repos/arashi` to verify distribution build succeeds
