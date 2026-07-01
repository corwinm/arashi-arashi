## Why

Git can retain stale worktree metadata when a coordinated worktree directory is deleted or otherwise gets out of sync with the repository. Today those prunable entries can still appear in `arashi remove`, even though they are not removable workspaces and should instead be cleaned up with Git's prune flow.

## What Changes

- Add an `arashi prune` command that discovers prunable Git worktree metadata across the configured Arashi repositories and cleans it up safely.
- Keep `arashi remove` focused on existing worktrees by excluding prunable entries from its interactive choices, branch/path target resolution, and JSON summaries.
- Report prune results per repository, including dry-run visibility before mutation and clear handling for repositories with nothing to prune.
- Add command tests for stale/prunable worktree metadata and companion documentation for the new command and the updated `remove` behavior.

## Capabilities

### New Capabilities
- `worktree-pruning`: Defines how Arashi discovers, reports, and prunes stale Git worktree metadata across coordinated repositories.

### Modified Capabilities
- `machine-readable-cli-output`: Adds JSON output expectations for the new `prune` command.

## Impact

- `repos/arashi`: CLI command registration, worktree-list parsing, prune execution, remove filtering, tests, and README/command help where applicable.
- `repos/arashi-docs`: command reference and workflow guidance for `arashi prune` and stale worktree cleanup.
- `repos/arashi-skills`: agent guidance if existing workflows mention cleanup via `arashi remove` or worktree maintenance.
- No external dependencies are expected; implementation should use Git worktree commands already available in the CLI environment.
