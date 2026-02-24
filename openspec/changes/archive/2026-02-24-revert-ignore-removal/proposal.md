## Why

Recent behavior no longer updates `.gitignore` with the configured worktree location. This causes managed worktree directories to appear as untracked files and reintroduces repository noise for initialized workspaces.

## What Changes

- Restore `.gitignore` updates so initialization adds the active worktree location ignore entry, not only the managed repos path.
- Preserve idempotent ignore behavior so repeated init/setup flows do not duplicate existing entries.
- Keep path normalization consistent so equivalent worktree location variants produce one stable ignore pattern.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `configurable-worktree-location`: Update ignore requirements so `.gitignore` tracks the configured managed worktree location entry in an idempotent, normalized way.

## Impact

- Affected spec: `openspec/specs/configurable-worktree-location/spec.md`
- Affected code: `repos/arashi/src/commands/init.ts` (gitignore pattern selection and output)
- Affected tests: `repos/arashi/tests/integration/init.test.ts` (custom worktree directory ignore behavior)
