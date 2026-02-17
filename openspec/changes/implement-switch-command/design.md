## Context

Arashi currently supports creating, listing, syncing, and removing worktrees, but it does not provide a direct way to jump into an existing worktree from the CLI. Issue #64 requires a `switch` command that can select or filter branch-backed worktrees, then open a new terminal context in that path. The implementation must account for shell limitations (cannot `cd` parent shell), tmux workflows (`--sesh`), and VS Code terminal environments.

## Goals / Non-Goals

**Goals:**
- Add `arashi switch` to choose a worktree by branch/path and open it in a new terminal context.
- Support both filter-first and interactive selection flows.
- Add `--sesh` behavior for tmux users so switching can use `sesh` when available.
- Detect VS Code terminal environments and prefer opening a new VS Code window/context.
- Provide clear fallback behavior and user-facing errors when integrations are unavailable.

**Non-Goals:**
- Creating or deleting worktrees as part of switch flow.
- Implementing universal deep integration for every terminal emulator.
- Changing existing command semantics for `list`, `create`, `add`, `remove`, or `sync`.

## Decisions

### 1) Command shape and selection flow
- Add a new command module (`src/commands/switch.ts`) and core workflow (`src/core/switch.ts`).
- Command contract: `arashi switch [filter] [--sesh]` where `filter` is optional and narrows candidates by branch or path.
- If exactly one candidate matches, switch immediately; if multiple candidates remain and terminal is interactive, prompt user selection.
- If multiple candidates remain in non-interactive mode, fail with actionable guidance to provide a filter.
- Alternative considered: requiring interactive prompt every time. Rejected because it is slower for scripted or power-user flows.

### 2) Candidate discovery model
- Reuse existing worktree discovery primitives (same source of truth used by list/status flows) to avoid divergent branch/path parsing.
- Normalize each candidate into `{ branchName, worktreePath, repoName }` for display and filtering.
- Exclude entries that cannot be switched to safely (missing path, invalid metadata), and surface skipped counts in diagnostics.
- Alternative considered: deriving candidates from directory naming only. Rejected because naming is not authoritative and can drift.

### 3) Terminal target resolution and launch strategy
- Introduce a small launcher abstraction (`src/lib/switch-launcher.ts`) that resolves target mode from environment and flags.
- Resolution order:
  1. `--sesh` + tmux environment (`TMUX`) -> sesh/tmux flow
  2. VS Code terminal detection (`TERM_PROGRAM=vscode` and related env markers) -> `code --new-window <path>`
  3. Platform fallback launcher (open a new terminal/tab/window at the worktree path)
- All process execution uses argument arrays (no shell interpolation) and explicit path escaping where script handoff is required.
- Alternative considered: forcing one launcher path for all environments. Rejected because tmux and VS Code require distinct integration points.

### 4) `--sesh` behavior contract
- `--sesh` is opt-in and only changes behavior when running inside tmux.
- Preflight checks:
  - Verify tmux context is active.
  - Verify `sesh` is installed/in `PATH`.
- On success, open/switch via `sesh` in a new tmux window/pane targeting the selected worktree.
- On check failure, return a clear error with fallback recommendation (`arashi switch` without `--sesh`).
- Alternative considered: silently falling back when `sesh` is unavailable. Rejected because silent mode changes are hard to debug.

### 5) Test strategy
- Unit tests for candidate filtering, environment detection, and launcher resolution precedence.
- Unit tests for error-path behavior (no matches, ambiguous non-interactive matches, missing `sesh`, missing `code`).
- Integration tests for command wiring and expected spawn calls via mocked process runner.
- Do not rely on real terminal automation in tests; validate deterministic command construction and branching.

## Risks / Trade-offs

- [Terminal-specific launch behavior can be brittle] -> Keep launchers narrow, detect capabilities explicitly, and provide deterministic fallback/error messaging.
- [VS Code CLI may be unavailable even inside VS Code terminal] -> Probe `code` availability before launch and fall back to standard launcher.
- [sesh invocation details may differ by user setup] -> Encapsulate command construction and keep one adapter surface for future compatibility tweaks.
- [Filtering may select unintended branch in large workspaces] -> Show branch + path in prompts and require explicit selection when multiple matches remain.

## Migration Plan

1. Add `switch` command registration in `src/index.ts`.
2. Implement switch core flow and launcher abstraction with environment-aware branching.
3. Add tests for filtering, launcher resolution, and command-level behavior.
4. Update CLI docs/help examples with `switch` and `--sesh` usage.
5. Rollback strategy: remove command registration and switch modules if regressions are found; no config/data migration is required.

## Open Questions

- Confirm the preferred `sesh` invocation shape for worktree paths in tmux sessions.
- Confirm whether detached-HEAD worktrees should be shown, hidden, or shown with warning labels.
- Confirm minimum platform support expectations for initial release (macOS-only launcher vs broader Linux/Windows fallbacks).
