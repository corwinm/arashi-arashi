## Why

Worktree locations are currently not configurable, which makes it hard to fit different repository layouts and team preferences. We need a first-class configuration option now so users can place generated worktrees in predictable locations such as a sibling directory, repo root, or a managed subdirectory.

## What Changes

- Add a workspace configuration option that controls the base directory used when creating worktrees.
- Support common relative path inputs including `../`, `.`, `./`, and `.arashi/worktrees`, with optional trailing slashes.
- Normalize and resolve configured paths consistently before worktree creation.
- Default to `.arashi/worktrees/` when the option is omitted.
- Ensure the default managed worktree directory is ignored by git when needed.

## Capabilities

### New Capabilities
- `configurable-worktree-location`: Allow users to configure where Arashi creates worktrees, including defaulting, normalization, and path resolution behavior.

### Modified Capabilities
- None.

## Impact

- Configuration loading and validation in `repos/arashi` (`.arashi/config.json` schema and parsing logic).
- Worktree creation/orchestration flows that derive destination paths.
- Repository setup behavior related to ignore rules for default worktree directories.
- Command and integration tests that verify location resolution and defaults across supported path styles.
