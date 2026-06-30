## Why

Partial coordinated worktrees are useful when a change only touches a subset of child repositories, but the current flow makes the parent meta-repo feel optional during interactive create and then treats intentionally omitted child repositories as noisy status errors. When a developer later decides they need an omitted child repo, `arashi clone` should extend the current coordinated worktree instead of cloning that repo's default branch.

## What Changes

- Make the parent/meta repository mandatory for interactive `arashi create -i` selection while still letting the user choose which child repositories to include.
- Hide missing configured child repositories from default and short `arashi status` output; keep them visible in `arashi status --verbose` and structured JSON so users can intentionally inspect incomplete partial worktrees.
- Teach `arashi clone` to recognize missing repositories inside a coordinated worktree and create matching branch worktrees for the selected repos from their existing source clones instead of cloning the default branch from remote.
- Preserve the existing clone behavior for ordinary workspaces where no coordinated source repository can be found.

## Capabilities

### New Capabilities
- `partial-worktree-completion`: Extend partial coordinated worktrees by adding missing child repositories on the current worktree branch.

### Modified Capabilities
- `create-command-defaults`: Interactive create selection always includes the parent/meta repository and only prompts for child repository selection.
- `status-command`: Missing configured child repositories are hidden from non-verbose human status output while remaining visible in verbose and JSON output.

## Impact

- Affected CLI code: `repos/arashi/src/commands/create.ts`, `repos/arashi/src/core/worktree.ts`, `repos/arashi/src/commands/status.ts`, `repos/arashi/src/commands/clone.ts`, and related helper modules/tests.
- Affected docs/skills should be reviewed after implementation because the create/status/clone workflow changes user guidance for partial coordinated worktrees.
- No new external dependencies are expected.
