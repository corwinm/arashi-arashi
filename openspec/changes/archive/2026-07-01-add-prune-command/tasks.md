## 1. CLI Discovery and Prune Command

- [x] 1.1 Extend worktree parsing types to retain Git `prunable` state and reason from porcelain output.
- [x] 1.2 Add shared discovery helpers for normal versus prunable worktree records across configured repositories.
- [x] 1.3 Implement `arashi prune --dry-run` human output with per-repository stale entries and no mutation.
- [x] 1.4 Implement mutating `arashi prune` execution using Git worktree prune behavior with per-repository result reporting.
- [x] 1.5 Register the new command and update CLI help/README command listings as needed.

## 2. Remove Command Behavior

- [x] 2.1 Filter prunable records out of interactive `arashi remove` choices and normal remove operation summaries.
- [x] 2.2 Handle explicit remove targets that match only prunable metadata with a clear `arashi prune` guidance message.
- [x] 2.3 Preserve existing remove behavior for valid worktrees, including hooks, forced removal, branch deletion, and JSON output.

## 3. JSON and Automation Output

- [x] 3.1 Add `--json` support for `arashi prune --dry-run` with a single JSON envelope and no stdout noise.
- [x] 3.2 Add `--json` support for mutating `arashi prune` success, empty, and partial-failure results.
- [x] 3.3 Ensure prune and remove JSON tests cover stale/prunable metadata without reporting stale entries as removed worktrees.

## 4. Tests and Documentation

- [x] 4.1 Add CLI unit/integration coverage for parsing prunable records and pruning stale worktree metadata.
- [x] 4.2 Add remove command regression coverage proving prunable entries are excluded and redirected to `arashi prune`.
- [x] 4.3 Update `arashi-docs` command reference/workflow guidance for `arashi prune` and the remove/prune responsibility split.
- [x] 4.4 Update `arashi-skills` guidance if existing cleanup workflows mention stale worktrees or `arashi remove` cleanup.
- [x] 4.5 Run `bun run lint`, `bun run test`, and `bun run build` in affected child repos; run docs validation when docs change.
