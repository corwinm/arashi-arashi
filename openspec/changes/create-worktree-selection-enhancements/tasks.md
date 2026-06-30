## 1. Interactive Create Selection

- [ ] 1.1 Update repository filtering so interactive `arashi create` treats the parent/meta repository as required and prompts only for child repositories.
- [ ] 1.2 Add tests covering parent-required interactive create, selected child subsets, and no-child-selection behavior.

## 2. Status Output for Partial Worktrees

- [ ] 2.1 Add a status presentation filter that hides missing configured child repositories from default and short human output.
- [ ] 2.2 Keep missing configured child repositories visible in verbose and JSON status output.
- [ ] 2.3 Add tests for default, short, verbose, and JSON/machine-readable missing-repository behavior.

## 3. Clone Completion for Missing Child Worktrees

- [ ] 3.1 Add source-repository/current-branch detection for coordinated worktree completion inside `arashi clone`.
- [ ] 3.2 Create selected missing child repositories as git worktrees on the current branch when a local source repository is available.
- [ ] 3.3 Preserve existing remote clone fallback behavior when worktree completion is unavailable.
- [ ] 3.4 Add tests for interactive/`--all` completion, fallback clone behavior, and per-repository failure reporting.

## 4. Documentation and Validation

- [ ] 4.1 Review nearby CLI docs/README and companion Arashi docs/skills guidance for partial worktree workflow updates.
- [ ] 4.2 Run `openspec validate create-worktree-selection-enhancements`.
- [ ] 4.3 Run `bun run lint`, `bun run test`, and `bun run build` in `repos/arashi`.
