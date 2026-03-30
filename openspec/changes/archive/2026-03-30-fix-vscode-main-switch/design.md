## Context

This bug spans the Arashi CLI in `repos/arashi/` and the VS Code extension in `repos/arashi-vscode/`. The extension worktree panel already knows the exact selected worktree path and currently passes that path into `arashi switch`, but the CLI treats the positional argument as a fuzzy filter over branch names and worktree paths. When multiple worktrees contain the same branch name or a similar path suffix such as `main`, a non-interactive extension invocation can fail with an ambiguity error even though the user selected a single concrete entry.

The main constraint is preserving existing CLI ergonomics for manual switching. `arashi switch <filter>` should keep its current fuzzy selection behavior for terminal users, while IDE integrations need a deterministic path that bypasses ambiguity when they already know the intended target.

## Goals / Non-Goals

**Goals:**
- Add a deterministic switch mode that resolves a selected worktree by exact path identity.
- Make extension-driven switch actions use that deterministic mode whenever the user already selected a concrete worktree.
- Preserve current fuzzy and interactive `arashi switch <filter>` behavior for manual terminal use.
- Keep the change aligned with existing Arashi CLI conventions where path-specific operations use an explicit flag.

**Non-Goals:**
- Redesign the broader switch discovery or interactive selection UX.
- Introduce persistent configuration for exact-match behavior.
- Redesign the extension switch selection UX beyond passing exact identity to existing CLI invocations.
- Add new repository identity concepts beyond branch name and absolute worktree path.

## Decisions

### Decision: Add explicit path mode to `arashi switch`
`arashi switch` should gain an explicit path-targeting mode, consistent with `arashi remove --path`, so callers can state that the argument is a concrete worktree path rather than a fuzzy filter. In path mode, the CLI should resolve the argument to one exact candidate by normalized absolute path and skip substring matching.

Alternatives considered:
- Infer exact mode automatically whenever the argument looks like a path: rejected because it would make CLI behavior harder to reason about and could break existing fuzzy path matching.
- Add a new bespoke flag such as `--exact`: rejected because `--path` matches the existing command vocabulary and expresses the required identity directly.

### Decision: Keep fuzzy matching as the default switch behavior
The current positional-argument workflow is still useful for terminal users who want `arashi switch feature-auth` or partial path matching. Exact path mode should therefore be additive, not a replacement, so the CLI remains backwards compatible for interactive and non-interactive shell usage.

Alternatives considered:
- Change the default positional argument to exact matching: rejected because it would remove useful discovery behavior and likely break existing workflows.
- Force all non-interactive switch calls to use exact matching: rejected because some automation may still intentionally rely on current filter semantics.

### Decision: Make extension switch flows that select a worktree always use path mode
Both the command-palette switch flow and the panel switch action already resolve a concrete `ArashiWorktree` with a known path before invoking the CLI. Those extension flows should pass that path using the explicit CLI path mode so branch-name collisions across repositories or sibling worktrees cannot change the selected target.

Alternatives considered:
- Keep sending the path as a plain positional filter and improve fuzzy scoring: rejected because any fuzzy strategy still risks ambiguity and does not match the explicit user selection in the UI.
- Pass repository-plus-branch as a composite filter: rejected because the panel already has the exact path and path identity is the most stable key available today.

## Risks / Trade-offs

- [Users may assume `--path` accepts partial paths] -> Document that switch path mode requires an exact worktree path and keep the existing fuzzy mode available without the flag.
- [Path normalization differences could create false negatives] -> Normalize both the CLI argument and discovered candidate paths before comparison and cover the behavior in tests.
- [Extension and CLI behavior could drift if only one side changes] -> Treat the CLI flag and extension invocation update as one implementation unit with tests on both repositories.

## Migration Plan

1. Add `--path` handling and exact-path candidate resolution to `repos/arashi/`.
2. Update `repos/arashi-vscode/` switch argument construction so extension-driven exact selections use `--path`.
3. Refresh docs and skills guidance if switch troubleshooting or examples mention extension-driven switching.
4. Validate the duplicated-branch scenario from issue `#131` with automated coverage and manual verification.

Rollback is low risk because the change is additive. Reverting the new `--path` support and its extension call site restores the previous fuzzy-only behavior without any data migration.

## Open Questions

- None.
