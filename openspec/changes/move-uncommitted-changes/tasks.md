## 1. CLI and Move Planning

- [ ] 1.1 Add shared workspace/source-target resolution helpers for `arashi move`, including branch/name/path matching and current-workspace inference.
- [ ] 1.2 Add dirty-state discovery for the parent repository and child repositories, including tracked, staged, deleted, and untracked changes.
- [ ] 1.3 Build a move plan that includes only repositories present in both source and target workspaces, skips unchanged repositories, and reports missing/unmatched repositories.
- [ ] 1.4 Add preflight checks that abort before mutation when no compatible changed repositories exist or a target repository that would receive changes is dirty.

## 2. Move Execution

- [ ] 2.1 Implement repository-level transfer using named temporary Git stashes with tracked and untracked changes.
- [ ] 2.2 Apply transfer stashes in target worktrees with index preservation where supported, and drop stashes only after successful target apply.
- [ ] 2.3 Add rollback/recovery handling for failed multi-repo moves, including restoring already-stashed source changes when possible.
- [ ] 2.4 Produce per-repository result summaries covering moved, skipped, restored, failed, and manual-recovery states.

## 3. `arashi move` Command

- [ ] 3.1 Register a new `arashi move` command with explicit source and target options.
- [ ] 3.2 Add interactive source and target selectors for missing arguments, using labels that include branch/worktree identity, paths, and dirty summaries.
- [ ] 3.3 Wire `arashi move` to the shared move planner/executor and return non-zero exit codes on unsafe or failed moves.
- [ ] 3.4 Add human-readable help text and examples for moving changes from here, to here, and between two explicit workspaces.

## 4. `arashi create` Integration

- [ ] 4.1 Add an explicit `arashi create <branch> --move-changes` option.
- [ ] 4.2 After successful worktree creation with `--move-changes`, move compatible changes from the invocation workspace to the newly created worktree.
- [ ] 4.3 When create succeeds from a dirty workspace without `--move-changes`, print concise guidance with the follow-up `arashi move --to <branch>` command.
- [ ] 4.4 Ensure create-time move failures preserve source changes or recovery stashes and still report the created worktree locations.

## 5. Tests and Documentation

- [ ] 5.1 Add unit tests for workspace resolution, dirty-state discovery, move-plan construction, target safety checks, and result summaries.
- [ ] 5.2 Add integration tests covering moving tracked, staged, deleted, and untracked changes between coordinated worktrees.
- [ ] 5.3 Add integration tests for partial workspaces, dirty targets, failed apply recovery, and create-time `--move-changes` behavior.
- [ ] 5.4 Update `arashi-docs` command/workflow documentation for `arashi move` and `arashi create --move-changes`.
- [ ] 5.5 Update `arashi-skills` guidance so agents know how to move accidental edits between worktrees safely.
- [ ] 5.6 Validate the implementation with `bun run lint`, `bun run test`, and `bun run build` in `repos/arashi`, plus docs/skills validation as applicable.
