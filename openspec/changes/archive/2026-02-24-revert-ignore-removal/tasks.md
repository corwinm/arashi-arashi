## 1. Restore worktree ignore pattern selection

- [x] 1.1 Update init command gitignore pattern selection to include a normalized configured worktrees directory entry when it is a safe repository-relative subdirectory.
- [x] 1.2 Add guardrails that skip automatic worktree ignore insertion for broad locations (`.`/`./`) and parent traversal (`../` variants).
- [x] 1.3 Keep dry-run and success output aligned with the actual managed gitignore patterns.

## 2. Cover restored behavior with tests

- [x] 2.1 Update init integration tests to expect configured safe custom worktree directory entries in `.gitignore`.
- [x] 2.2 Add/adjust integration tests to verify no auto-ignore entry is added for unsafe broad locations.
- [x] 2.3 Keep idempotency assertions valid for both default and configured worktree ignore entries.

## 3. Validate and finalize

- [x] 3.1 Run `bun run lint` in `repos/arashi` and resolve any issues.
- [x] 3.2 Run `bun test` in `repos/arashi` and ensure all affected init scenarios pass.
- [x] 3.3 Run `bun run build` in `repos/arashi` to confirm distributable build health.
