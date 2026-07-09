## Why

`arashi remove` can delete coordinated worktrees and local branches across every configured repository. Users and agents need a non-mutating preview that shows the exact cleanup plan, blockers, and hook context before approving destructive removal.

## What Changes

- Add `arashi remove --dry-run` to resolve the same target selection, dirty checks, branch presence, skipped main worktrees, and remove hook discovery as a real remove run without removing worktrees, deleting branches, detaching worktrees, or executing hooks.
- Clearly mark human output as a preview and list the worktree removals, branch deletions, skipped/missing repos, dirty blockers, and configured `pre-remove` / `post-remove` hooks that would be involved.
- Add `arashi remove --dry-run --json` as a structured removal plan suitable for agents and automation.
- Document the workflow in CLI docs, docs site command reference, and Arashi skill guidance.
- No breaking changes: existing `arashi remove` mutation behavior remains unchanged when `--dry-run` is not supplied.

## Capabilities

### New Capabilities
- `remove-dry-run-preview`: Non-mutating `arashi remove` preview behavior, including human preview output, operation planning, blockers, option effects, and hook context.

### Modified Capabilities
- `machine-readable-cli-output`: Extend the existing JSON contract with a structured `arashi remove --dry-run --json` removal plan.

## Impact

- `repos/arashi`: remove command options, planning helpers, summary/JSON formatting, and unit/integration tests.
- `repos/arashi-docs`: command reference updates for dry-run preview usage and JSON automation examples.
- `repos/arashi-skills`: command guidance updates so agents prefer dry-run before destructive cleanup when uncertainty exists.
