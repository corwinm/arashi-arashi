## 1. Command Surface and Data Model

- [x] 1.1 Add `switch` command wiring in `repos/arashi/src/index.ts` and create `repos/arashi/src/commands/switch.ts` with `arashi switch [filter] [--sesh]` options/help text.
- [x] 1.2 Implement switch command types/errors for no targets, ambiguous non-interactive matches, and launch failures.
- [x] 1.3 Reuse existing worktree discovery to build normalized switch candidates (`branchName`, `worktreePath`, `repoName`) and skip invalid entries safely.

## 2. Selection and Filtering Flow

- [x] 2.1 Implement filter matching against branch and path and auto-select when exactly one candidate remains.
- [x] 2.2 Implement interactive selection prompt when multiple matches remain in TTY mode, showing branch + path for each candidate.
- [x] 2.3 Implement non-interactive ambiguity handling that exits with guidance to provide a more specific filter.

## 3. Launch Integration and Environment Resolution

- [x] 3.1 Add launcher resolution logic that prioritizes `--sesh` in tmux, then VS Code terminal handling, then platform fallback terminal launch.
- [x] 3.2 Implement `--sesh` preflight checks (tmux context and `sesh` availability) and sesh/tmux invocation for selected worktree.
- [x] 3.3 Implement VS Code terminal detection and `code --new-window <path>` launch with fallback when `code` is unavailable.
- [x] 3.4 Implement fallback terminal launch path and ensure all spawns use argument arrays with actionable errors on failure.

## 4. Verification and Documentation

- [x] 4.1 Add unit tests for filtering/selection behavior, environment resolution precedence, and error branches.
- [x] 4.2 Add integration tests for command wiring and expected process-runner invocations for sesh, VS Code, and fallback launch modes.
- [x] 4.3 Update CLI docs/help examples for `arashi switch` and `--sesh`, then run `bun run lint`, `bun test`, and `bun run build` in `repos/arashi`.
