## Why

Arashi work often starts before a coordinated worktree exists, leaving useful uncommitted edits stranded in the wrong workspace. Users need a safe, explicit way to carry those edits into a new or existing coordinated worktree without hand-copying files or losing changes across parent and child repositories.

## What Changes

- Add a worktree-change movement workflow that can transfer uncommitted changes between coordinated workspaces across the parent repository and matching child repositories.
- Add an `arashi move` command for moving uncommitted changes from one workspace to another, with explicit source/target arguments and interactive selection when either side is omitted.
- Add an `arashi create` flag that creates a coordinated worktree and moves compatible uncommitted changes into it as part of the create flow.
- When `arashi create` detects uncommitted changes but no move flag was provided, show a concise help message with the exact follow-up command to move the changes into the newly created worktree.
- Preserve safety by refusing ambiguous/destructive transfers unless the user explicitly chooses a source, target, and conflict behavior.

## Capabilities

### New Capabilities
- `worktree-change-movement`: Moving uncommitted working-tree changes between coordinated Arashi workspaces, including the `arashi move` command and create-time transfer flow.

### Modified Capabilities
- `create-command-defaults`: `arashi create` gains dirty-workspace detection, a create-time move flag, and post-create guidance when uncommitted changes remain in the current workspace.

## Impact

- Affected CLI code: `repos/arashi/src/commands/create.ts`, `repos/arashi/src/index.ts`, new command/core helpers under `repos/arashi/src/commands/` and `repos/arashi/src/core/` or `repos/arashi/src/lib/`.
- Affected tests: unit and integration coverage in `repos/arashi/tests/` for source/target resolution, dirty detection, safe move semantics, create guidance, and multi-repo matching behavior.
- Affected docs/guidance: companion updates in `repos/arashi-docs` and `repos/arashi-skills` for the new `arashi move` workflow and `arashi create` flag.
- No breaking changes are intended; existing create behavior remains unchanged unless the new flag is used or informational guidance is shown.
