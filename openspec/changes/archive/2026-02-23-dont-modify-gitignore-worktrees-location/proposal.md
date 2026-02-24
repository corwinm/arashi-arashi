## Why

Arashi currently appends `.arashi/worktrees/` to `.gitignore` when the default managed worktree location is used. Git already excludes worktree administrative paths via built-in behavior, so mutating user `.gitignore` files is redundant and creates unnecessary repository noise.

## What Changes

- Stop automatically adding `.arashi/worktrees/` to `.gitignore` during setup/init flows.
- Preserve existing `.gitignore` contents exactly as authored by the user.
- Update behavior documentation and tests so default worktree-location setup no longer expects `.gitignore` modification.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `configurable-worktree-location`: remove the requirement that default managed worktree location must be written to `.gitignore`, and require setup/init to avoid modifying ignore files for this path.

## Impact

- Affected specs: `openspec/specs/configurable-worktree-location/spec.md` (via delta).
- Affected implementation area: initialization/setup config flows in `repos/arashi/` that currently update `.gitignore`.
- Affected tests: integration/unit coverage asserting `.gitignore` mutation for default worktree location.
- No API or CLI flag changes; behavior change is limited to filesystem side effects.
